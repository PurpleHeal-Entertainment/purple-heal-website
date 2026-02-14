# Path to artists.json
$jsonPath = "data/artists.json"

# Read JSON content
$jsonContent = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Check if it is already an array (in PS terms, if it has a Count property and isn't a single PSCustomObject, or verify type)
# But simpler: we know it is currently a single object.
# We will just force it into an array wrapper.

# If we just wrap it in @(), ConvertTo-Json will treat it as an array
$jsonArray = @($jsonContent)

# Save back to JSON
# -AsArray is crucial if using modern PS Core, but standard PS might not have it. 
# Using @() and piping to ConvertTo-Json usually works.
$jsonArray | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Restored artists.json to Array format."
