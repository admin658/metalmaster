<#
mm.ps1 - Metal Master AI helper (Gemini CLI) - Full file version (Windows hardened)

What it does (safe + practical):
- Ensures clean git working tree
- (Optional) creates a new branch ai/YYYYMMDD-HHMMSS
- Builds a repo map that avoids black holes (node_modules, venvs, caches)
- Runs Gemini using positional prompt (no deprecated --prompt)
- Writes outputs into tools/ai/out/:
    - PLAN.md (always)
    - PATCH.diff (Implement mode only, if Gemini produces it)
- Optional -Apply to apply PATCH.diff via git apply
- Optional -Focus to target specific top-level areas (packages, netlify, tools, tests, etc.)

Modes:
- Audit: PLAN only (findings + suggestions)
- Implement: PLAN + PATCH.diff
- Auto: detect from goal text

Usage examples:
  .\tools\ai\mm.ps1 "scan whole repo and make suggestions"
  .\tools\ai\mm.ps1 "audit build/deploy + secrets hygiene" -Mode Audit -Depth 80
  .\tools\ai\mm.ps1 "Add MVP timing-grade results and store to Supabase" -Mode Implement
  .\tools\ai\mm.ps1 "Add MVP timing-grade..." -Mode Implement -Apply
  .\tools\ai\mm.ps1 "audit packages/web only" -Mode Audit -Focus packages
  .\tools\ai\mm.ps1 "implement change in netlify functions" -Mode Implement -Focus netlify,packages

Notes:
- This script does NOT require Claude.
- Gemini can't truly read your whole repo unless your Gemini CLI environment supports it.
  Repo-map helps Gemini make grounded suggestions anyway.

#>

param(
  [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
  [string[]] $Goal,

  [ValidateSet("Auto", "Audit", "Implement")]
  [string] $Mode = "Auto",

  [switch] $Apply,

  [switch] $NoBranch,

  [ValidateRange(10, 200)]
  [int] $Depth = 60,

  # Comma-separated list or array of top-level folders to focus on.
  # Examples: -Focus packages,netlify   OR   -Focus @("packages","tests")
  [string[]] $Focus = @()
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

  $auditWords = @(
    "scan","audit","review","suggest","recommend","analysis","analyze",
    "security","lint","improve","whole repo","codebase","architecture"
  )

  $g = $goalText.ToLowerInvariant()
  foreach ($w in $auditWords) {
    if ($g -like "*$w*") { return "Audit" }
  }
  return "Implement"
}

function Extract-Section($text, $begin, $end) {
  # robust DOTALL extraction without quote-terminator issues
  $pattern = '(?s)' + [regex]::Escape($begin) + '\s*(.*?)\s*' + [regex]::Escape($end)
  $m = [regex]::Match($text, $pattern)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return $null
}

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function Normalize-Focus([string[]] $focus) {
  if (-not $focus -or $focus.Count -eq 0) { return @() }

  # Allow a single string with commas: -Focus "packages,netlify"
  if ($focus.Count -eq 1 -and $focus[0] -like "*,*") {
    return ($focus[0].Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  }
  return ($focus | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Get-RepoFileList($paths, $limitPerPath) {
  # Hard excludes for your repo layout
  $excludeDirs = @(
    "node_modules", ".git", ".yarn", ".pytest_cache", ".venv", "venv",
    ".venv_audio", ".venv_basic_pitch", ".next", "dist", "build", "coverage",
    ".cache", ".turbo", ".zencoder", ".zenflow"
  )

  $all = New-Object System.Collections.Generic.List[string]

  foreach ($p in $paths) {
    if (-not (Test-Path $p)) { continue }

    $items =
      Get-ChildItem -Path $p -Recurse -File -Force -ErrorAction SilentlyContinue |
      Where-Object {
        $full = $_.FullName
        foreach ($xd in $excludeDirs) {
          if ($full -match [regex]::Escape("\$xd\")) { return $false }
        }
        return $true
      } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First $limitPerPath -ExpandProperty FullName

    foreach ($i in $items) {
      $rel = $i.Replace((Get-Location).Path + "\", "")
      $all.Add($rel)
    }
  }

  return ($all | Select-Object -Unique)
}

function Get-KeyConfigSnippets {
  $keyFiles = @(
    "README.md","SETUP.md","AGENTS.md",
    "package.json","tsconfig.json","yarn.lock",
    "netlify.toml","docker-compose.yml",
    "jest.config.cjs","jest.temp.config.cjs",
    ".eslintrc.json",".prettierrc.json",".yarnrc.yml",
    "CLAUDE.md","GEMINI.md"
  ) | Where-Object { Test-Path $_ }

  $snips = New-Object System.Collections.Generic.List[string]
  foreach ($kf in $keyFiles) {
    $content = Get-Content $kf -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    # Keep compact: first ~160 lines
    $lines = ($content -split "`r?`n")
    $take = [Math]::Min($lines.Count, 80)
    if ($take -le 0) { continue }
    $snippet = ($lines[0..($take-1)] -join "`n")

    $snips.Add("### $kf`n$snippet")
  }
  return $snips
}

function Get-TopLevelDirs {
  # Based on your repo listing; keep it relevant
  return @(
    "packages","netlify","tools","tests","alphatab","docs","dev-notes","ldocs",
    "metalmaster-video-pipeline","metal-master-vst-companion","vexflow","assets","agents"
  )
}

function Get-RepoMap([int] $depth, [string[]] $focusDirs) {
  $top = @"
Top-level (repo root) highlights:
- packages/ (main monorepo code)
- netlify/ + netlify.toml (deploy/functions)
- tools/ (scripts)
- tests/ (test harness)
- alphatab/ (tab playback)
- docs/, dev-notes/, ldocs/ (architecture + notes)
- metalmaster-video-pipeline/ (video pipeline)
- metal-master-vst-companion/ (audio/VST companion)
- vexflow/ (notation)
Other notable: .env, .env.local, .github/, .vscode/
"@

  $snips = Get-KeyConfigSnippets

  $targets = @()
  if ($focusDirs -and $focusDirs.Count -gt 0) {
    $targets = $focusDirs
  } else {
    $targets = Get-TopLevelDirs
  }

  $recent = Get-RepoFileList $targets $depth
  $recentBlock = "Recent/active files (by LastWriteTime, capped):`n" + ($recent -join "`n")

  $map = New-Object System.Collections.Generic.List[string]
  $map.Add($top)

  if ($snips.Count -gt 0) {
    $map.Add("Key config snippets (truncated):")
    $map.Add(($snips -join "`n`n"))
  } else {
    $map.Add("Key config snippets: (none found)")
  }

  if ($focusDirs -and $focusDirs.Count -gt 0) {
    $map.Add("Focus areas: " + ($focusDirs -join ", "))
  } else {
    $map.Add("Focus areas: (none; using default major dirs)")
  }

  $map.Add($recentBlock)

  return ($map -join "`n`n")
}

# ---- Start ----
Assert-Tool git
Assert-Tool gemini

$goalText = ($Goal -join " ").Trim()
if (-not $goalText) {
  Write-Err "Goal cannot be empty."
  exit 1
}

# Normalize focus
$focusDirs = Normalize-Focus $Focus

# Git safety
Assert-CleanGit

# Branch handling
$branch = ""
if (-not $NoBranch) {
  $branch = New-WorkBranch
} else {
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  Write-Warn "NoBranch set; using current branch: $branch"
}

$resolvedMode = Detect-Mode $goalText
Write-Ok "Mode: $resolvedMode"

# Load project rules (if any)
$geminiRules = Load-OptionalFile "GEMINI.md"
if ($geminiRules) { Write-Ok "Loaded GEMINI.md" } else { Write-Warn "GEMINI.md not found; using built-in guidance." }

# Build repo map
$repoMap = Get-RepoMap $Depth $focusDirs
Write-Ok "Built repo map (Depth=$Depth)"

# Output directory
$outDir = Join-Path "tools\ai" "out"
Ensure-Dir $outDir
$planPath = Join-Path $outDir "PLAN.md"
$diffPath = Join-Path $outDir "PATCH.diff"

# Context notes
$repoNotes = @"
Repo context:
- TypeScript monorepo (Next.js App Router web, Expo mobile, shared packages)
- Supabase backend
- Keep scope tight; do not do repo-wide formatting.
- Do not include secrets or .env.
- Prefer changes under packages/* and tests/*; netlify/ for deploy/functions.
- Avoid touching node_modules/ or any venv directories.
"@

# Build prompt
if ($resolvedMode -eq "Audit") {
  $prompt = @"
You are a senior engineer doing a repo-wide audit based on the repo map + config snippets below.
You may not have full file contents, so be explicit about assumptions and suggest concrete next inspection steps.

Output ONLY this section:

---BEGIN PLAN---
1) Goal (1 sentence)
2) Repo understanding (bullets)
3) Findings (grouped: correctness, architecture, performance, DX, security)
4) Top 15 prioritized recommendations (numbered; include target paths from repo map)
5) Fast wins (<1 hour)
6) Bigger bets (1-3 days)
7) Verification checklist (Windows-friendly commands)
---END PLAN---

$repoNotes

Project-specific instructions (if any):
$geminiRules

REPO MAP:
$repoMap

GOAL:
$goalText
"@
} else {
  $prompt = @"
You are the architect + implementer. Based on the repo map/config snippets below, produce:
1) a detailed execution plan
2) a unified diff patch implementing it

You MUST output TWO sections in this order:

---BEGIN PLAN---
(steps, files to touch, acceptance criteria, Windows-friendly verify commands)
---END PLAN---

---BEGIN PATCH---
(unified diff in 'diff --git' format; minimal changes; only touch files that plausibly exist in the repo map)
---END PATCH---

$repoNotes

Project-specific instructions (if any):
$geminiRules

REPO MAP:
$repoMap

GOAL:
$goalText
"@
}

# Run Gemini (positional prompt; no deprecated --prompt)
Write-Info "Running Gemini (stdin)..."

# Send prompt via stdin to avoid Windows command-line length limits
try {
  $raw = $prompt | & gemini
} catch {
  Write-Err "Gemini failed when reading prompt from stdin."
  throw
}

if (-not $raw) {
  Write-Err "Gemini returned no output."
  exit 1
}


# Parse outputs
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
      Write-Warn "Try: git apply --reject `"$diffPath`" (creates .rej files), or apply manually."
      throw
    }
  }
}

Write-Host ""
Write-Info "Outputs:"
Write-Host "  Plan:  $planPath"
if ($resolvedMode -eq "Implement") {
  Write-Host "  Patch: $diffPath"
}

Write-Host ""
Write-Info "Next steps:"
Write-Host "  Review plan:   notepad `"$planPath`""
if ($resolvedMode -eq "Implement") {
  Write-Host "  Review patch:  notepad `"$diffPath`""
  Write-Host "  Apply patch:   git apply `"$diffPath`""
}
Write-Host "  Inspect:       git diff"
Write-Host "  Status:        git status"
Write-Host "  Commit:        git add . ; git commit -m `"$goalText`""
Write-Host "  Push:          git push -u origin $branch"

Write-Ok "Branch: $branch"
Write-Ok "Done."
