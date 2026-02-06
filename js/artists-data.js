// ========================================
// Purple Heal Entertainment - Artist Data
// ========================================

// Check for admin panel data first (now from IndexedDB)
async function getArtistsDataFromDB() {
    // Load ONLY from IndexedDB (no fallback to hardcoded data)
    try {
        if (typeof loadArtistsDB !== 'undefined') {
            const artists = await loadArtistsDB();
            if (artists && artists.length > 0) {
                // Convert array to object keyed by index for backward compatibility
                const artistsObj = {};
                artists.forEach((artist, index) => {
                    artistsObj[index.toString()] = artist;
                });
                return artistsObj;
            }
        }
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
    }

    // Return empty object if no data found (no hardcoded fallback)
    return {};
}

// Synchronous wrapper for backward compatibility
function getArtistsData() {
    // Return a promise that resolves to artists data
    // This will be handled by loadArtistProfile
    return getArtistsDataFromDB();
}

// Function to load artist profile data
async function loadArtistProfile(artistId) {
    const artistsData = await getArtistsData();
    const artist = artistsData[artistId];

    if (!artist) {
        console.error('Artist not found');
        return;
    }

    // Find the REAL index in the IndexedDB array
    const artistsArray = await loadArtistsDB();
    const realIndex = artistsArray.findIndex(a => a.name === artist.name);
    console.log(`🔍 Artist ID from URL: ${artistId}, Real array index: ${realIndex}`);

    // Update artist info
    const artistName = document.getElementById('artist-name');
    const artistGenre = document.getElementById('artist-genre');
    const artistBio = document.getElementById('artist-bio');
    const artistImage = document.getElementById('artist-image');

    if (artistName) artistName.textContent = artist.name;
    if (artistGenre) artistGenre.textContent = artist.genre;
    if (artistBio) artistBio.textContent = artist.bio;
    if (artistImage) {
        artistImage.src = artist.image || artist.imageData;
        artistImage.onload = () => { artistImage.style.opacity = '1'; };
    }

    // Update social media links
    const spotifyBtn = document.getElementById('spotifyBtn');
    const youtubeBtn = document.getElementById('youtubeBtn');
    const appleMusicBtn = document.getElementById('appleMusicBtn');
    const instagramBtn = document.getElementById('instagramBtn');
    const tiktokBtn = document.getElementById('tiktokBtn');

    // Handle possible data formats for socials
    let socials = artist.socials || {};
    if (typeof socials === 'string') {
        try { socials = JSON.parse(socials); } catch (e) {
            console.error('❌ Error parsing socials string:', e);
            socials = {};
        }
    }

    const spotify = socials.spotify || artist.spotifyUrl;
    const youtube = socials.youtube || artist.youtubeUrl;
    const appleMusic = socials.appleMusic || artist.appleMusicUrl;
    const instagram = socials.instagram || artist.instagramUrl;
    const tiktok = socials.tiktok || artist.tiktokUrl;

    if (spotifyBtn && spotify) {
        spotifyBtn.href = spotify;
        spotifyBtn.style.display = 'inline-flex';
    }
    if (youtubeBtn && youtube) {
        youtubeBtn.href = youtube;
        youtubeBtn.style.display = 'inline-flex';
    }
    if (appleMusicBtn && appleMusic) {
        appleMusicBtn.href = appleMusic;
        appleMusicBtn.style.display = 'inline-flex';
    }
    if (instagramBtn && instagram) {
        instagramBtn.href = instagram;
        instagramBtn.style.display = 'inline-flex';
    }
    if (tiktokBtn && tiktok) {
        tiktokBtn.href = tiktok;
        tiktokBtn.style.display = 'inline-flex';
    }



    // Load latest YouTube video
    const latestVideoSection = document.getElementById('latestVideo');
    const youtubePlayer = document.getElementById('youtubePlayer');

    if (latestVideoSection && youtubePlayer && artist.latestVideoId) {
        // Show the section
        latestVideoSection.style.display = 'block';

        // Set YouTube embed URL - using official embed format (no extra parameters)
        const videoUrl = `https://www.youtube.com/embed/${artist.latestVideoId}`;

        youtubePlayer.src = videoUrl;
    } else if (latestVideoSection) {
        // Hide section if no video ID
        latestVideoSection.style.display = 'none';
    }

    // Update page title
    document.title = `${artist.name} | Purple Heal Entertainment`;
}

// Export for use in artist-profile.html
if (typeof window !== 'undefined') {
    window.loadArtistProfile = loadArtistProfile;
    window.getArtistsData = getArtistsData;
    window.artistsData = getArtistsData(); // For backwards compatibility
}
