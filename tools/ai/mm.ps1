<#
mm.ps1 - Metal Master AI helper (Gemini CLI)
Windows-friendly. No Claude required.

Modes:
- Default: If goal looks like "scan/suggest/audit", generate PLAN only
- Implement: Generate PLAN + PATCH.diff (unified diff)
Switches:
-Mode Audit|Implement  (optional; auto-detected if not provided)
-Apply                (only in Implement mode) auto-apply PATCH.diff via git apply
-NoBranch             (skip auto-branch creation)

Usage:
  .\tools\ai\mm.ps1 "scan whole repo and make suggestions"
  .\tools\ai\mm.ps1 "add timing-grade results object" -Mode Implement
  .\tools\ai\mm.ps1 "add timing-grade..." -Mode Implement -Apply
#>

param(
  [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
  [string[]] $Goal,

  [ValidateSet("Auto", "Audit", "Implement")]
  [string] $Mode = "Auto",

  [switch] $Apply,

  [switch] $NoBranch
)

$ErrorActionPreference = "Stop"

# ---- UTF-8 everywhere (prevents âœ… mojibake) ----
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch {}
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'

# ---- Helpers ----
function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "❌ $msg" -ForegroundColor Red }

function Assert-Tool($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Err "Required tool not found in PATH: $name"
    exit 1
  }
}

function Assert-CleanGit {
  $status = git status --porcelain
  if ($status) {
    Write-Err "Working tree not clean. Commit or stash first."
    Write-Host $status
    exit 1
  }
}

function New-WorkBranch {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $name = "ai/$ts"
  git checkout -b $name | Out-Null
  Write-Ok "Created branch $name"
  return $name
}

function Load-OptionalFile($path) {
  if (Test-Path $path) { return (Get-Content $path -Raw) }
  return ""
}

function Detect-Mode($goalText) {
  if ($Mode -ne "Auto") { return $Mode }

  # keywords that mean "don’t try to patch files"
  $auditWords = @(
    "scan","audit","review","suggest","recommend","analysis","analyze",
    "security","lint","improve","refactor suggestions","whole repo","codebase"
  )

  $g = $goalText.ToLowerInvariant()
  foreach ($w in $auditWords) {
    if ($g -like "*$w*") { return "Audit" }
  }
  return "Implement"
}

function Extract-Section($text, $begin, $end) {
  # Avoid regex quoting issues: build a safe DOTALL regex with single quotes
  $pattern = '(?s)' + [regex]::Escape($begin) + '\s*(.*?)\s*' + [regex]::Escape($end)
  $m = [regex]::Match($text, $pattern)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return $null
}

# ---- Start ----
Assert-Tool git
Assert-Tool gemini

$goalText = ($Goal -join " ").Trim()
if (-not $goalText) {
  Write-Err "Goal cannot be empty."
  exit 1
}

# Git safety
Assert-CleanGit

$branch = ""
if (-not $NoBranch) {
  $branch = New-WorkBranch
} else {
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  Write-Warn "NoBranch set; using current branch: $branch"
}

$resolvedMode = Detect-Mode $goalText
Write-Ok "Mode: $resolvedMode"

# Load rules if present
$geminiRules = Load-OptionalFile "GEMINI.md"
if ($geminiRules) { Write-Ok "Loaded GEMINI.md" } else { Write-Warn "GEMINI.md not found; using built-in guidance." }

$repoNotes = @"
Repo context:
- TypeScript monorepo (Next.js App Router web, Expo mobile, shared packages)
- Supabase backend
- Keep scope tight, minimal changes, no repo-wide formatting changes.
- Do not include secrets or .env in outputs.
"@

# Outputs
$planPath = "PLAN.md"
$diffPath = "PATCH.diff"

# ---- Build prompt ----
if ($resolvedMode -eq "Audit") {
  $prompt = @"
You are a senior engineer doing a repo-wide audit.
Produce ONLY a plan and recommendations. Do NOT output a patch.

Output format:
---BEGIN PLAN---
1) Goal (1 sentence)
2) Quick repo map assumptions (bullets)
3) Findings (bullets, grouped by: correctness, architecture, performance, DX, security)
4) Top 10 prioritized recommendations (numbered, with file paths if known)
5) “Fast wins” (things I can do in <1 hour)
6) “Bigger bets” (things I can do in 1-3 days)
7) Verification checklist (Windows-friendly commands)
---END PLAN---

$repoNotes

Project-specific instructions (if any):
$geminiRules

GOAL:
$goalText
"@
} else {
  if ($Apply -and $resolvedMode -ne "Implement") {
    Write-Warn "-Apply ignored because mode is not Implement."
  }

  $prompt = @"
You are the architect + implementer. You MUST output TWO sections, in this exact order:

---BEGIN PLAN---
(Write a detailed step-by-step plan with files to touch, acceptance criteria, and Windows-friendly verify commands.)
---END PLAN---

---BEGIN PATCH---
(Write a unified diff patch implementing the plan. Use 'diff --git' format. Only include real diffs.)
---END PATCH---

$repoNotes

Project-specific instructions (if any):
$geminiRules

GOAL:
$goalText
"@
}

# ---- Run Gemini (positional prompt; no --prompt) ----
Write-Info "Running Gemini..."
$raw = & gemini $prompt

if (-not $raw) {
  Write-Err "Gemini returned no output."
  exit 1
}

# ---- Parse + write outputs ----
$plan = Extract-Section $raw "---BEGIN PLAN---" "---END PLAN---"
if (-not $plan) {
  Write-Err "Could not find PLAN section in Gemini output."
  exit 1
}
$plan | Out-File $planPath
Write-Ok "Wrote $planPath"

if ($resolvedMode -eq "Implement") {
  $patch = Extract-Section $raw "---BEGIN PATCH---" "---END PATCH---"
  if (-not $patch) {
    Write-Err "Could not find PATCH section in Gemini output."
    Write-Warn "Tip: re-run with a narrower goal, or use -Mode Audit."
    exit 1
  }

  $patch | Out-File $diffPath
  Write-Ok "Wrote $diffPath"

  if ($patch -notmatch "diff --git ") {
    Write-Warn "PATCH.diff does not contain 'diff --git'. It may not apply cleanly."
  }

  if ($Apply) {
    Write-Info "Applying patch via git apply..."
    try {
      git apply --whitespace=nowarn $diffPath
      Write-Ok "Patch applied."
    } catch {
      Write-Err "Patch failed to apply."
      Write-Warn "Try: git apply --reject PATCH.diff (creates .rej files), or apply manually."
      throw
    }
  }
}

# ---- Next steps ----
Write-Host ""
Write-Info "Next steps:"
Write-Host "  Review plan:   notepad $planPath"
if ($resolvedMode -eq "Implement") {
  Write-Host "  Review patch:  notepad $diffPath"
  Write-Host "  Apply patch:   git apply $diffPath"
}
Write-Host "  Inspect:       git diff"
Write-Host "  Status:        git status"
Write-Host "  Commit:        git add . ; git commit -m `"$goalText`""
Write-Host "  Push:          git push -u origin $branch"
Write-Ok "Branch: $branch"
