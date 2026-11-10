# push-to-github.ps1
# Automatically installs Git if not present, stages all files, sets remote origin,
# commits with 'Fix Vercel api route structure', and pushes to main.

$ErrorActionPreference = "Stop"
Set-Location "C:\Users\emihi\.gemini\antigravity\scratch\china-dual-lens"

# 1. Ensure git is in PATH or install via winget
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Installing Git via winget..." -ForegroundColor Cyan
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") + ";C:\Program Files\Git\cmd"
}

# 2. Initialize repository if needed
if (-not (Test-Path ".git")) {
    git init -b main
} else {
    git branch -M main
}

# 3. Configure remote origin
$remoteUrl = "https://github.com/Mihail1231/china-dual-lens-frontend.git"
$existingRemotes = git remote
if ($existingRemotes -contains "origin") {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

# 4. Stage all files, commit, and push to main
git add .
git commit -m "Fix Vercel api route structure"
git push -u origin main --force
Write-Host "Successfully pushed to $remoteUrl (main)!" -ForegroundColor Green
