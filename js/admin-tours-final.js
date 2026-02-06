// ========================================
// Purple Heal Admin - Tours Management (ROUTED VERSION)
// ========================================

// STATE
let currentTourDates = [];
let currentTourCover = null;
let currentEditingTourId = null; // Derived from URL
let editingDateIndex = null;

// INIT
async function initToursPage() {
    console.log('🎸 Initializing Tours Page (ROUTER MODE)...');

    if (!checkAuth()) {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminPanel').classList.remove('active');
        return;
    }

    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');

    // ROUTER LOGIC
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const isNew = urlParams.get('new');

    if (editId) {
        // MODE: EDIT
        console.log('📌 Router: Edit Mode for ID', editId);
        await enterEditMode(editId);
    } else if (isNew) {
        // MODE: CREATE
        console.log('📌 Router: Create Mode');
        enterCreateMode();
    } else {
        // MODE: LIST (Default)
        console.log('📌 Router: List Mode');
        await renderToursList();
        document.getElementById('add-tour-form-container').style.display = 'none';
        document.getElementById('tours-list').closest('.ph-card').style.display = 'block';
    }

    // Hook Form
    const form = document.getElementById('tourForm');
    if (form) form.onsubmit = handleTourSubmit;
}

// ==========================================
// ROUTER ACTIONS (NAVIGATE)
// ==========================================

function navigateToEdit(id) {
    window.location.href = `admin-tours.html?edit=${id}`;
}

function navigateToCreate() {
    window.location.href = `admin-tours.html?new=true`;
}

function navigateToList() {
    window.location.href = `admin-tours.html`;
}

// ==========================================
// VIEW CONTROLLERS
// ==========================================

async function enterEditMode(id) {
    // Hide List, Show Form
    document.getElementById('tours-list').closest('.ph-card').style.display = 'none';
    document.getElementById('add-tour-form-container').style.display = 'block';

    const titleEl = document.querySelector('#add-tour-form-container h3');
    const submitBtn = document.querySelector('#tourForm button[type="submit"]');

    titleEl.textContent = 'EDITAR TOUR';
    submitBtn.textContent = 'GUARDAR CAMBIOS';

    // Load Data
    try {
        currentEditingTourId = id;
        const tours = await getAllToursDB();
        const tour = tours.find(t => t.id === Number(id));

        if (!tour) {
            alert('Tour no encontrado.');
            navigateToList();
            return;
        }

        // POPULATE STATE
        document.getElementById('tourTitle').value = tour.title;
        currentTourDates = JSON.parse(JSON.stringify(tour.dates || []));
        currentTourCover = tour.coverImage;

        // POPULATE UI
        const preview = document.getElementById('tourCoverPreview');
        preview.src = currentTourCover;
        preview.style.display = 'block';

        renderDatesList();

    } catch (e) {
        console.error(e);
        alert('Error cargando tour');
        navigateToList();
    }
}

function enterCreateMode() {
    // Hide List, Show Form
    document.getElementById('tours-list').closest('.ph-card').style.display = 'none';
    document.getElementById('add-tour-form-container').style.display = 'block';

    const titleEl = document.querySelector('#add-tour-form-container h3');
    const submitBtn = document.querySelector('#tourForm button[type="submit"]');

    titleEl.textContent = 'CREAR NUEVO TOUR';
    submitBtn.textContent = 'CREAR TOUR';

    // Clear State
    currentEditingTourId = null;
    currentTourDates = [];
    currentTourCover = null;
}

// ==========================================
// CORE LOGIC (Dates, Images, Save)
// ==========================================

// Preview Cover Image
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

// Toggle Ticket Link
function toggleTicketLink() {
    const status = document.getElementById('statusInput').value;
    const container = document.getElementById('ticketLinkContainer');
    const input = document.getElementById('ticketLinkInput');

    if (status === 'coming_soon') {
        container.style.opacity = '0.5';
        input.disabled = true;
        input.value = '';
    } else {
        container.style.opacity = '1';
        input.disabled = false;
    }
}

// Add/Update Date
function addTourDate() {
    const dateInput = document.getElementById('dateInput');
    const venueInput = document.getElementById('venueInput');
    const cityInput = document.getElementById('cityInput');
    const statusInput = document.getElementById('statusInput');
    const ticketLinkInput = document.getElementById('ticketLinkInput');
    const errorMsg = document.getElementById('dateError');

    if (!dateInput.value || !venueInput.value || !cityInput.value) {
        errorMsg.textContent = 'Por favor completa campos.';
        errorMsg.style.display = 'block';
        return;
    }

    const dateObj = {
        date: dateInput.value,
        venue: venueInput.value,
        city: cityInput.value,
        status: statusInput.value,
        ticketLink: ticketLinkInput.value || '#'
    };

    if (editingDateIndex !== null) {
        currentTourDates[editingDateIndex] = dateObj;
        editingDateIndex = null;

        // Reset UI
        const btn = document.querySelector('button[onclick="addTourDate()"]');
        if (btn) {
            btn.innerHTML = 'AGREGAR FECHA';
            btn.classList.remove('ph-button--gold');
        }
        const cancelBtn = document.getElementById('cancelDateEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'none';

    } else {
        currentTourDates.push(dateObj);
    }

    renderDatesList();

    // Reset Form
    dateInput.value = '';
    venueInput.value = '';
    cityInput.value = '';
    ticketLinkInput.value = '';
    statusInput.value = 'ticket';
    toggleTicketLink();
    errorMsg.style.display = 'none';
}

function editDateInList(index) {
    editingDateIndex = index;
    const d = currentTourDates[index];

    document.getElementById('dateInput').value = d.date;
    document.getElementById('venueInput').value = d.venue;
    document.getElementById('cityInput').value = d.city;
    document.getElementById('statusInput').value = d.status;
    document.getElementById('ticketLinkInput').value = d.ticketLink === '#' ? '' : d.ticketLink;
    toggleTicketLink();

    const btn = document.querySelector('button[onclick="addTourDate()"]');
    if (btn) {
        btn.innerHTML = 'ACTUALIZAR FECHA';
        btn.classList.add('ph-button--gold');
    }
    const cancelBtn = document.getElementById('cancelDateEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function cancelDateEdit() {
    editingDateIndex = null;
    document.getElementById('dateInput').value = '';
    document.getElementById('venueInput').value = '';
    document.getElementById('cityInput').value = '';
    document.getElementById('ticketLinkInput').value = '';
    document.getElementById('statusInput').value = 'ticket';
    toggleTicketLink();

    const btn = document.querySelector('button[onclick="addTourDate()"]');
    if (btn) {
        btn.innerHTML = 'AGREGAR FECHA';
        btn.classList.remove('ph-button--gold');
    }
    const cancelBtn = document.getElementById('cancelDateEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function removeTourDate(index) {
    currentTourDates.splice(index, 1);
    if (editingDateIndex === index) cancelDateEdit();
    renderDatesList();
}

function renderDatesList() {
    const c = document.getElementById('datesListPreview');
    if (currentTourDates.length === 0) {
        c.innerHTML = '<p style="color:gray;text-align:center;">Sin fechas.</p>';
        return;
    }
    c.innerHTML = currentTourDates.map((d, i) => {
        let st = d.status.toUpperCase().replace('_', ' ');
        let col = d.status === 'sold_out' ? '#e74c3c' : (d.status === 'coming_soon' ? '#f39c12' : '#2ecc71');

        return `
        <div style="background: rgba(255,255,255,0.05); margin-bottom: 5px; padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
            <div>
                <strong>${d.date}</strong> | ${d.city}
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="color:${col}; font-weight:bold; font-size:0.8em;">${st}</span>
                <button type="button" onclick="editDateInList(${i})" class="ph-button ph-button--outline" style="padding: 2px 8px; font-size: 0.7em;">EDIT</button>
                <button type="button" onclick="removeTourDate(${i})" class="ph-button ph-button--outline" style="padding: 2px 8px; font-size: 0.7em; border-color: red; color: red;">DEL</button>
            </div>
        </div>`;
    }).join('');
}


// SAVE HANDLER
async function handleTourSubmit(e) {
    e.preventDefault();

    if (currentTourDates.length === 0 || !currentTourCover) {
        showToast('Faltan datos obligatorios (fechas o imagen).', 'warning');
        return;
    }

    const title = document.getElementById('tourTitle').value;
    const tourData = {
        title: title,
        coverImage: currentTourCover,
        dates: JSON.parse(JSON.stringify(currentTourDates)),
        createdAt: new Date().toISOString()
    };

    if (currentEditingTourId) {
        tourData.id = Number(currentEditingTourId); // STRICT NUMBER
    }

    console.log('💾 Saving:', tourData);

    try {
        await saveTourDB(tourData);
        alert('Guardado exitosamente. Volviendo al listado...');
        navigateToList(); // Redirect to home
    } catch (err) {
        console.error(err);
        alert('Error al guardar: ' + err.message);
    }
}

// Render List (Home)
async function renderToursList() {
    const c = document.getElementById('tours-list');
    c.innerHTML = 'Wait...';
    try {
        const tours = await getAllToursDB();
        if (tours.length === 0) { c.innerHTML = 'No tours.'; return; }

        c.innerHTML = tours.map(t => `
            <div class="ph-card" style="margin-bottom: 20px;">
                <div style="height:100px; background:url('${t.coverImage}') center/cover;"></div>
                <div style="padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <h3>${t.title} <small>#${t.id}</small></h3>
                    <div>
                        <button onclick="navigateToEdit(${t.id})" class="ph-button">EDITAR</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); c.innerHTML = 'Error'; }
}
