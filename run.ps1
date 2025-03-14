# Get the repository name from the current directory
$repoName = Split-Path -Path (Get-Location) -Leaf

# Set the environment variable for the base path
$env:NEXT_PUBLIC_BASE_PATH = "/$repoName"

Write-Host "Building with base path: $env:NEXT_PUBLIC_BASE_PATH"

# Clean any previous builds
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

# Build the project
npm run build

# Verify the output directory
Write-Host "Listing files in the out directory:"
Get-ChildItem -Path "out" | Format-Table Name, Length

# Serve the static files locally (optional)
Write-Host "To test locally, you can use a simple HTTP server to serve the 'out' directory"
Write-Host "For example, with Node.js: npx serve out" 