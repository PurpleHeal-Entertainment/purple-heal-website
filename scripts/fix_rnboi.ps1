# Path to artists.json
$jsonPath = "data/artists.json"
$imageDir = "assets/images/artists"

# Create directory if it doesn't exist
if (!(Test-Path -Path $imageDir)) {
    New-Item -ItemType Directory -Path $imageDir | Out-Null
}

# Read JSON content
$jsonContent = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Find R.N BOI (assuming it's the first one based on previous view, but let's iterate to be safe)
foreach ($artist in $jsonContent) {
    if ($artist.name -like "*R.N BOI*") {
        Write-Host "Found Artist: $($artist.name)"
        
        if ($artist.image -like "data:image*") {
            Write-Host "Found Base64 image. Processing..."
            
            # Extract Base64 part
            # Format is usually data:image/jpeg;base64,.....
            $base64String = $artist.image -replace '^data:image\/[a-z]+;base64,', ''
            
            # Convert to Bytes
            $bytes = [Convert]::FromBase64String($base64String)
            
            # Define new filename
            $filename = "rnboi-profile.jpg"
            $filePath = Join-Path $imageDir $filename
            
            # Save Image
            [IO.File]::WriteAllBytes($filePath, $bytes)
            Write-Host "Saved image to $filePath"
            
            # Update JSON Object
            $artist.image = "https://raw.githubusercontent.com/PurpleHeal-Entertainment/purple-heal-website/master/assets/images/artists/$filename"
            
            # Remove legacy field if exists
            if ($artist.psobject.Properties.Match('imageData').Count -gt 0) {
                $artist.psobject.Properties.Remove('imageData')
            }
            
            Write-Host "Updated JSON record."
        }
        else {
            Write-Host "Image is already a URL or invalid."
        }
        break
    }
}

# Save back to JSON
$jsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
Write-Host "Saved updated artists.json"
