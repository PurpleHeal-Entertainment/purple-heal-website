// ========================================
// Purple Heal Admin - Tours Management
// ========================================

let currentTourDates = [];
let currentTourCover = null;

// Initialize Tours Page
async function initToursPage() {
    console.log('🎸 Initializing Tours Page...');

    // Check Auth
    if (!checkAuth()) {
        console.log('🔒 Not authenticated, showing login form');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminPanel').classList.remove('active');
        return;
    }

    console.log('🔓 Authenticated, showing tours panel');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');

    // Load Tours
    await renderToursList();

    // Hook up form submission
    const form = document.getElementById('tourForm');
    if (form) {
        form.onsubmit = handleTourSubmit;
    }
}

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

// Toggle Ticket Link Input based on Status
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


let editingDateIndex = null;

// Add or Update Date in List
function addTourDate() {
    const dateInput = document.getElementById('dateInput');
    const venueInput = document.getElementById('venueInput');
    const cityInput = document.getElementById('cityInput');
    const statusInput = document.getElementById('statusInput');
    const ticketLinkInput = document.getElementById('ticketLinkInput');
    const errorMsg = document.getElementById('dateError');
    const addBtn = document.getElementById('addDateBtn'); // Need to ensure this ID exists or use querySelector
    // Note: In admin-tours.html button usually has inline onclick, we will grab it by text or add ID if needed
    // Actually we can change the UI text dynamically in editTourDate

    // Validation
    if (!dateInput.value || !venueInput.value || !cityInput.value) {
        errorMsg.textContent = 'Por favor completa fecha, lugar y ciudad.';
        errorMsg.style.display = 'block';
        return;
    }

    // Create Date Object
    const dateObj = {
        date: dateInput.value,
        venue: venueInput.value,
        city: cityInput.value,
        status: statusInput.value,
        ticketLink: ticketLinkInput.value || '#'
    };

    if (editingDateIndex !== null) {
        // Update existing
        currentTourDates[editingDateIndex] = dateObj;
        editingDateIndex = null;

        // Reset Button Text (We need to select the button)
        const btn = document.querySelector('button[onclick="addTourDate()"]');
        if (btn) {
            btn.innerHTML = 'AGREGAR FECHA';
            btn.classList.remove('ph-button--gold'); // Remove highlight if added
        }

        // Hide Cancel Button if exists (we will need to add one dynamically or keep it hidden)
        const cancelBtn = document.getElementById('cancelDateEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'none';

    } else {
        // Add new
        currentTourDates.push(dateObj);
    }

    renderDatesList();

    // Reset Inputs
    dateInput.value = '';
    venueInput.value = '';
    cityInput.value = '';
    ticketLinkInput.value = '';
    statusInput.value = 'ticket';
    toggleTicketLink();
    errorMsg.style.display = 'none';
}

// Edit Specific Date
function editDateInList(index) {
    const dateObj = currentTourDates[index];
    if (!dateObj) return;

    editingDateIndex = index;

    // Populate inputs
    document.getElementById('dateInput').value = dateObj.date;
    document.getElementById('venueInput').value = dateObj.venue;
    document.getElementById('cityInput').value = dateObj.city;
    document.getElementById('statusInput').value = dateObj.status;

    toggleTicketLink(); // Update state

    document.getElementById('ticketLinkInput').value = dateObj.ticketLink === '#' ? '' : dateObj.ticketLink;

    // Update Button UI
    const btn = document.querySelector('button[onclick="addTourDate()"]');
    if (btn) {
        btn.innerHTML = '✅ ACTUALIZAR FECHA';
        btn.classList.add('ph-button--gold');
    }

    // Show Cancel Button (We need to create/ensure logic for this in HTML or here)
    // For now we assume we will add a hidden button in HTML or inject it
    let cancelBtn = document.getElementById('cancelDateEditBtn');
    if (!cancelBtn) {
        // If not exists (it won't initially), create logic or just rely on user knowing
    } else {
        cancelBtn.style.display = 'inline-block';
    }
}

// Cancel Date Edit
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


// Remove Date
function removeTourDate(index) {
    if (editingDateIndex === index) {
        cancelDateEdit();
    }
    currentTourDates.splice(index, 1);
    // Adjust index if we deleted something before the one being edited
    if (editingDateIndex !== null && index < editingDateIndex) {
        editingDateIndex--;
    }
    renderDatesList();
}

// Render Dates List in Form
function renderDatesList() {
    const container = document.getElementById('datesListPreview');
    if (currentTourDates.length === 0) {
        container.innerHTML = '<p style="color: var(--ph-gray-lighter); text-align: center; font-size: var(--fs-sm); font-style: italic;">No hay fechas agregadas aún.</p>';
        return;
    }

    container.innerHTML = currentTourDates.map((d, index) => {
        // Format date
        const dateParts = d.date.split('-');
        const dateFormatted = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

        let statusBadge = '';
        if (d.status === 'sold_out') statusBadge = '<span style="color: #e74c3c; font-weight: bold; font-size: 0.8em;">SOLD OUT</span>';
        if (d.status === 'coming_soon') statusBadge = '<span style="color: #f39c12; font-weight: bold; font-size: 0.8em;">PROXIMAMENTE</span>';
        if (d.status === 'ticket') statusBadge = '<span style="color: #2ecc71; font-weight: bold; font-size: 0.8em;">TICKETS</span>';

        // Add highlight if currently editing this one
        const isEditing = editingDateIndex === index;
        const bgStyle = isEditing ? 'background: rgba(48, 127, 226, 0.2); border: 1px solid var(--ph-purple-light);' : 'background: rgba(255,255,255,0.05);';

        return `
            <div class="tour-date-item" style="${bgStyle}">
                <div>
                    <strong style="color: var(--ph-white);">${dateFormatted}</strong>
                    <span style="color: var(--ph-gray-light); margin: 0 8px;">|</span>
                    <span style="color: var(--ph-purple-lighter);">${d.city}</span>
                    <span style="color: var(--ph-gray-light); margin: 0 8px;">-</span>
                    <span style="color: var(--ph-white); font-size: 0.9em;">${d.venue}</span>
                </div>
                <div class="actions">
                    ${statusBadge}
                    <div style="display: flex; gap: 4px;">
                        <button type="button" onclick="editDateInList(${index})" class="ph-button ph-button--outline" style="font-size: 0.75rem; padding: 4px 10px;">EDITAR</button>
                        <button type="button" onclick="removeTourDate(${index})" class="ph-button ph-button--outline" style="border-color: #e74c3c; color: #e74c3c; font-size: 0.75rem; padding: 4px 10px;">ELIMINAR</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Handle Tour Submit (Save)
async function handleTourSubmit(event) {
    event.preventDefault();

    if (currentTourDates.length === 0) {
        showToast('Debes agregar al menos una fecha al tour.', 'warning');
        return;
    }

    if (!currentTourCover) {
        showToast('Debes seleccionar una imagen de portada.', 'warning');
        return;
    }

    // Standard Save Logic
    const title = document.getElementById('tourTitle').value;

    const tourData = {
        title: title,
        coverImage: currentTourCover,
        dates: JSON.parse(JSON.stringify(currentTourDates)), // Deep Copy
        createdAt: new Date().toISOString()
    };

    // If editing, preserve ID and ensure it is a number
    if (currentEditingTourId) {
        tourData.id = Number(currentEditingTourId);
    }

    console.log('💾 Saving Tour Data:', tourData);

    try {
        await saveTourDB(tourData);
        showToast(currentEditingTourId ? 'Tour actualizado exitosamente!' : 'Tour creado exitosamente!');

        // Reset and Reload
        cancelAddTour();
        await renderToursList();

    } catch (error) {
        console.error('Save Error:', error);
        showToast('Error al guardar: ' + error.message, 'error');
    }
}

// Render Main Tours List
async function renderToursList() {
    const listContainer = document.getElementById('tours-list');
    listContainer.innerHTML = '<p style="text-align: center; color: var(--ph-gray-light);">Cargando tours...</p>';

    try {
        const tours = await getAllToursDB();

        if (tours.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--ph-gray-lighter); padding: var(--space-xl);">No hay tours creados. Empieza el primero.</p>';
            return;
        }

        listContainer.innerHTML = tours.map(tour => `
                    < div class="ph-card" style = "margin-bottom: var(--space-lg); overflow: hidden;" >
                <div style="height: 150px; background-image: url('${tour.coverImage}'); background-size: cover; background-position: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <!-- Clean Banner -->
                </div>
                <div class="ph-card__content" style="padding: var(--space-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 style="margin: 0; text-transform: uppercase;">${tour.title} <span style="font-size:0.7em; color:gray">#${tour.id}</span></h3>
                        <p style="color: var(--ph-purple-light); font-size: 0.9em; margin-top: 4px;">${tour.dates.length} Fechas</p>
                    </div>
                    <div style="display: flex; gap: var(--space-sm);">
                        <button onclick="editTour(${tour.id})" class="ph-button ph-button--outline" style="font-size: var(--fs-sm); padding: 4px 12px;">
                            EDITAR
                        </button>
                        <button onclick="deleteTour(${tour.id})" class="ph-button ph-button--outline" style="border-color: #e74c3c; color: #e74c3c; font-size: var(--fs-sm); padding: 4px 12px;">
                            ELIMINAR
                        </button>
                    </div>
                </div>
            </div >
                `).join('');

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p style="color: #e74c3c;">Error al cargar tours.</p>';
    }
}

// Delete Tour
async function deleteTour(id) {
    if (confirm('¿Estás seguro de eliminar este tour?')) {
        try {
            await deleteTourDB(id);
            showToast('Tour eliminado.');
            renderToursList();
        } catch (error) {
            showToast('Error al eliminar.', 'error');
        }
    }
}



let currentEditingTourId = null;

// Helper UI functions
function showAddTourForm() {
    // Hide the list card
    const listCard = document.getElementById('tours-list').closest('.ph-card');
    if (listCard) listCard.style.display = 'none';

    // Show the form
    document.getElementById('add-tour-form-container').style.display = 'block';

    // Update title depending on mode
    const titleEl = document.querySelector('#add-tour-form-container h3');
    const submitBtn = document.querySelector('#tourForm button[type="submit"]');

    if (currentEditingTourId) {
        titleEl.textContent = 'EDITAR TOUR';
        submitBtn.textContent = 'GUARDAR CAMBIOS';
    } else {
        titleEl.textContent = 'CREAR NUEVO TOUR';
        submitBtn.textContent = 'GUARDAR TOUR COMPLETO';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelAddTour() {
    // Hide the form
    document.getElementById('add-tour-form-container').style.display = 'none';

    // Show the list card
    const listCard = document.getElementById('tours-list').closest('.ph-card');
    if (listCard) listCard.style.display = 'block';

    document.getElementById('tourForm').reset();
    currentTourDates = [];
    currentTourCover = null;
    currentEditingTourId = null; // Validar reset
    document.getElementById('tourCoverPreview').style.display = 'none';
    renderDatesList();
}


// Edit Tour
async function editTour(id) {
    try {
        const tours = await getAllToursDB();
        const tour = tours.find(t => t.id === id);

        if (!tour) {
            showToast(' Tour no encontrado', 'error');
            return;
        }

        // Set editing state
        currentEditingTourId = id;

        // Populate form
        document.getElementById('tourTitle').value = tour.title;
        currentTourDates = tour.dates || [];
        currentTourCover = tour.coverImage;

        // Show preview
        const preview = document.getElementById('tourCoverPreview');
        preview.src = currentTourCover;
        preview.style.display = 'block';

        renderDatesList();
        showAddTourForm();

    } catch (error) {
        console.error(error);
        showToast(' Error al cargar tour', 'error');
    }
}
