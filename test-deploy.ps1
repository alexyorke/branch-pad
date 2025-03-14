# Script to test the deployment locally using a simple HTTP server

# First, build the project
Write-Host "Building the project..."
./run.ps1

# Check if npx is available
$npxAvailable = $null
try {
    $npxAvailable = Get-Command npx -ErrorAction SilentlyContinue
} catch {
    $npxAvailable = $null
}

if ($npxAvailable) {
    # Start a local server to test the deployment
    Write-Host "Starting a local server to test the deployment..."
    Write-Host "Your site will be available at: http://localhost:3000/branch-pad/"
    Write-Host "Press Ctrl+C to stop the server"
    npx serve --listen 3000 out
} else {
    Write-Host "npx is not available. Please install Node.js to use the 'serve' package."
    Write-Host "Alternatively, you can use any HTTP server to serve the 'out' directory."
    Write-Host "For example, with Python: python -m http.server 3000 --directory out"
} 