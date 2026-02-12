import { auth } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const AuthManager = {
    // Login function
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("Login Error:", error);
            let msg = "Error al iniciar sesión.";
            if (error.code === 'auth/invalid-login-credentials') msg = "Correo o contraseña incorrectos.";
            if (error.code === 'auth/too-many-requests') msg = "Demasiados intentos. Espera un poco.";
            return { success: false, message: msg };
        }
    },

    // Logout function
    logout: async () => {
        try {
            await signOut(auth);
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },

    // Check if user is logged in (use in admin pages)
    checkAuth: (redirectIfMissing = true) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user && redirectIfMissing) {
                // User is signed out, redirect to login
                sessionStorage.removeItem('ph_user_role'); // Clear cache
                window.location.href = 'admin-login.html';
            } else if (user) {
                console.log("User is authenticated:", user.email);

                // OPTIMIZATION: Check Session Cache first
                const cachedRole = sessionStorage.getItem('ph_user_role');
                if (cachedRole) {
                    console.log("✅ Role loaded from cache:", cachedRole);
                    return; // Skip Firestore read
                }

                // Check Firestore for Role (only if not cached)
                try {
                    const role = await AuthManager.getUserRole(user.email);
                    console.log("User Role:", role);
                    // If no role found, maybe log out or show error? For now, allow access but log it.
                    if (!role) console.warn("User has no role assigned in DB.");
                } catch (e) {
                    console.error("Error fetching role:", e);
                }
            }
        });
    },

    // Get current user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Get User Role from Firestore
    getUserRole: async (email) => {
        try {
            const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js");
            const { db } = await import('./firebase-config.js');

            const docRef = doc(db, "users", email);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const role = docSnap.data().role;
                sessionStorage.setItem('ph_user_role', role); // CACHE IT
                return role;
            } else {
                console.log("No such user document!");
                return null;
            }
        } catch (error) {
            console.error("Error getting user role:", error);
            return null;
        }
    }
};

// Make it globally available for non-module scripts if needed, 
// strictly speaking ideally we use modules everywhere but for easy console debugging:
window.AuthManager = AuthManager;
export default AuthManager;
