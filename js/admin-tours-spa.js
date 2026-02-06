// ========================================
// Purple Heal Admin - Tours Management (SPA v3 - BEST OF BOTH WORLDS)
// ========================================

// STATE
let currentTourDates = [];
let currentTourCover = null;
let currentEditingTourId = null;
let editingDateIndex = null;

// INIT
async function initToursPage() {
    console.log('🎸 Initializing Tours Layout (SPA Mode)...');

    if (!checkAuth()) {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminPanel').classList.remove('active');
        return;
    }

    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');

    // Initial Load
    await renderToursList();

    // Ensure form is hidden
    cancelAddTour();
}

// ==========================================
// NAVIGATION (SPA)
// ==========================================

function showCreateForm() {
    console.log('➕ Mode: CREATE');

    // 1. Reset State
    currentEditingTourId = null;
    currentTourDates = [];
    currentTourCover = null;
    editingDateIndex = null;
    document.getElementById('tourForm').reset();

    // 2. Update UI Text
    document.querySelector('#add-tour-form-container h3').textContent = 'CREAR NUEVO TOUR';

    // 3. Clear Previews
    const preview = document.getElementById('tourCoverPreview');
    preview.src = '';
    preview.style.display = 'none';
    renderDatesList();

    // 4. Swap Views
    document.getElementById('tours-list').closest('.ph-card').style.display = 'none';
    document.getElementById('add-tour-form-container').style.display = 'block';

    // 5. Scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showEditForm(id) {
    console.log('✏️ Mode: EDIT for ID', id);

    try {
        // 1. Fetch Data
        const tours = await getAllToursDB();
        const tour = tours.find(t => Number(t.id) === Number(id));

        if (!tour) {
            alert('❌ Tour no encontrado en la base de datos.');
            return;
        }

        // 2. Set State
        currentEditingTourId = id;
        currentTourDates = JSON.parse(JSON.stringify(tour.dates || []));
        currentTourCover = tour.coverImage;
        editingDateIndex = null;

        // 3. Populate Form Inputs
        document.getElementById('tourTitle').value = tour.title || '';

        // 4. Update UI Text
        document.querySelector('#add-tour-form-container h3').textContent = 'EDITAR TOUR #' + id;

        // 5. Previews
        const preview = document.getElementById('tourCoverPreview');
        if (currentTourCover) {
            preview.src = currentTourCover;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
        renderDatesList();

        // 6. Swap Views
        document.getElementById('tours-list').closest('.ph-card').style.display = 'none';
        document.getElementById('add-tour-form-container').style.display = 'block';

        // 7. Scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('Error al cargar datos del tour: ' + e.message);
    }
}

function cancelAddTour() {
    console.log('🔙 Back to List');
    document.getElementById('add-tour-form-container').style.display = 'none';
    document.getElementById('tours-list').closest('.ph-card').style.display = 'block';

    // Cleanup
    document.getElementById('tourForm').reset();
    currentTourDates = [];
}

// ==========================================
// CORE LOGIC (Dates, Images)
// ==========================================

function previewTourCover(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentTourCover = e.target.result;
            const preview = document.getElementById('tourCoverPreview');
            preview.src = currentTourCover;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function toggleTicketLink() {
    const status = document.getElementById('statusInput').value;
    const input = document.getElementById('ticketLinkInput');
    const container = document.getElementById('ticketLinkContainer');

    if (status === 'coming_soon') {
        container.style.opacity = '0.5';
        input.disabled = true;
        input.value = '';
    } else {
        container.style.opacity = '1';
        input.disabled = false;
    }
}

function addTourDate() {
    const d = {
        date: document.getElementById('dateInput').value,
        venue: document.getElementById('venueInput').value,
        city: document.getElementById('cityInput').value,
        status: document.getElementById('statusInput').value,
        ticketLink: document.getElementById('ticketLinkInput').value || '#'
    };

    if (!d.date || !d.venue || !d.city) {
        alert('Faltan datos de la fecha.');
        return;
    }

    if (editingDateIndex !== null) {
        currentTourDates[editingDateIndex] = d;
        editingDateIndex = null;
        document.querySelector('button[onclick="addTourDate()"]').textContent = '+ AGREGAR FECHA';
    } else {
        currentTourDates.push(d);
    }

    renderDatesList();

    // Clear inputs
    document.getElementById('dateInput').value = '';
    document.getElementById('venueInput').value = '';
    document.getElementById('cityInput').value = '';
    document.getElementById('ticketLinkInput').value = '';
    document.getElementById('statusInput').value = 'ticket';
    toggleTicketLink();
    document.getElementById('cancelDateEditBtn').style.display = 'none';
}

function editDateInList(i) {
    editingDateIndex = i;
    const d = currentTourDates[i];
    document.getElementById('dateInput').value = d.date;
    document.getElementById('venueInput').value = d.venue;
    document.getElementById('cityInput').value = d.city;
    document.getElementById('statusInput').value = d.status;
    document.getElementById('ticketLinkInput').value = d.ticketLink === '#' ? '' : d.ticketLink;
    toggleTicketLink();

    document.querySelector('button[onclick="addTourDate()"]').textContent = 'ACTUALIZAR FECHA';
    document.getElementById('cancelDateEditBtn').style.display = 'inline-block';
}

function removeTourDate(i) {
    currentTourDates.splice(i, 1);
    renderDatesList();
}

function cancelDateEdit() {
    editingDateIndex = null;
    document.querySelector('button[onclick="addTourDate()"]').textContent = '+ AGREGAR FECHA';
    document.getElementById('cancelDateEditBtn').style.display = 'none';
    document.getElementById('dateInput').value = '';
    document.getElementById('venueInput').value = '';
    document.getElementById('cityInput').value = '';
    document.getElementById('ticketLinkInput').value = '';
}

function renderDatesList() {
    const c = document.getElementById('datesListPreview');
    if (!currentTourDates.length) {
        c.innerHTML = '<p style="color:gray;text-align:center;">Sin fechas.</p>';
        return;
    }
    c.innerHTML = currentTourDates.map((d, i) => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; ${editingDateIndex === i ? 'border:1px solid gold;' : ''}">
            <span>${d.date} | ${d.city}</span>
            <div>
                <button type="button" onclick="editDateInList(${i})" class="ph-button ph-button--outline" style="font-size:0.7em; padding:2px 8px;">EDIT</button>
                <button type="button" onclick="removeTourDate(${i})" class="ph-button ph-button--outline" style="font-size:0.7em; padding:2px 8px; color:red; border-color:red;">DEL</button>
            </div>
        </div>
    `).join('');
}


// ==========================================
// SAVE HANDLER (DELETE-THEN-CREATE)
// ==========================================
async function handleTourSubmit(e) {
    if (e) e.preventDefault(); // Handle explicit event or manual call

    if (!currentTourDates.length || !currentTourCover) {
        alert('⚠️ Faltan fechas o imagen de portada.');
        return;
    }

    const title = document.getElementById('tourTitle').value;
    const tourPayload = {
        title: title,
        coverImage: currentTourCover,
        dates: JSON.parse(JSON.stringify(currentTourDates)),
        createdAt: new Date().toISOString()
    };

    // SAFE PROMISE WRAPPER
    const withTimeout = (promise, ms = 2000) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        promise.then(res => { clearTimeout(timer); resolve(res); })
            .catch(err => { clearTimeout(timer); reject(err); });
    });

    try {
        if (currentEditingTourId) {
            console.log('🔄 UPDATING: Deleting old ID ' + currentEditingTourId);
            const rawId = Number(currentEditingTourId);

            // Try to delete, but ignore timeout
            try {
                await withTimeout(deleteTourDB(rawId), 1500);
            } catch (opErr) {
                console.warn('⚠️ Delete timed out, ignoring:', opErr);
            }

            // Ensure payload has NO ID so it creates new
            delete tourPayload.id;
        }

        console.log('💾 SAVING NEW OBJECT', tourPayload);
        await saveTourDB(tourPayload);

        alert('✅ Guardado Exitoso!');

        // Return to list
        cancelAddTour();
        await renderToursList();

    } catch (err) {
        console.error(err);
        alert('❌ Error Fatal: ' + err.message);
    }
}

// ==========================================
// RENDER LIST
// ==========================================
async function renderToursList() {
    const c = document.getElementById('tours-list');
    c.innerHTML = '<p style="text-align:center;">Cargando...</p>';

    try {
        const tours = await getAllToursDB();
        if (!tours.length) {
            c.innerHTML = '<p style="text-align:center; padding:20px;">No hay tours.</p>';
            return;
        }

        c.innerHTML = tours.map(t => `
            <div class="ph-card" style="margin-bottom:20px;">
                <div style="height:100px; background:url('${t.coverImage}') center/cover;"></div>
                <div style="padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <h3>${t.title} <small>#${t.id}</small></h3>
                    <div>
                        <button onclick="showEditForm(${t.id})" class="ph-button">EDITAR</button>
                        <button onclick="deleteTour(${t.id})" class="ph-button" style="border-color:red; color:red;">BORRAR</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        c.innerHTML = 'Error al cargar lista.';
    }
}

async function deleteTour(id) {
    if (confirm('¿Borrar?')) {
        await deleteTourDB(Number(id));
        await renderToursList();
    }
}

// EXPORT
window.initToursPage = initToursPage;
window.handleTourSubmit = handleTourSubmit;
window.addTourDate = addTourDate;
window.showCreateForm = showCreateForm;
window.showEditForm = showEditForm;
window.deleteTour = deleteTour;
window.cancelAddTour = cancelAddTour;
window.previewTourCover = previewTourCover;
window.removeTourDate = removeTourDate;
window.editDateInList = editDateInList;
window.trash = deleteTour;
window.renderDatesList = renderDatesList; // helper
window.toggleTicketLink = toggleTicketLink;
