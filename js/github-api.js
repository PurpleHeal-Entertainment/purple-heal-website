const DEFAULT_CONFIG = {
    OWNER: 'PurpleHeal-Entertainment',
    REPO: 'purple-heal-website',
    BRANCH: 'main'
};

const GithubSync = {

    // --- Configuration Management ---
    saveConfig: (config) => {
        localStorage.setItem('ph_github_config', JSON.stringify(config));
    },

    getConfig: () => {
        const stored = localStorage.getItem('ph_github_config');
        return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
    },

    // --- Token Management ---
    saveToken: (token) => {
        if (!token) return;
        localStorage.setItem('ph_github_token', token);
    },

    getToken: () => {
        return localStorage.getItem('ph_github_token');
    },

    hasToken: () => {
        return !!localStorage.getItem('ph_github_token');
    },

    removeToken: () => {
        localStorage.removeItem('ph_github_token');
    },

    // --- API Interactions ---

    getObjSHA: async (path) => {
        const token = GithubSync.getToken();
        const config = GithubSync.getConfig();

        if (!token) throw new Error("No GitHub Token found. Please configure it in settings.");

        const url = `https://api.github.com/repos/${config.OWNER}/${config.REPO}/contents/${path}?ref=${config.BRANCH}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);

        const data = await response.json();
        return data.sha;
    },

    uploadFile: async (path, content, message) => {
        const token = GithubSync.getToken();
        const config = GithubSync.getConfig();

        if (!token) throw new Error("No GitHub Token found.");

        let sha = null;
        try {
            sha = await GithubSync.getObjSHA(path);
        } catch (e) {
            console.warn("Could not get SHA (might be new file):", e);
        }

        // Fix: Use loop instead of spread syntax to avoid "Maximum call stack size exceeded"
        const unicodeContent = new TextEncoder().encode(content);
        let binary = '';
        for (let i = 0; i < unicodeContent.length; i++) {
            binary += String.fromCharCode(unicodeContent[i]);
        }
        const base64Content = btoa(binary);

        const body = {
            message: message || `update ${path}`,
            content: base64Content,
            branch: config.BRANCH
        };
        if (sha) body.sha = sha;

        const url = `https://api.github.com/repos/${config.OWNER}/${config.REPO}/contents/${path}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Upload Failed: ${errData.message}`);
        }

        return await response.json();
    },

    syncAll: async (progressCallback) => {
        try {
            if (progressCallback) progressCallback("Leyendo datos locales...");

            const artists = await loadArtistsDB();
            // Safe access to globals
            const tours = typeof window.getAllToursDB === 'function' ? await window.getAllToursDB() : [];
            const config = typeof window.getSiteConfig === 'function' ? await window.getSiteConfig() : {};
            const users = typeof window.getAllUsersDB === 'function' ? await window.getAllUsersDB() : [];

            // Define files to sync
            const filesToSync = [
                { path: 'data/artists.json', content: JSON.stringify(artists, null, 2) },
                { path: 'data/tours.json', content: JSON.stringify(tours, null, 2) },
                { path: 'data/site_config.json', content: JSON.stringify(config, null, 2) },
                { path: 'data/users.json', content: JSON.stringify(users, null, 2) }
            ];

            let count = 0;
            for (const file of filesToSync) {
                if (progressCallback) progressCallback(`Subiendo ${file.path}...`);
                await GithubSync.uploadFile(file.path, file.content, `feat: update ${file.path} from Admin Panel`);
                count++;
            }

            if (progressCallback) progressCallback("¡Sincronización completada!");
            return true;

        } catch (error) {
            console.error("Sync Error:", error);
            if (progressCallback) progressCallback(`Error: ${error.message}`);
            throw error;
        }
    }
};

window.GithubSync = GithubSync;
