// INLINE FORMS - ALBUM & MERCH MANAGEMENT
// ===================================================

// Global counters for inline image inputs
const inlineAlbumImageCounters = {};
const inlineMerchImageCounters = {};

// Toggle inline album form
function toggleInlineAlbumForm(artistIndex) {
    const formContainer = document.getElementById(`albumFormContainer-${artistIndex}`);
    const toggleText = document.getElementById(`albumFormToggleText-${artistIndex}`);

    if (formContainer.style.display === 'none') {
        formContainer.style.display = 'block';
        toggleText.textContent = '− OCULTAR FORMULARIO';
        // Initialize first image input
        if (!inlineAlbumImageCounters[artistIndex]) {
            inlineAlbumImageCounters[artistIndex] = 0;
            addInlineAlbumImage(artistIndex);
        }
    } else {
        formContainer.style.display = 'none';
        toggleText.textContent = '+ AGREGAR ÁLBUM';
    }
}

// Cancel inline album form
function cancelInlineAlbumForm(artistIndex) {
    const form = document.getElementById(`artistAlbumForm-${artistIndex}`);
    form.reset();
    document.getElementById(`inlineAlbumImagesContainer-${artistIndex}`).innerHTML = '';
    inlineAlbumImageCounters[artistIndex] = 0;
    toggleInlineAlbumForm(artistIndex);
}

// Add image input for inline album
function addInlineAlbumImage(artistIndex) {
    const counter = inlineAlbumImageCounters[artistIndex] || 0;
    if (counter >= 15) {
        alert('Máximo 15 imágenes por álbum');
        return;
    }

    const container = document.getElementById(`inlineAlbumImagesContainer-${artistIndex}`);
    const imageIndex = counter;

    const imageItem = document.createElement('div');
    imageItem.className = 'image-upload-item';
    imageItem.style.marginBottom = 'var(--space-md)';
    imageItem.innerHTML = `
        <label class="form-label" style="font-size: var(--fs-sm);">Imagen ${imageIndex + 1}</label>
        <input type="file" class="form-input" id="inlineAlbumImage-${artistIndex}-${imageIndex}" accept="image/*" data-image-index="${imageIndex}">
        <img class="image-preview" id="inlineAlbumPreview-${artistIndex}-${imageIndex}" style="display: none; max-width: 200px; margin-top: var(--space-sm); border-radius: var(--border-radius);">
    `;

    container.appendChild(imageItem);

    // Add event listener for image preview
    const input = document.getElementById(`inlineAlbumImage-${artistIndex}-${imageIndex}`);
    input.addEventListener('change', function () {
        handleImagePreview(this, `inlineAlbumPreview-${artistIndex}-${imageIndex}`);
    });

    inlineAlbumImageCounters[artistIndex] = counter + 1;
}

// Handle image preview
function handleImagePreview(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Toggle inline merch form
function toggleInlineMerchForm(artistIndex) {
    const formContainer = document.getElementById(`merchFormContainer-${artistIndex}`);
    const toggleText = document.getElementById(`merchFormToggleText-${artistIndex}`);

    if (formContainer.style.display === 'none') {
        formContainer.style.display = 'block';
        toggleText.textContent = '− OCULTAR FORMULARIO';
        // Initialize first image input
        if (!inlineMerchImageCounters[artistIndex]) {
            inlineMerchImageCounters[artistIndex] = 0;
            addInlineMerchImage(artistIndex);
        }
    } else {
        formContainer.style.display = 'none';
        toggleText.textContent = '+ AGREGAR PRODUCTO';
    }
}

// Cancel inline merch form
function cancelInlineMerchForm(artistIndex) {
    const form = document.getElementById(`artistMerchForm-${artistIndex}`);
    form.reset();
    document.getElementById(`inlineMerchImagesContainer-${artistIndex}`).innerHTML = '';
    inlineMerchImageCounters[artistIndex] = 0;
    toggleInlineMerchForm(artistIndex);
}

// Add image input for inline merch
function addInlineMerchImage(artistIndex) {
    const counter = inlineMerchImageCounters[artistIndex] || 0;
    if (counter >= 15) {
        alert('Máximo 15 imágenes por producto');
        return;
    }

    const container = document.getElementById(`inlineMerchImagesContainer-${artistIndex}`);
    const imageIndex = counter;

    const imageItem = document.createElement('div');
    imageItem.className = 'image-upload-item';
    imageItem.style.marginBottom = 'var(--space-md)';
    imageItem.innerHTML = `
        <label class="form-label" style="font-size: var(--fs-sm);">Imagen ${imageIndex + 1}</label>
        <input type="file" class="form-input" id="inlineMerchImage-${artistIndex}-${imageIndex}" accept="image/*" data-image-index="${imageIndex}">
        <img class="image-preview" id="inlineMerchPreview-${artistIndex}-${imageIndex}" style="display: none; max-width: 200px; margin-top: var(--space-sm); border-radius: var(--border-radius);">
    `;

    container.appendChild(imageItem);

    // Add event listener for image preview
    const input = document.getElementById(`inlineMerchImage-${artistIndex}-${imageIndex}`);
    input.addEventListener('change', function () {
        handleImagePreview(this, `inlineMerchPreview-${artistIndex}-${imageIndex}`);
    });

    inlineMerchImageCounters[artistIndex] = counter + 1;
}

// Handle inline album form submission
async function handleInlineAlbumSubmit(artistIndex) {
    const title = document.getElementById(`inlineAlbumTitle-${artistIndex}`).value;
    const year = document.getElementById(`inlineAlbumYear-${artistIndex}`).value;
    const type = document.getElementById(`inlineAlbumType-${artistIndex}`).value;
    const stock = document.getElementById(`inlineAlbumStock-${artistIndex}`).value;
    const purchaseLink = document.getElementById(`inlineAlbumPurchaseLink-${artistIndex}`).value;

    // Collect all image files
    const imageContainer = document.getElementById(`inlineAlbumImagesContainer-${artistIndex}`);
    const imageInputs = imageContainer.querySelectorAll('input[type="file"]');
    const images = [];

    // Process each image
    for (let i = 0; i < imageInputs.length; i++) {
        if (imageInputs[i].files && imageInputs[i].files[0]) {
            const imageData = await fileToBase64(imageInputs[i].files[0]);
            images.push(imageData);
        }
    }

    // Create album object
    const newAlbum = {
        title: title,
        year: year,
        type: type,
        stock: stock || 'EN STOCK',
        purchaseLink: purchaseLink || '',
        images: images.length > 0 ? images : [],
        cover: images.length > 0 ? images[0] : null
    };

    // Save to IndexedDB
    const artists = await loadArtists();
    if (!artists[artistIndex].albums) {
        artists[artistIndex].albums = [];
    }
    artists[artistIndex].albums.push(newAlbum);
    await saveArtists(artists);
    await updateFrontendData();

    // Reset form and close
    document.getElementById(`artistAlbumForm-${artistIndex}`).reset();
    document.getElementById(`inlineAlbumImagesContainer-${artistIndex}`).innerHTML = '';
    inlineAlbumImageCounters[artistIndex] = 0;
    toggleInlineAlbumForm(artistIndex);

    // Refresh the albums list
    renderArtistAlbums(artists[artistIndex], artistIndex);

    alert('✅ Álbum agregado exitosamente!');
}

// Handle inline merch form submission
async function handleInlineMerchSubmit(artistIndex) {
    const name = document.getElementById(`inlineMerchName-${artistIndex}`).value;
    const price = document.getElementById(`inlineMerchPrice-${artistIndex}`).value;
    const description = document.getElementById(`inlineMerchDescription-${artistIndex}`).value;
    const stock = document.getElementById(`inlineMerchStock-${artistIndex}`).value;
    const purchaseLink = document.getElementById(`inlineMerchPurchaseLink-${artistIndex}`).value;

    // Collect all image files
    const imageContainer = document.getElementById(`inlineMerchImagesContainer-${artistIndex}`);
    const imageInputs = imageContainer.querySelectorAll('input[type="file"]');
    const images = [];

    // Process each image
    for (let i = 0; i < imageInputs.length; i++) {
        if (imageInputs[i].files && imageInputs[i].files[0]) {
            const imageData = await fileToBase64(imageInputs[i].files[0]);
            images.push(imageData);
        }
    }

    // Create merch object
    const newMerch = {
        name: name,
        price: price,
        description: description || '',
        stock: stock || 'EN STOCK',
        purchaseLink: purchaseLink || '',
        images: images.length > 0 ? images : [],
        image: images.length > 0 ? images[0] : null
    };

    // Save to IndexedDB
    const artists = await loadArtists();
    if (!artists[artistIndex].merchandise) {
        artists[artistIndex].merchandise = [];
    }
    artists[artistIndex].merchandise.push(newMerch);
    await saveArtists(artists);
    await updateFrontendData();

    // Reset form and close
    document.getElementById(`artistMerchForm-${artistIndex}`).reset();
    document.getElementById(`inlineMerchImagesContainer-${artistIndex}`).innerHTML = '';
    inlineMerchImageCounters[artistIndex] = 0;
    toggleInlineMerchForm(artistIndex);

    // Refresh the merch list
    renderArtistMerch(artists[artistIndex], artistIndex);

    alert('✅ Producto agregado exitosamente!');
}

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

