// ========================================
// Purple Heal Admin - Panel Management
// ========================================

// Toast notification system
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.getElementById('admin-toast');
    if (existingToast) existingToast.remove();

    // Create toast container if doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none; /* Allow clicks through container */
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'admin-toast';

    const colors = {
        success: { bg: '#1a1a2e', border: '#9B59B6', icon: '✅' },
        error: { bg: '#1a1a2e', border: '#e74c3c', icon: '❌' },
        warning: { bg: '#1a1a2e', border: '#f39c12', icon: '⚠️' },
        info: { bg: '#1a1a2e', border: '#3498db', icon: 'ℹ️' }
    };

    const config = colors[type] || colors.success;

    toast.style.cssText = `
        background: ${config.bg};
        border: 2px solid ${config.border};
        border-radius: 12px;
        padding: 16px 24px;
        color: white;
        font-family: 'Oxanium', sans-serif;
        font-size: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    toast.innerHTML = `
        <span style="font-size: 20px;">${config.icon}</span>
        <span>${message.replace(/^[✅❌⚠️ℹ️]\s*/, '')}</span>
        <button onclick="this.parentElement.remove()" style="
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            font-size: 18px;
            margin-left: 10px;
            padding: 0;
        ">×</button>
    `;

    // Add animation keyframes
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Tab switching
// Tab switching
function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);

    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));

    // Hide ALL tab contents explicitly using inline styles
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Force hide
    });

    // Add active class to clicked tab button
    const targetButton = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }

    // Show corresponding tab content
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block'; // Force show
        console.log('✅ Tab switched successfully');
    } else {
        console.error('❌ Tab content not found:', tabName);
    }
}

// Storage functions - Using IndexedDB for unlimited storage
async function saveArtists(artists) {
    console.log('saveArtists called with:', artists);
    console.log('Is array?', Array.isArray(artists));
    console.log('Length:', artists?.length);

    try {
        console.log('Calling saveArtistsDB...');
        await saveArtistsDB(artists);
        console.log('saveArtistsDB completed successfully ✅');
        return true;
    } catch (error) {
        console.error('❌ Error in saveArtists:', error);
        showToast('Error al guardar artistas. Por favor recarga la página.', 'error');
        return false;
    }
}

async function loadArtists() {
    try {
        const artists = await loadArtistsDB();
        console.log('✅ Artists loaded from IndexedDB:', artists?.length || 0, 'artists');
        return artists || [];
    } catch (error) {
        console.error('❌ Error loading artists:', error);
        return [];
    }
}

// Initialize admin panel
async function initAdmin() {
    try {
        console.log('🚀 initAdmin called');

        // Wait a bit to ensure DB is initialized
        await new Promise(resolve => setTimeout(resolve, 100));

        const artists = await loadArtists();
        console.log('✅ Loaded artists:', artists?.length || 0, 'artists');

        renderArtistsList(artists);

        // Load Tours
        const tours = await loadTours();
        console.log('✅ Loaded tours:', tours?.length || 0, 'tours');
        renderToursList(tours);

        // Initialize form listener for adding new artists
        const artistForm = document.getElementById('artistForm');
        if (artistForm) {
            artistForm.addEventListener('submit', handleAddArtist);
            console.log('✅ Artist form listener attached');
        } else {
            console.warn('⚠️ artistForm not found in DOM');
        }
    } catch (error) {
        console.error('❌ Error in initAdmin:', error);
        showToast('Error al cargar el panel. Por favor recarga la página.', 'error');
    }
}

// Render artists list
function renderArtistsList(artists) {
    const container = document.getElementById('artists-list');
    if (!container) {
        console.warn('⚠️ artists-list container not found');
        return;
    }

    console.log('📝 Rendering artists list:', artists?.length || 0);

    if (!artists || artists.length === 0) {
        container.innerHTML = '<p style="color: var(--ph-gray-lighter); text-align: center;">No hay artistas. Agrega uno nuevo.</p>';
        return;
    }

    container.innerHTML = artists.map((artist, index) => `
        <div class="artist-item">
            <div>
                <h3>${artist.name}</h3>
                <p style="color: var(--ph-gray-lighter); font-size: var(--fs-sm); margin-top: var(--space-xs);">
                    ${artist.genre || 'Sin genero'} | ${artist.albums?.length || 0} albumes | ${artist.merch?.length || 0} productos
                </p>
            </div>
            <div class="admin-card-actions">
                <button onclick="editArtist(${index})" class="ph-button ph-button--outline" style="padding: var(--space-sm) var(--space-md);">
                    EDITAR
                </button>
                <button onclick="deleteArtist(${index})" class="ph-button ph-button--outline" style="padding: var(--space-sm) var(--space-md); border-color: #e74c3c; color: #e74c3c;">
                    ELIMINAR
                </button>
            </div>
        </div>
    `).join('');
}

// Delete artist
function deleteArtist(index) {
    showDeleteModal(async () => {
        const artists = await loadArtists();
        artists.splice(index, 1);
        await saveArtists(artists);
        showToast('Artista eliminado exitosamente.');
        renderArtistsList(artists);
    });
}

// Show add artist form
function showAddArtistForm() {
    // Hide artists list card
    const artistsCard = document.querySelector('#artists-tab > .ph-card');
    if (artistsCard) artistsCard.style.display = 'none';

    // Show add artist form
    const formContainer = document.getElementById('add-artist-form-container');
    if (formContainer) formContainer.style.display = 'block';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hide add artist form and show list
function hideAddArtistForm() {
    // Show artists list card
    const artistsCard = document.querySelector('#artists-tab > .ph-card');
    if (artistsCard) artistsCard.style.display = 'block';

    // Hide add artist form
    const formContainer = document.getElementById('add-artist-form-container');
    if (formContainer) formContainer.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle add artist form submission
async function handleAddArtist(event) {
    event.preventDefault();
    console.log('📝 handleAddArtist called');

    try {
        // Get form values
        const name = document.getElementById('artistName').value.trim();
        const genre = document.getElementById('artistGenre').value.trim();
        const bio = document.getElementById('artistBio').value.trim();
        const imageFile = document.getElementById('artistImage').files[0];

        // Get social links
        const spotify = document.getElementById('artistSpotify')?.value.trim() || '';
        const youtube = document.getElementById('artistYoutube')?.value.trim() || '';
        const appleMusic = document.getElementById('artistAppleMusic')?.value.trim() || '';
        const instagram = document.getElementById('artistInstagram')?.value.trim() || '';
        const tiktok = document.getElementById('artistTiktok')?.value.trim() || '';

        // Validate required fields
        if (!name || !genre || !bio) {
            showToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        // Read image as Base64 if provided
        let imageData = null;
        if (imageFile) {
            imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }

        // Create new artist object
        const newArtist = {
            name,
            genre,
            bio,
            image: imageData,
            imageData: imageData, // For compatibility
            socials: {
                spotify,
                youtube,
                appleMusic,
                instagram,
                tiktok
            },
            albums: [],
            merch: [],
            latestVideoId: ''
        };

        // Load existing artists
        const artists = await loadArtists();

        // Add new artist
        artists.push(newArtist);

        // Save to IndexedDB
        console.log('💾 Saving new artist to IndexedDB...');
        await saveArtists(artists);

        console.log('✅ Artist saved successfully!');
        showToast(`Artista "${name}" agregado exitosamente!`, 'success');

        // Reset form
        document.getElementById('artistForm').reset();
        document.getElementById('artistImagePreview').style.display = 'none';

        // Hide form and show updated list
        hideAddArtistForm();
        renderArtistsList(artists);

    } catch (error) {
        console.error('❌ Error adding artist:', error);
        showToast('Error al guardar el artista. Por favor intenta de nuevo.', 'error');
    }
}

// Edit artist
async function editArtist(index) {
    const artists = await loadArtists();
    const artist = artists[index];

    // Show artist profile view
    showArtistProfile(artist, index);
}

// Show artist profile
function showArtistProfile(artist, artistIndex) {
    const artistsList = document.getElementById('artists-list');
    const addArtistBtn = document.querySelector('button[onclick="showAddArtistForm()"]');

    if (artistsList) artistsList.style.display = 'none';
    if (addArtistBtn) addArtistBtn.style.display = 'none';

    const artistView = document.getElementById('artist-view') || createArtistView();

    artistView.style.display = 'block';
    artistView.innerHTML = `
        <div class="ph-card">
            <div class="ph-card__content">
                <button onclick="closeArtistView()" class="ph-button ph-button--outline" style="margin-bottom: var(--space-xl);">
                    ← VOLVER A LA LISTA
                </button>
                
                <h2 style="margin-bottom: var(--space-3xl); color: var(--ph-purple-lighter);">PERFIL DE ARTISTA</h2>
                
                <!-- Two-column layout: Image left, Form right -->
                <form id="artist-form" onsubmit="saveArtistProfile(event, ${artistIndex})">
                    <div class="admin-profile-grid">
                        
                        <!-- LEFT COLUMN: Artist Image -->
                        <div>
                            <div class="admin-image-preview-container">
                                ${artist.image ? `
                                    <img id="artist-image-preview" src="${artist.image}" style="width: 100%; height: 100%; object-fit: cover;">
                                ` : `
                                    <div id="artist-image-preview" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--ph-gray-lighter);">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <p style="margin-top: var(--space-md); font-size: var(--fs-sm);">Sin imagen</p>
                                    </div>
                                `}
                            </div>
                            <label for="artist-image" style="display: block; margin-top: var(--space-md); cursor: pointer;">
                                <div class="ph-button ph-button--outline" style="width: 100%; text-align: center; padding: var(--space-md);">
                                    📷 CAMBIAR FOTO
                                </div>
                            </label>
                            <input type="file" id="artist-image" accept="image/*" style="display: none;" onchange="previewArtistImage(event)">
                            <p style="color: var(--ph-gray-lighter); font-size: var(--fs-xs); text-align: center; margin-top: var(--space-sm);">
                                Click para cambiar imagen
                            </p>
                        </div>
                        
                        <!-- RIGHT COLUMN: Form Fields -->
                        <div>
                            <div class="form-group">
                                <label for="artist-name">NOMBRE DEL ARTISTA</label>
                                <input type="text" id="artist-name" value="${artist.name || ''}" required 
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-genre">GENERO MUSICAL</label>
                                <input type="text" id="artist-genre" value="${artist.genre || ''}" placeholder="Ej: trap/hiphop/rap/newjazz" required
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-bio">BIOGRAFIA</label>
                                <textarea id="artist-bio" rows="6"
                                          style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box; resize: vertical;">${artist.bio || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-instagram">INSTAGRAM</label>
                                <input type="url" id="artist-instagram" value="${artist.socials?.instagram || ''}" placeholder="https://www.instagram.com/..."
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-youtube">YOUTUBE</label>
                                <input type="url" id="artist-youtube" value="${artist.socials?.youtube || ''}" placeholder="https://www.youtube.com/..."
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-spotify">SPOTIFY</label>
                                <input type="url" id="artist-spotify" value="${artist.socials?.spotify || ''}" placeholder="https://open.spotify.com/..."
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-applemusic">APPLE MUSIC</label>
                                <input type="url" id="artist-applemusic" value="${artist.socials?.appleMusic || ''}" placeholder="https://music.apple.com/..."
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-tiktok">TIKTOK</label>
                                <input type="url" id="artist-tiktok" value="${artist.socials?.tiktok || ''}" placeholder="https://www.tiktok.com/@..."
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <div class="form-group">
                                <label for="artist-latest-video">ULTIMO VIDEO (YouTube ID)</label>
                                <input type="text" id="artist-latest-video" value="${artist.latestVideoId || ''}" placeholder="ej: dQw4w9WgXcQ"
                                       style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-md); color: var(--ph-white); font-family: var(--font-body); width: 100%; box-sizing: border-box;">
                                <p style="color: var(--ph-gray-lighter); font-size: var(--fs-xs); margin-top: var(--space-xs);">
                                    El ID está en la URL de YouTube. Ejemplo: <br>
                                    <code style="color: var(--ph-purple-lighter); background: rgba(155, 89, 182, 0.1); padding: 2px 6px; border-radius: 4px;">youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong></code>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="ph-button ph-button--primary" style="width: 100%; padding: var(--space-lg); font-size: var(--fs-lg);">
                        ACTUALIZAR INFORMACION DEL ARTISTA
                    </button>
                </form>
                
                <!-- Albums Section -->
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-xl); margin-top: var(--space-xl);">
                    <div class="tab-header">
                        <h3 style="color: var(--ph-purple-lighter); margin: 0;">ALBUMES</h3>
                        <button onclick="showAlbumForm(${artistIndex}, null)" class="ph-button ph-button--primary">
                            + AGREGAR ALBUM
                        </button>
                    </div>
                    <div id="artist-albums-list">
                        ${renderArtistAlbums(artist, artistIndex)}
                    </div>
                </div>
                
                <!-- Merch Section -->
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-xl); margin-top: var(--space-xl);">
                    <div class="tab-header">
                        <h3 style="color: var(--ph-purple-lighter); margin: 0;">MERCHANDISING</h3>
                        <button onclick="showMerchForm(${artistIndex}, null)" class="ph-button ph-button--primary">
                            + AGREGAR PRODUCTO
                        </button>
                    </div>
                    <div id="artist-merch-list">
                        ${renderArtistMerch(artist, artistIndex)}
                    </div>
                </div>
            </div>
        </div>
    `;
}


function createArtistView() {
    const view = document.createElement('div');
    view.id = 'artist-view';
    view.style.display = 'none';
    document.getElementById('artists-tab').appendChild(view);
    return view;
}

function closeArtistView() {
    const artistView = document.getElementById('artist-view');
    const artistsList = document.getElementById('artists-list');
    const addArtistBtn = document.querySelector('button[onclick="showAddArtistForm()"]');

    if (artistView) artistView.style.display = 'none';
    if (artistsList) artistsList.style.display = 'block';
    if (addArtistBtn) addArtistBtn.style.display = 'block';
}

// Preview artist image
let currentArtistImage = null;

function previewArtistImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentArtistImage = e.target.result;
            const preview = document.getElementById('artist-image-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Save artist profile
async function saveArtistProfile(event, artistIndex) {
    event.preventDefault();

    const artists = await loadArtists();
    const artist = artists[artistIndex];

    artist.name = document.getElementById('artist-name').value;
    artist.genre = document.getElementById('artist-genre').value;
    artist.bio = document.getElementById('artist-bio').value;

    // Save social media links
    if (!artist.socials) artist.socials = {};
    artist.socials.instagram = document.getElementById('artist-instagram')?.value || '';
    artist.socials.youtube = document.getElementById('artist-youtube')?.value || '';
    artist.socials.spotify = document.getElementById('artist-spotify')?.value || '';
    artist.socials.appleMusic = document.getElementById('artist-applemusic')?.value || '';
    artist.socials.tiktok = document.getElementById('artist-tiktok')?.value || '';

    // Save latest video ID
    artist.latestVideoId = document.getElementById('artist-latest-video')?.value || '';

    if (currentArtistImage) {
        artist.image = currentArtistImage;
        // CRITICAL FIX: Update imageData as well to prevent old heavy data from persisting
        artist.imageData = currentArtistImage;
    }

    await saveArtists(artists);
    showToast('Artista actualizado exitosamente!');
    currentArtistImage = null;
}


// Render artist albums
function renderArtistAlbums(artist, artistIndex) {
    const albums = artist.albums || [];

    if (albums.length === 0) {
        return '<p style="color: var(--ph-gray-lighter);">No hay álbumes. Agrega uno nuevo.</p>';
    }

    return `
        <div class="admin-horizontal-slider">
            ${albums.map((album, albumIndex) => {
        // Parse date properly to avoid timezone issues
        let formattedDate = '';
        if (album.releaseDate) {
            const [year, month, day] = album.releaseDate.split('-');
            const date = new Date(year, month - 1, day);
            formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (album.year) {
            formattedDate = album.year;
        }

        const stockStatus = album.stock === 'SOLD OUT' ? 'SOLD OUT' : 'EN STOCK';
        const stockColor = album.stock === 'SOLD OUT' ? '#e74c3c' : 'var(--ph-gray-lighter)';

        return `
                    <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <!-- Imagen del álbum -->
                        <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); overflow: hidden;">
                            ${album.images && album.images[0] ?
                `<img src="${album.images[0]}" style="width: 100%; height: 100%; object-fit: cover;">` :
                '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ph-gray-light); font-size: 0.75rem;">Sin imagen</div>'
            }
                        </div>
                        
                        <!-- Información del álbum -->
                        <div style="padding: 12px;">
                            <h4 style="margin: 0 0 4px 0; color: var(--ph-purple-lighter); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 600;">${album.title}</h4>
                            <p style="color: var(--ph-gray-lighter); font-size: 0.75rem; margin: 0 0 6px 0; line-height: 1.3;">
                                ${formattedDate} • ${album.type}
                            </p>
                            <p style="color: ${stockColor}; font-size: 0.7rem; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase;">
                                ${stockStatus}
                            </p>
                            
                            <!-- Botones -->
                            <div style="display: flex; gap: 8px;">
                                <button onclick="showAlbumForm(${artistIndex}, ${albumIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 10px; font-size: 0.75rem; border-color: var(--ph-purple); color: var(--ph-purple); border-radius: 8px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    EDITAR
                                </button>
                                <button onclick="deleteAlbum(${artistIndex}, ${albumIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 10px; font-size: 0.75rem; border-color: #e74c3c; color: #e74c3c; border-radius: 8px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Render artist merch
function renderArtistMerch(artist, artistIndex) {
    const merch = artist.merch || [];

    if (merch.length === 0) {
        return '<p style="color: var(--ph-gray-lighter);">No hay productos. Agrega uno nuevo.</p>';
    }

    return `
        <div class="admin-horizontal-slider">
            ${merch.map((product, productIndex) => {
        const stockStatus = product.stock === 'SOLD OUT' ? 'SOLD OUT' : 'EN STOCK';
        const stockColor = product.stock === 'SOLD OUT' ? '#e74c3c' : 'var(--ph-gray-lighter)';

        return `
                    <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <!-- Imagen del producto -->
                        <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); overflow: hidden;">
                            ${product.images && product.images[0] ?
                `<img src="${product.images[0]}" style="width: 100%; height: 100%; object-fit: cover;">` :
                '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ph-gray-light); font-size: var(--fs-sm);">Sin imagen</div>'
            }
                        </div>
                        
                        <!-- Información del producto -->
                        <div style="padding: 12px;">
                            <h4 style="margin: 0 0 4px 0; color: var(--ph-purple-lighter); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 600;">${product.name}</h4>
                            <p style="color: var(--ph-gray-lighter); font-size: 0.75rem; margin: 0 0 4px 0;">
                                ${product.category || 'Merchandising'}
                            </p>
                            <p style="color: var(--ph-white); font-size: 0.875rem; font-weight: 600; margin: 0 0 6px 0;">
                                $${product.price}
                            </p>
                            <p style="color: ${stockColor}; font-size: 0.7rem; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase;">
                                ${stockStatus}
                            </p>
                            
                            <!-- Botones -->
                            <div style="display: flex; gap: 8px;">
                                <button onclick="showMerchForm(${artistIndex}, ${productIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 10px; font-size: 0.75rem; border-color: var(--ph-purple); color: var(--ph-purple); border-radius: 8px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    EDITAR
                                </button>
                                <button onclick="deleteMerch(${artistIndex}, ${productIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 10px; font-size: 0.75rem; border-color: #e74c3c; color: #e74c3c; border-radius: 8px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Delete album
function deleteAlbum(artistIndex, albumIndex) {
    showDeleteModal(async () => {
        const artists = await loadArtists();
        artists[artistIndex].albums.splice(albumIndex, 1);
        await saveArtists(artists);
        showToast('Album eliminado exitosamente.');
        showArtistProfile(artists[artistIndex], artistIndex);
    });
}

// Delete merch
function deleteMerch(artistIndex, productIndex) {
    showDeleteModal(async () => {
        const artists = await loadArtists();
        artists[artistIndex].merch.splice(productIndex, 1);
        await saveArtists(artists);
        showToast('Producto eliminado exitosamente.');
        showArtistProfile(artists[artistIndex], artistIndex);
    });
}

// --- CUSTOM DELETE MODAL LOGIC ---
let pendingDeleteCallback = null;

function showDeleteModal(onConfirm) {
    const modal = document.getElementById('deleteModal');
    const input = document.getElementById('deletePasswordInput');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    // Reset state
    input.value = '';
    input.classList.remove('error'); // if any
    pendingDeleteCallback = onConfirm;

    // Show modal
    modal.style.display = 'flex';
    input.focus();

    // Event Handlers (One-time setup or managing references would be cleaner, 
    // but for simplicity we'll handle clicks here carefully or rely on IDs)

    // Remove old listeners to prevent duplicates if any (simple hacky way)
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    // Re-select fresh elements
    const freshConfirm = document.getElementById('confirmDeleteBtn');
    const freshCancel = document.getElementById('cancelDeleteBtn');

    freshConfirm.addEventListener('click', () => {
        const pwd = input.value;
        if (typeof verifyPassword === 'function' && verifyPassword(pwd)) {
            modal.style.display = 'none';
            if (pendingDeleteCallback) pendingDeleteCallback();
        } else {
            showToast('Contraseña incorrecta.', 'error');
            input.value = '';
            input.focus();
            // Optional: Shake animation here
        }
    });

    freshCancel.addEventListener('click', () => {
        modal.style.display = 'none';
        pendingDeleteCallback = null;
    });

    // Allow Enter key to confirm
    input.onkeydown = (e) => {
        if (e.key === 'Enter') freshConfirm.click();
        if (e.key === 'Escape') freshCancel.click();
        checkCapsLock(e);
    };

    input.onkeyup = (e) => {
        checkCapsLock(e);
    };

    function checkCapsLock(e) {
        const warning = document.getElementById('deleteCapsLockWarning');
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }
}

// Show album form
let tempAlbumImages = [];


async function showAlbumForm(artistIndex, albumIndex) {
    const artists = await loadArtists();
    const artist = artists[artistIndex];

    // Initialize albums array if it doesn't exist
    if (!artist.albums) {
        artist.albums = [];
        await saveArtists(artists);
    }

    const album = albumIndex !== null ? artist.albums[albumIndex] : null;

    tempAlbumImages = album?.images ? [...album.images] : [];

    const title = album ? 'EDITAR ALBUM' : 'AGREGAR ALBUM';

    const artistView = document.getElementById('artist-view');

    artistView.innerHTML = `
        <div class="ph-card" style="margin-bottom: var(--space-xl);">
            <div class="ph-card__content">
                <!-- Header with back button and title -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xl);">
                    <button onclick="closeAlbumView()" class="ph-button ph-button--outline">
                        ← VOLVER AL PERFIL
                    </button>
                    <h2 style="margin: 0; color: var(--ph-purple-lighter);">${title}</h2>
                </div>
                
                <!-- Centered Artist Name -->
                <h1 style="margin-bottom: var(--space-xl); color: var(--ph-white); font-size: var(--fs-2xl); text-align: center;">
                    ARTISTA: ${artist.name}
                </h1>
                
                <div class="admin-form-grid">
                    
                    <!-- LEFT COLUMN: Album Images -->
                    <div>
                        <h3 style="margin-bottom: var(--space-md); color: var(--ph-purple-lighter);">IMAGENES DEL ALBUM</h3>
                        <p style="color: var(--ph-gray-lighter); font-size: var(--fs-sm); margin-bottom: var(--space-lg);">
                            Resolución recomendada: 3000x3000px (formato 1:1)
                        </p>
                        
                        <div id="album-images-container" style="display: grid; grid-template-columns: 1fr; gap: var(--space-md);">
                            ${renderAlbumImagePreviews(album, artistIndex, albumIndex)}
                        </div>
                        
                        <button type="button" onclick="addAlbumImageSlot(${artistIndex}, ${albumIndex})" 
                                id="add-album-image-btn"
                                class="ph-button ph-button--outline" 
                                style="width: 100%; margin-top: var(--space-md); border-radius: 8px !important;">
                            + AGREGAR OTRA IMAGEN
                        </button>
                        <p style="color: var(--ph-gray-lighter); font-size: var(--fs-xs); text-align: center; margin-top: var(--space-sm);">
                            Máximo 15 imágenes
                        </p>
                    </div>
                    
                    <!-- RIGHT COLUMN: Album Form -->
                    <div>
                        <form id="album-form" data-artist-index="${artistIndex}" data-album-index="${albumIndex}">
                            <style>
                                #album-form input,
                                #album-form select,
                                #album-form textarea {
                                    background: rgba(255, 255, 255, 0.05);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: var(--radius-md);
                                    padding: var(--space-md);
                                    color: var(--ph-white);
                                    font-family: var(--font-body);
                                    font-size: var(--fs-base);
                                    transition: all var(--transition-base);
                                }
                                
                                #album-form select option {
                                    background: #1a1a1a;
                                    color: white;
                                }
                                
                                #album-form input:focus,
                                #album-form select:focus,
                                #album-form textarea:focus {
                                    outline: none;
                                    border-color: var(--ph-purple-primary);
                                    background: rgba(255, 255, 255, 0.08);
                                }
                                
                                #album-form input::placeholder,
                                #album-form textarea::placeholder {
                                    color: rgba(255, 255, 255, 0.4);
                                }
                            </style>
                            
                            <div class="form-group">
                                <label for="album-title">Titulo del Album *</label>
                                <input type="text" id="album-title" name="title" 
                                       value="${album?.title || ''}" 
                                       placeholder="Ej: Mi Primer EP" 
                                       style="width: 100%; box-sizing: border-box;" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-releaseDate">Fecha de Lanzamiento *</label>
                                <input type="date" id="album-releaseDate" name="releaseDate" 
                                       value="${album?.releaseDate || album?.year ? (album?.releaseDate || `${album?.year}-01-01`) : ''}" 
                                       style="width: 100%; box-sizing: border-box;" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-price">Precio (USD) *</label>
                                <input type="number" id="album-price" name="price" 
                                       value="${album?.price || ''}" 
                                       placeholder="15.99" step="0.01" min="0"
                                       style="width: 100%; box-sizing: border-box;" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-type">Tipo *</label>
                                <select id="album-type" name="type" style="width: 100%; box-sizing: border-box;" required>
                                    <option value="EP" ${album?.type === 'EP' ? 'selected' : ''}>EP</option>
                                    <option value="LP" ${album?.type === 'LP' ? 'selected' : ''}>LP (Album completo)</option>
                                    <option value="Single" ${album?.type === 'Single' ? 'selected' : ''}>Single</option>
                                    <option value="Mixtape" ${album?.type === 'Mixtape' ? 'selected' : ''}>Mixtape</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-description">Descripción</label>
                                <textarea id="album-description" name="description" 
                                          rows="3" placeholder="Describe el álbum..."
                                          style="width: 100%; box-sizing: border-box; min-height: 80px; resize: vertical;"
                                          oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'">${album?.description || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-stock">Estado</label>
                                <select id="album-stock" name="stock" style="width: 100%; box-sizing: border-box;">
                                    <option value="EN STOCK" ${album?.stock !== 'SOLD OUT' ? 'selected' : ''}>EN STOCK</option>
                                    <option value="SOLD OUT" ${album?.stock === 'SOLD OUT' ? 'selected' : ''}>SOLD OUT (Agotado)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="album-link">Link de Compra / Streaming</label>
                                <input type="url" id="album-link" name="link" 
                                       value="${album?.link || ''}" 
                                       placeholder="https://..."
                                       style="width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <button type="submit" class="ph-button ph-button--primary" style="width: 100%; margin-top: var(--space-lg);">
                                ${album ? 'ACTUALIZAR ALBUM' : 'GUARDAR ALBUM'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submit handler
    document.getElementById('album-form').addEventListener('submit', saveAlbumForm);
}

async function closeAlbumView() {
    const artists = await loadArtists();
    const form = document.getElementById('album-form');
    const artistIndex = parseInt(form.dataset.artistIndex);

    showArtistProfile(artists[artistIndex], artistIndex);
}

// Render album image previews
function renderAlbumImagePreviews(album, artistIndex, albumIndex) {
    const images = album?.images || [];
    let html = '';

    // First image - large
    const firstImage = images[0];
    html += `
        <div class="album-image-slot" style="position: relative; margin-bottom: var(--space-lg);">
            <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); border-radius: var(--border-radius); overflow: hidden; border: 2px dashed var(--ph-purple);">
                ${firstImage ? `
                    <img src="${firstImage}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" onclick="removeAlbumImage(${artistIndex}, ${albumIndex}, 0)" 
                            style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px;">
                        ×
                    </button>
                ` : `
                    <label for="album-image-0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; cursor: pointer;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ph-purple-lighter)" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p style="color: var(--ph-gray-lighter); margin-top: var(--space-sm); font-size: var(--fs-sm);">
                            Click para subir imagen principal
                        </p>
                    </label>
                    <input type="file" id="album-image-0" class="album-image-input" accept="image/*" 
                           style="display: none;" onchange="handleAlbumImageUpload(event, ${artistIndex}, ${albumIndex}, 0)">
                `}
            </div>
        </div>
    `;

    // Additional images - horizontal scroll thumbnails
    if (images.length > 1 || !firstImage) {
        html += `
            <div style="margin-top: var(--space-md);">
                <p style="color: var(--ph-gray-lighter); font-size: var(--fs-sm); margin-bottom: var(--space-sm);">Imágenes adicionales:</p>
                <div style="display: flex; gap: var(--space-sm); overflow-x: auto; padding-bottom: var(--space-sm);">
        `;

        // Start from index 1 (skip first image)
        for (let i = 1; i < 15; i++) {
            const imageData = images[i];

            // Show existing images or some empty slots
            if (imageData || i < images.length + 3) {
                html += `
                    <div class="album-image-slot" style="position: relative; flex-shrink: 0; width: 120px;">
                        <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); border-radius: var(--border-radius); overflow: hidden; border: 1px dashed var(--ph-purple-lighter);">
                            ${imageData ? `
                                <img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover;">
                                <button type="button" onclick="removeAlbumImage(${artistIndex}, ${albumIndex}, ${i})" 
                                        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px;">
                                    ×
                                </button>
                            ` : `
                                <label for="album-image-${i}" style="display: flex; align-items: center; justify-content: center; height: 100%; cursor: pointer;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ph-purple-lighter)" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                </label>
                                <input type="file" id="album-image-${i}" class="album-image-input" accept="image/*" 
                                       style="display: none;" onchange="handleAlbumImageUpload(event, ${artistIndex}, ${albumIndex}, ${i})">
                            `}
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;
    }

    return html;
}

// Handle album image upload
function handleAlbumImageUpload(event, artistIndex, albumIndex, imageIndex) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            tempAlbumImages[imageIndex] = e.target.result;
            const container = document.getElementById('album-images-container');
            container.innerHTML = renderAlbumImagePreviews({ images: tempAlbumImages }, artistIndex, albumIndex);
        };
        reader.readAsDataURL(file);
    }
}

// Remove album image
function removeAlbumImage(artistIndex, albumIndex, imageIndex) {
    tempAlbumImages.splice(imageIndex, 1);
    const container = document.getElementById('album-images-container');
    container.innerHTML = renderAlbumImagePreviews({ images: tempAlbumImages }, artistIndex, albumIndex);
}

// Add album image slot
function addAlbumImageSlot(artistIndex, albumIndex) {
    if (tempAlbumImages.length >= 15) {
        showToast('Máximo 15 imágenes permitidas', 'warning');
        return;
    }
    const container = document.getElementById('album-images-container');
    container.innerHTML = renderAlbumImagePreviews({ images: tempAlbumImages }, artistIndex, albumIndex);
}

// Save album form
async function saveAlbumForm(event) {
    event.preventDefault();

    const form = event.target;
    const artistIndex = parseInt(form.dataset.artistIndex);
    const albumIndex = form.dataset.albumIndex !== 'null' ? parseInt(form.dataset.albumIndex) : null;

    // Validate required fields
    const title = document.getElementById('album-title').value.trim();
    const releaseDate = document.getElementById('album-releaseDate').value;
    const price = parseFloat(document.getElementById('album-price').value);
    const type = document.getElementById('album-type').value;

    if (!title || !releaseDate || !price || !type) {
        showToast('Por favor completa los campos obligatorios (*)', 'warning');
        return;
    }

    if (tempAlbumImages.length === 0) {
        showToast('Por favor agrega al menos una imagen', 'warning');
        return;
    }

    // Extract year from date for backward compatibility
    const year = releaseDate.split('-')[0];

    const albumData = {
        title,
        releaseDate,
        year, // Keep for backward compatibility
        price,
        type,
        description: document.getElementById('album-description').value.trim(),
        stock: document.getElementById('album-stock').value,
        link: document.getElementById('album-link').value.trim(),
        images: tempAlbumImages
    };

    const artists = await loadArtists();

    if (albumIndex === null) {
        // Add new album
        if (!artists[artistIndex].albums) {
            artists[artistIndex].albums = [];
        }
        artists[artistIndex].albums.push(albumData);
    } else {
        // Update existing album
        artists[artistIndex].albums[albumIndex] = albumData;
    }

    await saveArtists(artists);
    showToast(`Album "${albumData.title}" ${albumIndex === null ? 'agregado' : 'actualizado'} exitosamente!`);

    // Go back to artist profile
    showArtistProfile(artists[artistIndex], artistIndex);
}

// Show merch form
let tempMerchImages = [];

async function showMerchForm(artistIndex, merchIndex) {
    const artists = await loadArtists();
    const artist = artists[artistIndex];

    // Initialize merch array if it doesn't exist
    if (!artist.merch) {
        artist.merch = [];
        await saveArtists(artists);
    }

    const product = merchIndex !== null ? artist.merch[merchIndex] : null;

    tempMerchImages = product?.images ? [...product.images] : [];

    const title = product ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO';

    const artistView = document.getElementById('artist-view');

    artistView.innerHTML = `
        <div class="ph-card" style="margin-bottom: var(--space-xl);">
            <div class="ph-card__content">
                <!-- Header with back button and title -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xl);">
                    <button onclick="closeMerchView()" class="ph-button ph-button--outline">
                        ← VOLVER AL PERFIL
                    </button>
                    <h2 style="margin: 0; color: var(--ph-purple-lighter);">${title}</h2>
                </div>
                
                <!-- Centered Artist Name -->
                <h1 style="margin-bottom: var(--space-xl); color: var(--ph-white); font-size: var(--fs-2xl); text-align: center;">
                    ARTISTA: ${artist.name}
                </h1>
                
                <div class="admin-form-grid">
                    
                    <!-- LEFT COLUMN: Product Images -->
                    <div>
                        <h3 style="margin-bottom: var(--space-md); color: var(--ph-purple-lighter);">IMAGENES DEL PRODUCTO</h3>
                        <p style="color: var(--ph-gray-lighter); font-size: var(--fs-sm); margin-bottom: var(--space-lg);">
                            Resolución recomendada: 3000x3000px (formato 1:1)
                        </p>
                        
                        <div id="merch-images-container" style="display: grid; grid-template-columns: 1fr; gap: var(--space-md);">
                            ${renderMerchImagePreviews(product, artistIndex, merchIndex)}
                        </div>
                        
                        <button type="button" onclick="addMerchImageSlot(${artistIndex}, ${merchIndex})" 
                                id="add-merch-image-btn"
                                class="ph-button ph-button--outline" 
                                style="width: 100%; margin-top: var(--space-md); border-radius: 8px !important;">
                            + AGREGAR OTRA IMAGEN
                        </button>
                        <p style="color: var(--ph-gray-lighter); font-size: var(--fs-xs); text-align: center; margin-top: var(--space-sm);">
                            Máximo 15 imágenes
                        </p>
                    </div>
                    
                    <!-- RIGHT COLUMN: Product Form -->
                    <div>
                        <form id="merch-form" data-artist-index="${artistIndex}" data-merch-index="${merchIndex}">
                            <style>
                                #merch-form input,
                                #merch-form select,
                                #merch-form textarea {
                                    background: rgba(255, 255, 255, 0.05);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: var(--radius-md);
                                    padding: var(--space-md);
                                    color: var(--ph-white);
                                    font-family: var(--font-body);
                                    font-size: var(--fs-base);
                                    transition: all var(--transition-base);
                                }
                                
                                #merch-form select option {
                                    background: #1a1a1a;
                                    color: white;
                                }
                                
                                #merch-form input:focus,
                                #merch-form select:focus,
                                #merch-form textarea:focus {
                                    outline: none;
                                    border-color: var(--ph-purple-primary);
                                    background: rgba(255, 255, 255, 0.08);
                                }
                                
                                #merch-form input::placeholder,
                                #merch-form textarea::placeholder {
                                    color: rgba(255, 255, 255, 0.4);
                                }
                            </style>
                            
                            <div class="form-group">
                                <label for="merch-name">Nombre del Producto *</label>
                                <input type="text" id="merch-name" name="name" 
                                       value="${product?.name || ''}" 
                                       placeholder="Ej: Camiseta Oficial" 
                                       style="width: 100%; box-sizing: border-box;" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-category">Categoría *</label>
                                <select id="merch-category" name="category" style="width: 100%; box-sizing: border-box;" required>
                                    <option value="Camiseta" ${product?.category === 'Camiseta' ? 'selected' : ''}>Camiseta</option>
                                    <option value="Sudadera" ${product?.category === 'Sudadera' ? 'selected' : ''}>Sudadera / Hoodie</option>
                                    <option value="Gorra" ${product?.category === 'Gorra' ? 'selected' : ''}>Gorra</option>
                                    <option value="Taza" ${product?.category === 'Taza' ? 'selected' : ''}>Taza</option>
                                    <option value="Poster" ${product?.category === 'Poster' ? 'selected' : ''}>Poster</option>
                                    <option value="Accesorio" ${product?.category === 'Accesorio' ? 'selected' : ''}>Accesorio</option>
                                    <option value="Otro" ${product?.category === 'Otro' ? 'selected' : ''}>Otro</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-price">Precio (USD) *</label>
                                <input type="number" id="merch-price" name="price" 
                                       value="${product?.price || ''}" 
                                       placeholder="29.99" step="0.01" min="0"
                                       style="width: 100%; box-sizing: border-box;" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-description">Descripción</label>
                                <textarea id="merch-description" name="description" 
                                          rows="3" placeholder="Describe el producto..."
                                          style="width: 100%; box-sizing: border-box; min-height: 80px; resize: vertical;"
                                          oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'">${product?.description || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-sizes">Tallas Disponibles</label>
                                <input type="text" id="merch-sizes" name="sizes" 
                                       value="${product?.sizes || ''}" 
                                       placeholder="Ej: S, M, L, XL"
                                       style="width: 100%; box-sizing: border-box;">
                                <p style="color: var(--ph-gray-lighter); font-size: var(--fs-xs); margin-top: var(--space-xs);">
                                    Opcional. Separa las tallas con comas.
                                </p>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-stock">Estado</label>
                                <select id="merch-stock" name="stock" style="width: 100%; box-sizing: border-box;">
                                    <option value="EN STOCK" ${product?.stock !== 'SOLD OUT' ? 'selected' : ''}>EN STOCK</option>
                                    <option value="SOLD OUT" ${product?.stock === 'SOLD OUT' ? 'selected' : ''}>SOLD OUT (Agotado)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="merch-link">Link de Compra</label>
                                <input type="url" id="merch-link" name="link" 
                                       value="${product?.link || ''}" 
                                       placeholder="https://..."
                                       style="width: 100%; box-sizing: border-box;">
                            </div>
                            
                            <button type="submit" class="ph-button ph-button--primary" style="width: 100%; margin-top: var(--space-lg);">
                                ${product ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add form submit handler
    document.getElementById('merch-form').addEventListener('submit', saveMerchForm);
}

async function closeMerchView() {
    const artists = await loadArtists();
    const form = document.getElementById('merch-form');
    const artistIndex = parseInt(form.dataset.artistIndex);

    showArtistProfile(artists[artistIndex], artistIndex);
}

// Render merch image previews
function renderMerchImagePreviews(product, artistIndex, merchIndex) {
    const images = product?.images || [];
    let html = '';

    //First image - large
    const firstImage = images[0];
    html += `
        <div class="merch-image-slot" style="position: relative; margin-bottom: var(--space-lg);">
            <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); border-radius: var(--border-radius); overflow: hidden; border: 2px dashed var(--ph-purple);">
                ${firstImage ? `
                    <img src="${firstImage}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" onclick="removeMerchImage(${artistIndex}, ${merchIndex}, 0)" 
                            style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px;">
                        ×
                    </button>
                ` : `
                    <label for="merch-image-0" style="display: flex; flex-direction: column; al

ign: center; justify-content: center; height: 100%; cursor: pointer;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ph-purple-lighter)" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p style="color: var(--ph-gray-lighter); margin-top: var(--space-sm); font-size: var(--fs-sm);">
                            Click para subir imagen principal
                        </p>
                    </label>
                    <input type="file" id="merch-image-0" class="merch-image-input" accept="image/*" 
                           style="display: none;" onchange="handleMerchImageUpload(event, ${artistIndex}, ${merchIndex}, 0)">
                `}
            </div>
        </div>
    `;

    // Additional images
    if (images.length > 1 || !firstImage) {
        html += `
            <div style="margin-top: var(--space-md);">
                <p style="color: var(--ph-gray-lighter); font-size: var(--fs-sm); margin-bottom: var(--space-sm);">Imágenes adicionales:</p>
                <div style="display: flex; gap: var(--space-sm); overflow-x: auto; padding-bottom: var(--space-sm);">`;

        for (let i = 1; i < 15; i++) {
            const imageData = images[i];
            if (imageData || i < images.length + 3) {
                html += `
                    <div class="merch-image-slot" style="position: relative; flex-shrink: 0; width: 120px;">
                        <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); border-radius: var(--border-radius); overflow: hidden; border: 1px dashed var(--ph-purple-lighter);">
                            ${imageData ? `
                                <img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover;">
                                <button type="button" onclick="removeMerchImage(${artistIndex}, ${merchIndex}, ${i})" 
                                        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px;">
                                    ×
                                </button>
                            ` : `
                                <label for="merch-image-${i}" style="display: flex; align-items: center; justify-content: center; height: 100%; cursor: pointer;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ph-purple-lighter)" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                </label>
                                <input type="file" id="merch-image-${i}" class="merch-image-input" accept="image/*" 
                                       style="display: none;" onchange="handleMerchImageUpload(event, ${artistIndex}, ${merchIndex}, ${i})">
                            `}
                        </div>
                    </div>`;
            }
        }
        html += `</div></div>`;
    }

    return html;
}

// Handle merch image upload
function handleMerchImageUpload(event, artistIndex, merchIndex, imageIndex) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            tempMerchImages[imageIndex] = e.target.result;
            const container = document.getElementById('merch-images-container');
            container.innerHTML = renderMerchImagePreviews({ images: tempMerchImages }, artistIndex, merchIndex);
        };
        reader.readAsDataURL(file);
    }
}

// Remove merch image
function removeMerchImage(artistIndex, merchIndex, imageIndex) {
    tempMerchImages.splice(imageIndex, 1);
    const container = document.getElementById('merch-images-container');
    container.innerHTML = renderMerchImagePreviews({ images: tempMerchImages }, artistIndex, merchIndex);
}

// Add merch image slot
function addMerchImageSlot(artistIndex, merchIndex) {
    if (tempMerchImages.length >= 15) {
        showToast('Máximo 15 imágenes permitidas', 'warning');
        return;
    }
    const container = document.getElementById('merch-images-container');
    container.innerHTML = renderMerchImagePreviews({ images: tempMerchImages }, artistIndex, merchIndex);
}

// Save merch form
async function saveMerchForm(event) {
    event.preventDefault();

    const form = document.getElementById('merch-form');
    const artistIndex = parseInt(form.dataset.artistIndex);
    const merchIndex = form.dataset.merchIndex !== 'null' ? parseInt(form.dataset.merchIndex) : null;

    const artists = await loadArtists();

    // Collect form data
    const merchData = {
        name: document.getElementById('merch-name').value,
        category: document.getElementById('merch-category').value,
        price: parseFloat(document.getElementById('merch-price').value),
        description: document.getElementById('merch-description').value || '',
        sizes: document.getElementById('merch-sizes').value || '',
        stock: document.getElementById('merch-stock').value,
        link: document.getElementById('merch-link').value || '',
        images: tempMerchImages.filter(img => img)
    };

    // Validate
    if (!merchData.name || !merchData.category || !merchData.price) {
        showToast('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    if (merchData.price < 0) {
        showToast('El precio debe ser mayor o igual a 0', 'error');
        return;
    }

    merchData.price = parseFloat(merchData.price.toFixed(2));

    // Initialize merch array if needed
    if (!artists[artistIndex].merch) {
        artists[artistIndex].merch = [];
    }

    if (merchIndex === null) {
        artists[artistIndex].merch.push(merchData);
    } else {
        artists[artistIndex].merch[merchIndex] = merchData;
    }

    await saveArtists(artists);
    showToast(`Producto "${merchData.name}" ${merchIndex === null ? 'agregado' : 'actualizado'} exitosamente!`);

    showArtistProfile(artists[artistIndex], artistIndex);
}
// ==========================================
// TOURS MANAGEMENT
// ==========================================

async function loadTours() {
    try {
        const tours = await window.getAllToursDB(); // From storage-db.js
        return tours || [];
    } catch (error) {
        console.error('❌ Error loading tours:', error);
        return [];
    }
}

async function saveTours(tours) {
    // For individual updates in storage-db, distinct from artists array save
    // But since we want to sync the whole list logic often, we iterate or use direct saveTourDB there.
    // However, our storage-db provided getAllToursDB and saveTourDB (single).
    // admin-panel often works with the list in memory.
    // Ideally we save the specific modified tour.
    // For consistency with existing code style, we'll try to save modified items.
    return true;
}

function renderToursList(tours) {
    const container = document.getElementById('tours-list');
    if (!container) return;

    if (!tours || tours.length === 0) {
        container.innerHTML = '<p style="color: var(--ph-gray-lighter); text-align: center;">No hay tours. Crea uno nuevo.</p>';
        return;
    }

    container.innerHTML = tours.map((tour, index) => `
        <div class="ph-card" style="margin-bottom: var(--space-md); border: 1px solid rgba(255,255,255,0.1);">
            <div class="ph-card__content" style="display: flex; gap: var(--space-lg);">
                <!-- Cover Preview -->
                <div style="width: 120px; height: 67px; background: #000; overflow: hidden; border-radius: 4px;">
                    <img src="${tour.coverImage}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 1.2rem;">${tour.title}</h3>
                    <p style="color: var(--ph-gray-lighter); font-size: 0.9rem;">
                        ${tour.dates?.length || 0} Fechas
                    </p>
                </div>

                <div style="display: flex; gap: var(--space-sm); align-items: center;">
                    <button onclick="manageTour('${tour.id}')" class="ph-button ph-button--primary" style="padding: 8px 16px; font-size: 0.8rem;">
                        GESTIONAR FECHAS
                    </button>
                    <button onclick="deleteTour('${tour.id}')" class="ph-button ph-button--outline" style="padding: 8px; border-color: #e74c3c; color: #e74c3c;">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show/Hide Tour Form
function showAddTourForm() {
    document.querySelector('#tours-tab > .ph-card').style.display = 'none';
    document.getElementById('add-tour-form-container').style.display = 'block';

    // Attach submit listener specifically here to avoid duplicates if possible, or check global
    const form = document.getElementById('tourForm');
    form.onsubmit = handleAddTour;
}

function cancelAddTour() {
    document.querySelector('#tours-tab > .ph-card').style.display = 'block';
    document.getElementById('add-tour-form-container').style.display = 'none';
    document.getElementById('tourForm').reset();
    document.getElementById('tourCoverPreview').style.display = 'none';
}

// Handle Add Tour
async function handleAddTour(event) {
    event.preventDefault();

    const title = document.getElementById('tourTitle').value;
    const coverFile = document.getElementById('tourCover').files[0];

    if (!coverFile) {
        showToast('Debes subir una portada 1920x1080', 'error');
        return;
    }

    try {
        const coverBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(coverFile);
        });

        const newTour = {
            title,
            coverImage: coverBase64,
            dates: [],
            createdAt: new Date().toISOString()
        };

        await window.saveTourDB(newTour);
        showToast('Tour creado exitosamente');
        cancelAddTour();

        const tours = await loadTours();
        renderToursList(tours);

    } catch (error) {
        console.error(error);
        showToast('Error al crear el tour', 'error');
    }
}

// Delete Tour
async function deleteTour(id) {
    // Convert id to number if it's stored as number in DB (autoIncrement matches number usually)
    // But we pass it as string from template string
    const numericId = Number(id);

    if (!confirm('¿Eliminar este tour y todas sus fechas?')) return;

    try {
        await window.deleteTourDB(numericId);
        showToast('Tour eliminado');
        const tours = await loadTours();
        renderToursList(tours);
    } catch (error) {
        showToast('Error al eliminar', 'error');
    }
}

// Manage Tour View (Dates)
async function manageTour(id) {
    const numericId = Number(id);
    const tours = await loadTours();
    const tour = tours.find(t => t.id === numericId);
    if (!tour) return;

    // Hide list, show management details
    const toursTab = document.getElementById('tours-tab');

    // Create or reuse details view container
    let detailsView = document.getElementById('tour-details-view');
    if (!detailsView) {
        detailsView = document.createElement('div');
        detailsView.id = 'tour-details-view';
        toursTab.appendChild(detailsView);
    }

    // Hide main list
    document.querySelector('#tours-tab > .ph-card').style.display = 'none';
    document.getElementById('add-tour-form-container').style.display = 'none';
    detailsView.style.display = 'block';

    renderTourDetails(tour, detailsView);
}

function renderTourDetails(tour, container) {
    container.innerHTML = `
        <div class="ph-card">
            <div class="ph-card__content">
                <button onclick="closeTourDetails()" class="ph-button ph-button--outline" style="margin-bottom: var(--space-lg);">
                    ← VOLVER A TOURS
                </button>
                
                <div style="background: url('${tour.coverImage}') center/cover; height: 300px; border-radius: 12px; margin-bottom: 20px; position: relative;">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, #000);">
                        <h2 style="font-size: 2rem;">${tour.title}</h2>
                    </div>
                </div>
                
                <h3 style="margin-bottom: 15px;">GESTIONAR FECHAS</h3>
                
                <!-- Add Date Form -->
                <form id="addDateForm" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <input type="date" id="dateDate" class="form-input" required>
                        <input type="text" id="dateCity" class="form-input" placeholder="Ciudad / País" required>
                        <input type="text" id="dateVenue" class="form-input" placeholder="Lugar (Venue)" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <input type="url" id="dateLink" class="form-input" placeholder="Enlace Venta (Opcional)">
                        <select id="dateStatus" class="form-select">
                            <option value="active">DISPONIBLE</option>
                            <option value="soldout">SOLD OUT</option>
                            <option value="coming_soon">PROXIMAMENTE</option>
                        </select>
                    </div>
                    <button type="button" onclick="addTourDate(${tour.id})" class="ph-button ph-button--primary" style="width: 100%;">
                        + AGREGAR FECHA
                    </button>
                </form>
                
                <!-- Dates List -->
                <div id="dates-list">
                    ${tour.dates && tour.dates.length > 0 ? tour.dates.map((d, idx) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 15px; margin-bottom: 8px; border-radius: 8px;">
                            <div>
                                <span style="color: var(--ph-purple-light); font-weight: bold; margin-right: 10px;">${d.date}</span>
                                <strong style="font-size: 1.1em;">${d.city}</strong>
                                <span style="color: var(--ph-gray-light);"> @ ${d.venue}</span>
                                ${d.status === 'soldout' ? '<span style="background: #e74c3c; padding: 2px 6px; font-size: 0.7em; border-radius: 4px; margin-left: 10px;">SOLD OUT</span>' : ''}
                            </div>
                            <button onclick="deleteTourDate(${tour.id}, ${idx})" class="ph-button ph-button--outline" style="padding: 4px 8px; font-size: 0.8em; border-color: #e74c3c; color: #e74c3c;">
                                ×
                            </button>
                        </div>
                    `).join('') : '<p class="text-center" style="color: gray;">No hay fechas agregadas.</p>'}
                </div>
            </div>
        </div>
    `;
}

function closeTourDetails() {
    document.getElementById('tour-details-view').style.display = 'none';
    document.querySelector('#tours-tab > .ph-card').style.display = 'block';
    loadTours().then(renderToursList);
}

async function addTourDate(tourId) {
    const numericId = Number(tourId); // Ensure numeric ID
    const tours = await loadTours();
    const tour = tours.find(t => t.id === numericId);
    if (!tour) return;

    // Get values
    const date = document.getElementById('dateDate').value;
    const city = document.getElementById('dateCity').value;
    const venue = document.getElementById('dateVenue').value;
    const link = document.getElementById('dateLink').value;
    const status = document.getElementById('dateStatus').value;

    if (!date || !city || !venue) {
        showToast('Completa fecha, ciudad y lugar', 'warning');
        return;
    }

    const newDate = { date, city, venue, link, status };

    if (!tour.dates) tour.dates = [];
    tour.dates.push(newDate);

    // sorting dates by date
    tour.dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    await window.saveTourDB(tour);

    // Refresh view
    const view = document.getElementById('tour-details-view');
    renderTourDetails(tour, view);
    showToast('Fecha agregada');
}

async function deleteTourDate(tourId, dateIndex) {
    if (!confirm('¿Borrar esta fecha?')) return;

    const numericId = Number(tourId);
    const tours = await loadTours();
    const tour = tours.find(t => t.id === numericId);
    if (!tour) return;

    tour.dates.splice(dateIndex, 1);
    await window.saveTourDB(tour);

    const view = document.getElementById('tour-details-view');
    renderTourDetails(tour, view);
    showToast('Fecha eliminada');
}
