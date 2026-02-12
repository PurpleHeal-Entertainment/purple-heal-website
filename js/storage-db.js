// ========================================
// Purple Heal - IndexedDB Storage Layer
// ========================================
// Provides unlimited storage for artists, albums, and merch data

const DB_NAME = 'PurpleHealDB';
const DB_VERSION = 6;
const STORE_NAME = 'artists';

let db = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onblocked = () => {
            console.error('🚨 DB UPGRADE BLOCKED! Please close other tabs.');
            alert('⚠️ ACTUALIZACIÓN BLOQUEADA: Hay otras pestañas de Purple Heal abiertas. Por favor ciérralas y recarga esta página para aplicar la actualización de seguridad.');
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB initialized successfully ✅');

            // Admin check removed for security. Public site does not need admin user.

            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            // Create artists store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('name', 'name', { unique: false });
                console.log('Artists store created ✅');
            }

            // Create tours store if it doesn't exist
            if (!db.objectStoreNames.contains('tours')) {
                const toursStore = db.createObjectStore('tours', { keyPath: 'id', autoIncrement: true });
                toursStore.createIndex('title', 'title', { unique: false });
                console.log('Tours store created ✅');
            }

            // Create site_config store (Single Object Store)
            if (!db.objectStoreNames.contains('site_config')) {
                const configStore = db.createObjectStore('site_config', { keyPath: 'id' });
                console.log('Site Config store created ✅');
            }

            // Users store removed for security. Auth is now handled by Firebase.
        };
    });
}

// --- HYBRID MODE: Auto-detect if we should load from JSON (Public Site) or IDB (Admin/Local) ---
// If we are NOT on an admin page, try to fetch JSON first.
async function fetchPublicData(filename) {
    const isLocalAdmin = window.location.pathname.includes('admin') || window.location.pathname.includes('login');
    const isLocalFile = window.location.protocol === 'file:';

    // If we are in Admin Panel or running purely local file protocol without server, use IDB
    if (isLocalAdmin) {
        console.log(`🔒 Admin Mode: Skipping JSON fetch for ${filename}`);
        return null;
    }

    try {
        console.log(`☁️ Public Mode: Fetching data/${filename}...`);
        // Add timestamp to prevent caching
        const response = await fetch(`data/${filename}?t=${Date.now()}`);

        if (!response.ok) {
            // If file not found (e.g. first run), fallback to IDB
            console.warn(`⚠️ JSON fetch failed for ${filename}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        console.log(`✅ Loaded ${filename} from Cloud`);
        return data;
    } catch (error) {
        console.error(`❌ Error fetching ${filename}:`, error);
        return null;
    }
}

// Save all artists to IndexedDB
const isPublicSite = !window.location.pathname.includes('admin');

// Helper to fetch JSON with fallback
async function fetchPublicData(filename) {
    if (!isPublicSite) return null; // Admin always uses IDB
    try {
        // Cache busting to ensure fresh data
        const response = await fetch(`data/${filename}?t=${new Date().getTime()}`);
        if (response.ok) {
            console.log(`🌍 Public Mode: Loaded ${filename} from server.`);
            return await response.json();
        }
    } catch (e) {
        console.warn(`⚠️ Public Mode: Could not load ${filename}, falling back to IDB.`, e);
    }
    return null;
}

async function loadArtistsDB() {
    // 1. Try JSON (Public Mode)
    const jsonData = await fetchPublicData('artists.json');
    if (jsonData) return jsonData;

    // 2. Fallback to IDB (Admin Mode or Offline)
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['artists'], 'readonly');
        const store = transaction.objectStore('artists');
        const request = store.getAll();

        request.onsuccess = () => {
            if (request.result && request.result.length > 0) {
                console.log(`📦 Loaded ${request.result.length} artists from IndexedDB`);
                resolve(request.result);
            } else {
                console.log('📭 IndexedDB is empty.');
                resolve([]);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

// NOTE: saveArtistsDB remains IDB-only because public site doesn't save.
async function saveArtistsDB(artists) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['artists'], 'readwrite');
            const objectStore = transaction.objectStore('artists');
            console.log('💾 saveArtistsDB: Transaction created');

            // Clear existing data
            const clearRequest = objectStore.clear();

            clearRequest.onsuccess = () => {
                console.log('💾 saveArtistsDB: Cleared old data');
                // Add all artists
                artists.forEach((artist, index) => {
                    // Use structuredClone for better handling of large data
                    const artistCopy = structuredClone ? structuredClone(artist) : { ...artist };
                    // console.log(`💾 saveArtistsDB: Adding artist ${index}:`, artistCopy.name); 
                    // Log commented out to reduce noise
                    try {
                        objectStore.add(artistCopy);
                    } catch (addError) {
                        console.error(`❌ Error adding artist ${index}:`, addError);
                        throw addError;
                    }
                });
            };

            clearRequest.onerror = () => {
                console.error('❌ saveArtistsDB: Clear error:', clearRequest.error);
                reject(clearRequest.error);
            };

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${artists.length} artists to IndexedDB successfully!`);
                resolve();
            };

            transaction.onerror = () => {
                console.error('❌ Transaction error:', transaction.error);
                reject(transaction.error);
            };

            transaction.onabort = () => {
                console.error('❌ Transaction aborted!', transaction.error);
                reject(transaction.error || new Error('Transaction aborted'));
            };
        } catch (error) {
            console.error('❌ saveArtistsDB exception:', error);
            console.error('Stack:', error.stack);
            reject(error);
        }
    });
}

// Load all artists from IndexedDB
async function loadArtistsDB() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = () => {
            // getAll() returns artists in insertion order, which matches array indices
            const artists = request.result || [];
            console.log(`📥 loadArtistsDB: Loaded ${artists.length} artists from IndexedDB`);

            // DEBUG: Check each artist for imageData
            artists.forEach((artist, index) => {
                console.log(`📥 Artist ${index} (${artist.name}):`, {
                    hasImageData: !!artist.imageData,
                    imageDataLength: artist.imageData ? artist.imageData.length : 0,
                    imageDataStart: artist.imageData ? artist.imageData.substring(0, 30) : 'N/A'
                });
            });

            resolve(artists);
        };

        request.onerror = () => {
            console.error('Load error:', request.error);
            reject(request.error);
        };
    });
}

// Migrate data from localStorage to IndexedDB (ONE TIME ONLY)
async function migrateFromLocalStorage() {
    console.log('🔄 Checking if migration is needed...');

    try {
        // Check if migration has already been done
        const migrationDone = localStorage.getItem('ph_migration_completed');
        if (migrationDone) {
            console.log('✅ Migration already completed previously, skipping.');
            return false;
        }

        // Check if data exists in localStorage
        const localData = localStorage.getItem('ph_artists');

        if (localData) {
            const artists = JSON.parse(localData);
            console.log(`Found ${artists.length} artists in localStorage`);

            // Check if IndexedDB already has data
            const existingArtists = await loadArtistsDB();
            if (existingArtists && existingArtists.length > 0) {
                console.log('⚠️ IndexedDB already has data. Skipping migration to preserve existing data.');
                localStorage.setItem('ph_migration_completed', 'true');
                return false;
            }

            // Save to IndexedDB (only if IndexedDB is empty)
            await saveArtistsDB(artists);

            // Mark migration as complete
            localStorage.setItem('ph_migration_completed', 'true');
            console.log('✅ Migration completed successfully!');
            return true;
        } else {
            console.log('No data to migrate from localStorage');
            localStorage.setItem('ph_migration_completed', 'true');
            return false;
        }
    } catch (error) {
        console.error('Migration error:', error);
        return false;
    }
}

// Check storage usage
async function getStorageInfo() {
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const used = (estimate.usage / 1024 / 1024).toFixed(2);
        const total = (estimate.quota / 1024 / 1024).toFixed(2);
        console.log(`📊 Storage: ${used} MB / ${total} MB (${((estimate.usage / estimate.quota) * 100).toFixed(1)}%)`);
        return estimate;
    }
    return null;
}

// ==========================================
// TOURS FUNCTIONS (New Feature)
// ==========================================

// Load all tours
async function getAllToursDB() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tours'], 'readonly');
        const store = transaction.objectStore('tours');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Save a single tour (add or update)
async function saveTourDB(tour) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        // Use structuredClone/Copy to detach from any proxies
        const tourCopy = JSON.parse(JSON.stringify(tour));

        // Validate and force ID to be a number if it exists
        if (tourCopy.id) {
            tourCopy.id = Number(tourCopy.id);
        }

        const transaction = db.transaction(['tours'], 'readwrite');
        const store = transaction.objectStore('tours');

        console.log('💾 Saving Tour (Clone):', tourCopy);

        // Put handles both Add (if key is new) and Update (if key exists)
        const request = store.put(tourCopy);

        request.onsuccess = () => {
            console.log('✅ Tour saved successfully via PUT.');
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('❌ Request Failed:', request.error);
            reject(request.error);
        };

        transaction.onerror = () => {
            console.error('❌ Transaction Failed:', transaction.error);
            reject(transaction.error);
        };
    });
}

// Get Tour by ID
function getTourByIdDB(id) {
    if (!db) return Promise.reject("DB not init");
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tours'], 'readonly');
        const store = transaction.objectStore('tours');
        // Ensure ID is number if keyPath is number
        const request = store.get(Number(id));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Delete a tour
async function deleteTourDB(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tours'], 'readwrite');
        const store = transaction.objectStore('tours');
        const request = store.delete(Number(id));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// SITE CONFIG (Home Customization)
// ==========================================

async function saveSiteConfig(config) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        // Ensure ID is set
        config.id = 'home_settings';

        const transaction = db.transaction(['site_config'], 'readwrite');
        const store = transaction.objectStore('site_config');
        const request = store.put(config);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSiteConfig() {
    // 1. Try JSON (Public Mode)
    const jsonData = await fetchPublicData('site_config.json');
    if (jsonData) return jsonData;

    // 2. Fallback to IDB
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['site_config'], 'readonly');
        const store = transaction.objectStore('site_config');
        const request = store.get('home_settings');

        request.onsuccess = () => {
            // Default Config if none exists
            const defaults = {
                id: 'home_settings',
                showStats: true,
                showJoinSection: true, // "Busqueda de nuevos talentos"
                showContact: true, // "Trabaja con nosotros"
                showStore: false, // "Tienda" (future feature)
                showOffers: true, // "Ofertas"
                showBackstage: true, // "Purple Backstage" (YouTube subscription etc)
                promoTitle: 'OFERTAS IMPERDIBLES',
                promoSubtitle: 'EN MERCH SELECCIONADO',
                promoDescription: 'Aprovecha descuentos exclusivos en productos de tus artistas favoritos.',
                stats: [
                    { number: '10+', label: 'Artistas Talentosos' },
                    { number: '50+', label: 'Lanzamientos Musicales' },
                    { number: '100K+', label: 'Fans en el Mundo' }
                ],
                featuredTourId: null // Null means none selected
            };
            resolve(request.result || defaults);
        };
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// USER MANAGEMENT FUNCTIONS (RBAC)
// ==========================================

async function getAllUsersDB() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function getUserDB(username) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(username);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveUserDB(user) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        if (!user.username || !user.password || !user.role) {
            reject(new Error('Invalid user data'));
            return;
        }

        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.put(user);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteUserDB(username) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        if (username === 'admin') {
            reject(new Error('Cannot delete main admin account'));
            return;
        }

        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.delete(username);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// Export functions
window.initDB = initDB;
window.saveArtistsDB = saveArtistsDB;
window.loadArtistsDB = loadArtistsDB;
window.migrateFromLocalStorage = migrateFromLocalStorage;
window.getStorageInfo = getStorageInfo;
window.getAllToursDB = getAllToursDB;
window.getTourByIdDB = getTourByIdDB;
window.saveTourDB = saveTourDB;
window.deleteTourDB = deleteTourDB;
window.saveSiteConfig = saveSiteConfig;
window.getSiteConfig = getSiteConfig;
// Users
window.getAllUsersDB = getAllUsersDB;
window.getUserDB = getUserDB;
window.saveUserDB = saveUserDB;
window.deleteUserDB = deleteUserDB;
