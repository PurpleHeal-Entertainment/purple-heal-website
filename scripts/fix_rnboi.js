const fs = require('fs');
const path = require('path');

// Paths
const dataPath = path.join(__dirname, '../data/artists.json');
const imagesDir = path.join(__dirname, '../assets/images/artists');

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Read Data
const rawData = fs.readFileSync(dataPath, 'utf8');
const artists = JSON.parse(rawData);

// Target Artist: R.N BOI (Index 0 usually, but let's find by name)
const artistIndex = artists.findIndex(a => a.name.includes('R.N BOI'));

if (artistIndex === -1) {
    console.error("Artist R.N BOI not found!");
    process.exit(1);
}

const artist = artists[artistIndex];

// Check if image is Base64
if (artist.image && artist.image.startsWith('data:image')) {
    console.log(`Found Base64 image for ${artist.name}. Size: ${artist.image.length} chars.`);

    // Extract Base64 Data
    const matches = artist.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
        console.error('Invalid input string');
        process.exit(1);
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const filename = 'rnboi-profile.jpg';
    const filePath = path.join(imagesDir, filename);

    // Write File
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`Saved image to ${filePath}`);

    // Update JSON with GitHub Raw URL
    // NOTE: Using the raw.githubusercontent URL pattern as used in the project
    const rawUrl = `https://raw.githubusercontent.com/PurpleHeal-Entertainment/purple-heal-website/master/assets/images/artists/${filename}`;

    artist.image = rawUrl;
    console.log(`Updated artist image URL to: ${rawUrl}`);

    // Clean up any legacy fields if present
    if (artist.imageData) delete artist.imageData;

    // Save JSON
    fs.writeFileSync(dataPath, JSON.stringify(artists, null, 2));
    console.log("Updated artists.json successfully.");

} else {
    console.log("Artist image is already a URL or empty. No action needed.");
    console.log("Current Value:", artist.image.substring(0, 50) + "...");
}
