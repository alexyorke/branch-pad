# Script to update the README.md with the actual GitHub username for the demo link

# Get the GitHub username from the remote URL
$remoteUrl = git config --get remote.origin.url
if ($remoteUrl -match "github.com[:/]([^/]+)/") {
    $username = $Matches[1]
    
    Write-Host "Detected GitHub username: $username"
    
    # Read the README.md file
    $readmePath = "README.md"
    $content = Get-Content -Path $readmePath -Raw
    
    # Replace the placeholder with the actual username
    $updatedContent = $content -replace '\[your-username\]', $username
    
    # Write the updated content back to the file
    Set-Content -Path $readmePath -Value $updatedContent
    
    Write-Host "README.md updated with the correct demo link: https://$username.github.io/branch-pad/"
} else {
    Write-Host "Could not detect GitHub username from remote URL. Please update the README.md manually."
    Write-Host "Remote URL: $remoteUrl"
} 