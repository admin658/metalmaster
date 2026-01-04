param(
  [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
  [string[]] $Goal
)

$ErrorActionPreference = "Stop"
$goalText = $Goal -join " "

function Assert-CleanGit {
  $status = git status --porcelain
  if ($status) {
    Write-Host "❌ Working tree not clean. Commit/stash first." -ForegroundColor Red
    Write-Host $status
    exit 1
  }
}

function New-WorkBranch {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $name = "ai/$ts"
  git checkout -b $name | Out-Null
  Write-Host "✅ Created branch $name" -ForegroundColor Green
  return $name
}

Assert-CleanGit
$branch = New-WorkBranch

# 1) Gemini: produce an execution-ready plan
$plan = & gemini --prompt @"
You are the architect. Create an implementation plan for this goal:

$goalText

Follow the output format in GEMINI.md. Be specific about files and acceptance criteria.
"@

$planPath = "PLAN.md"
$plan | Out-File -Encoding utf8 $planPath
Write-Host "✅ Wrote $planPath" -ForegroundColor Green

# 2) Claude: implement the plan
# Note: some Claude Code setups use -p; others use --print.
# If your Claude binary differs, change the invocation here once and you’re done.
& claude -p @"
You are the implementer. Read PLAN.md and execute it.
- Make minimal, correct changes.
- Run verification commands listed in PLAN.md (or the closest equivalents for this repo).
- Summarize: diffs, files touched, how to test.
"@

Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  git diff"
Write-Host "  git status"
Write-Host "  git log --oneline --decorate -5"
Write-Host "Then open a PR from branch: $branch"
