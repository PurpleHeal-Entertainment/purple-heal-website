// INSTRUCCIONES: Reemplaza las funciones renderArtistAlbums y renderArtistMerch 
// en admin-panel.js con estas versiones optimizadas

// Render artist albums - VERSIÓN OPTIMIZADA
function renderArtistAlbums(artist, artistIndex) {
    const albums = artist.albums || [];

    if (albums.length === 0) {
        return '<p style="color: var(--ph-gray-lighter);">No hay álbumes. Agrega uno nuevo.</p>';
    }

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-md); margin-top: var(--space-lg);">
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
                                ${formattedDate} \u2022 ${album.type}
                            </p>
                            <p style="color: ${stockColor}; font-size: 0.7rem; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase;">
                                ${stockStatus}
                            </p>
                            
                            <!-- Botones -->
                            <div style="display: flex; gap: 8px;">
                                <button onclick="showAlbumForm(${artistIndex}, ${albumIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 6px 10px; font-size: 0.7rem; border-color: var(--ph-purple); color: var(--ph-purple); border-radius: 20px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    EDITAR
                                </button>
                                <button onclick="deleteAlbum(${artistIndex}, ${albumIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 6px 10px; font-size: 0.7rem; border-color: #e74c3c; color: #e74c3c; border-radius: 20px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
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

// Render artist merch - VERSIÓN OPTIMIZADA
function renderArtistMerch(artist, artistIndex) {
    const merch = artist.merch || [];

    if (merch.length === 0) {
        return '<p style="color: var(--ph-gray-lighter);">No hay productos. Agrega uno nuevo.</p>';
    }

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-md); margin-top: var(--space-lg);">
            ${merch.map((product, productIndex) => {
        const stockStatus = product.stock === 'SOLD OUT' ? 'SOLD OUT' : 'EN STOCK';
        const stockColor = product.stock === 'SOLD OUT' ? '#e74c3c' : 'var(--ph-gray-lighter)';

        return `
                    <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <!-- Imagen del producto -->
                        <div style="aspect-ratio: 1/1; background: var(--ph-gray-darker); overflow: hidden;">
                            ${product.images && product.images[0] ?
                `<img src="${product.images[0]}\" style="width: 100%; height: 100%; object-fit: cover;">` :
                '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ph-gray-light); font-size: 0.75rem;">Sin imagen</div>'
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
                                <button onclick="showMerchForm(${artistIndex}, ${productIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 6px 10px; font-size: 0.7rem; border-color: var(--ph-purple); color: var(--ph-purple); border-radius: 20px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
                                    EDITAR
                                </button>
                                <button onclick="deleteMerch(${artistIndex}, ${productIndex})" class="ph-button ph-button--outline" style="flex: 1; padding: 6px 10px; font-size: 0.7rem; border-color: #e74c3c; color: #e74c3c; border-radius: 20px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: 500;">
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

/*
CAMBIOS REALIZADOS:
1. Ancho mínimo de card: 200px → 180px (más compacto)
2. Gap entre cards: var(--space-lg) → var(--space-md) (menos espacio)
3. Padding interno: var(--space-md) → 12px (más compacto)
4. Tamaño de título: var(--fs-base) → 0.875rem (14px) (más pequeño)
5. Tamaño de fecha/info: var(--fs-sm) → 0.75rem (12px) (más pequeño)
6. Tamaño de stock: var(--fs-xs) → 0.7rem (11.2px) (más pequeño)
7. Botones: padding var(--space-sm) → 6px 10px (más compactos)
8. Botones: font-size var(--fs-sm) → 0.7rem (más pequeño)
9. Botones: border-radius agregado → 20px (efecto pill)
10. Botones: font-weight 500 y centrado mejorado
*/
