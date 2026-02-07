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

            // Self-Healing: Check for Admin in background
            if (db.objectStoreNames.contains('users')) {
                try {
                    const tx = db.transaction(['users'], 'readwrite');
                    const store = tx.objectStore('users');
                    const adminReq = store.get('admin');

                    adminReq.onsuccess = () => {
                        if (!adminReq.result) {
                            console.log('🚨 Admin missing! Re-creating...');
                            store.put({
                                username: 'admin',
                                password: 'Artto,healthesoul-29112001',
                                role: 'admin',
                                createdAt: new Date().toISOString()
                            });
                        }
                    };
                } catch (e) {
                    console.error('Error checking admin user:', e);
                }
            }

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

            // Create users store (New RBAC System)
            if (!db.objectStoreNames.contains('users')) {
                const usersStore = db.createObjectStore('users', { keyPath: 'username' });
                console.log('Users store created ✅');

                // Initialize Default Admin directly in the upgrade transaction
                usersStore.add({
                    username: 'admin',
                    password: 'Artto,healthesoul-29112001',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                });
                console.log('👑 Default Admin User Initialized!');
            }
        };
    });
}

// Save all artists to IndexedDB
async function saveArtistsDB(artists) {
    console.log('💾 saveArtistsDB: Starting save...');
    console.log('💾 saveArtistsDB: db initialized?', !!db);

    if (!db) {
        console.log('💾 saveArtistsDB: Initializing DB first...');
        await initDB();
    }

    // Validate input
    if (!Array.isArray(artists)) {
        console.error('❌ saveArtistsDB: artists is not an array!', typeof artists, artists);
        return Promise.reject(new Error('Invalid artists data: not an array'));
    }

    console.log(`💾 saveArtistsDB: Saving ${artists.length} artists`);

    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);

            console.log('💾 saveArtistsDB: Transaction created');

            // Clear existing data
            const clearRequest = objectStore.clear();

            clearRequest.onsuccess = () => {
                console.log('💾 saveArtistsDB: Cleared old data');
                // Add all artists
                artists.forEach((artist, index) => {
                    // Use structuredClone for better handling of large data
                    const artistCopy = structuredClone ? structuredClone(artist) : { ...artist };
                    console.log(`💾 saveArtistsDB: Adding artist ${index}:`, artistCopy.name,
                        'has imageData:', !!artistCopy.imageData,
                        'imageData length:', artistCopy.imageData ? artistCopy.imageData.length : 0);
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

        transaction.onerror = () => {
            console.error('❌ Transaction Failed:', transaction.error);
            reject(transaction.error);
        };
    });
}

// Delete a tour
async function deleteTourDB(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tours'], 'readwrite');
        const store = transaction.objectStore('tours');
        console.log('🗑️ DB: Requesting DELETE for ID:', id);
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log('✅ DB: DELETE Success for ID:', id);
            resolve(true);
        };

        request.onerror = () => {
            console.error('❌ DB: DELETE Failed:', request.error);
            reject(request.error);
        };
    });
}

// Get single tour by ID (Optimized)
async function getTourByIdDB(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tours'], 'readonly');
        const store = transaction.objectStore('tours');
        const request = store.get(Number(id));

        request.onsuccess = () => {
            console.log('🔍 DB Fetch Result for ID ' + id + ':', request.result);
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// SITE CONFIG (Home Customization)
// ==========================================

async function saveSiteConfig(config) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        // Force ID to ensure singleton
        config.id = 'home_settings';

        const transaction = db.transaction(['site_config'], 'readwrite');
        const store = transaction.objectStore('site_config');
        const request = store.put(config);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSiteConfig() {
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
