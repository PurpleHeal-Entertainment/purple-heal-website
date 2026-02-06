// ====================================================
// Purple Heal - Dynamic Product Loading for Artist Profile
// ====================================================

// Load albums and merch dynamically from IndexedDB
async function loadArtistProducts(artistId) {
    // Load artist data AND site config
    const [artistsData, config] = await Promise.all([
        getArtistsDataFromDB(),
        getSiteConfig().catch(() => ({})) // Fail gracefully if config missing
    ]);

    // Note: getArtistsDataFromDB returns an object keyed by index string '0', '1', etc.
    const artist = artistsData[artistId];

    if (!artist) {
        console.error('❌ Artist not found in product-loader:', artistId);
        return;
    }

    // --- DISCOUNT LOGIC ---
    const isPromoActive = config.showPromo === true;
    const discountAlbum = parseInt(config.promoDiscountAlbum) || 0;
    const discountMerch = parseInt(config.promoDiscountMerch) || 0;

    // Helper: Check if item gets discount
    const getDiscountPercent = (type) => {
        if (!isPromoActive) return 0;
        if (type === 'album') return discountAlbum;
        if (type === 'merch') return discountMerch;
        return 0;
    };

    // Load Albums
    const albumsContainer = document.getElementById('albumsGrid');
    if (albumsContainer) {
        if (artist.albums && artist.albums.length > 0) {
            albumsContainer.innerHTML = artist.albums.map((album, index) => {
                const firstImage = album.images && album.images.length > 0 ? album.images[0] : 'assets/images/album_cover_1_1768737641895.png';

                // Format release date if available
                let displayDate = album.year || '';
                if (album.releaseDate) {
                    const [year, month, day] = album.releaseDate.split('-');
                    const date = new Date(year, month - 1, day);
                    displayDate = date.getFullYear();
                }

                // Check for discount badge
                const discount = getDiscountPercent('album');
                const showSaleBadge = discount > 0;

                // Price Calculation
                const originalPrice = album.price ? parseInt(album.price) : 0;
                let finalPrice = originalPrice;
                if (showSaleBadge && originalPrice > 0) {
                    finalPrice = Math.floor(originalPrice * (1 - (discount / 100)));
                }

                return `
                <a href="product-detail.html?type=album&artist=${artistId}&index=${index}" style="text-decoration: none; color: inherit; display: block; max-width: 300px; margin: 0;">
                    <div class="product-card fade-in" style="width: 100%; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-purple); transition: transform 0.3s; cursor: pointer; ${showSaleBadge ? 'border: 1px solid var(--ph-blue-accent);' : ''}" 
                         onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        
                        <div class="product-card__image" style="aspect-ratio: 1/1; max-height: 300px; position: relative;">
                            <img src="${firstImage}" alt="${album.title}" style="width: 100%; height: 100%; object-fit: cover;">
                            ${showSaleBadge ? `<div style="position: absolute; top: 10px; right: 10px; background: var(--ph-blue-accent); color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">-${discount}%</div>` : ''}
                        </div>
                        
                        <div class="product-card__content" style="padding: var(--space-lg);">
                            <h3 style="font-size: 1.25rem; margin-bottom: var(--space-sm);">${album.title}</h3>
                            <p class="product-card__meta" style="font-size: 0.875rem; margin-bottom: var(--space-xs); color: var(--ph-gray-lighter);">${displayDate} · ${album.type}</p>
                            
                            <!-- Price Display -->
                            <div class="product-card__price" style="font-size: 1.125rem; font-weight: bold; color: var(--ph-purple); margin-bottom: var(--space-sm);">
                                ${originalPrice > 0 ? (showSaleBadge ?
                        `<span style="text-decoration: line-through; color: #666; margin-right: 10px; font-size: 0.9em;">$${originalPrice}</span>
                                     <span style="color: var(--ph-blue-accent);">$${finalPrice}</span>`
                        : `$${originalPrice}`)
                        : 'Precio no disponible'}
                            </div>

                            <p style="color: var(--ph-purple-lighter); font-size: 0.875rem;">
                                ${album.link ? 'Ver Detalles' : 'No disponible'}
                            </p>
                        </div>
                    </div>
                </a>
                `;
            }).join('');
        } else {
            albumsContainer.innerHTML = '<p style="text-align: center; color: var(--ph-gray-lighter);">No hay albumes disponibles</p>';
        }
    }

    // Load Merch
    const merchContainer = document.getElementById('merchGrid');
    if (merchContainer) {
        if (artist.merch && artist.merch.length > 0) {
            merchContainer.innerHTML = artist.merch.map((product, index) => {
                const firstImage = product.images && product.images.length > 0 ? product.images[0] : 'assets/images/merch_tshirt_1768737656110.png';
                const isSoldOut = product.stock === 'SOLD OUT';

                // Price Calculation
                const originalPrice = product.price ? parseInt(product.price) : 0;
                const discount = getDiscountPercent('merch');
                const showSale = discount > 0 && !isSoldOut;
                let finalPrice = originalPrice;

                if (showSale && originalPrice > 0) {
                    finalPrice = Math.floor(originalPrice * (1 - (discount / 100)));
                }

                return `
                <a href="product-detail.html?type=merch&artist=${artistId}&index=${index}" style="text-decoration: none; color: inherit; display: block; max-width: 300px; margin: 0;">
                    <div class="product-card fade-in" style="width: 100%; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-purple); transition: transform 0.3s; cursor: pointer; ${showSale ? 'border: 1px solid var(--ph-blue-accent);' : ''}"
                         onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        
                        <div class="product-card__image" style="aspect-ratio: 1/1; max-height: 300px; position: relative;">
                            <img src="${firstImage}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                            ${showSale ? `<div style="position: absolute; top: 10px; right: 10px; background: var(--ph-blue-accent); color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">-${discount}% OFF</div>` : ''}
                        </div>
                        
                        <div class="product-card__content" style="padding: var(--space-lg);">
                            <h3 style="font-size: 1.25rem; margin-bottom: var(--space-sm);">${product.name}</h3>
                            <p style="color: var(--ph-gray-lighter); font-size: 0.875rem; margin-bottom: var(--space-sm);">
                                ${product.category || 'Merchandising'}
                            </p>
                            
                            <!-- Price Display -->
                            <div class="product-card__price" style="font-size: 1.125rem; font-weight: bold; color: var(--ph-purple); margin-bottom: var(--space-sm);">
                                ${originalPrice > 0 ? (showSale ?
                        `<span style="text-decoration: line-through; color: #666; margin-right: 10px; font-size: 0.9em;">$${originalPrice}</span>
                                     <span style="color: var(--ph-blue-accent);">$${finalPrice}</span>`
                        : `$${originalPrice}`)
                        : 'Precio no disponible'}
                            </div>

                            ${isSoldOut ?
                        '<p style="color: #D6001C; font-weight: bold; font-size: 0.875rem;">SOLD OUT</p>' :
                        '<p style="color: var(--ph-purple-lighter); font-size: 0.875rem;">En Stock</p>'
                    }
                        </div>
                    </div>
                </a>
                `;
            }).join('');
        } else {
            merchContainer.innerHTML = '<p style="text-align: center; color: var(--ph-gray-lighter);">No hay merchandising disponible</p>';
        }
    }


    // Setup Sliders
    setupSlider('albumsGrid', 'prevAlbums', 'nextAlbums');
    setupSlider('merchGrid', 'prevMerch', 'nextMerch');
}

// Call when page loads
window.loadArtistProducts = loadArtistProducts;

// --- SLIDER LOGIC ---
function setupSlider(trackId, prevBtnId, nextBtnId) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!track || !prevBtn || !nextBtn) return;

    // Hide buttons if no overflow
    // We need to wait for images/rendering or just check scrollWidth immediately?
    // A slight delay or check after a frame might be better.
    setTimeout(() => {
        if (track.scrollWidth <= track.clientWidth) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            // Restore flex/block if they were hidden (css has display: flex)
            // Actually CSS has them absolute. We can just removing inline display:none
            prevBtn.style.display = '';
            nextBtn.style.display = '';
        }
    }, 500);

    // Scroll amount = width of card + gap (approx 300px + 32px)
    const scrollAmount = 320;

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}
