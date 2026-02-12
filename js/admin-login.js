import AuthManager from './auth-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('username'); // Reusing existing ID
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.querySelector('button[type="submit"]');

    // Change placeholder from "Usuario" to "Email" if needed, 
    // though we can keep ID 'username' to minimize HTML changes
    // Placeholder handled in HTML

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Por favor, completa todos los campos.");
            return;
        }

        // UI Loading State
        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
        loginBtn.disabled = true;
        errorMsg.style.display = 'none';

        try {
            const result = await AuthManager.login(email, password);

            if (result.success) {
                console.log("Login Success! Redirecting...");
                window.location.href = 'admin-home.html';
            } else {
                showError(result.message || "Credenciales incorrectas");
                resetBtn();
            }
        } catch (error) {
            console.error(error);
            showError("Error de conexión con el servidor.");
            resetBtn();
        }
    });

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }

    function resetBtn() {
        loginBtn.innerHTML = 'ACCEDER AL PANEL';
        loginBtn.disabled = false;
    }
});
