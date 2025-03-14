# Get the repository name from the current directory
$repoName = Split-Path -Path (Get-Location) -Leaf

# Set the environment variable for the base path
$env:NEXT_PUBLIC_BASE_PATH = "/$repoName"

Write-Host "Building with base path: $env:NEXT_PUBLIC_BASE_PATH"

# Build the project
npm run build

# Serve the static files locally (optional)
Write-Host "To test locally, you can use a simple HTTP server to serve the 'out' directory"
Write-Host "For example, with Node.js: npx serve out" 