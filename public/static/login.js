document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si existen las cookies
    const hasUsernameCookie = document.cookie.split(';').some((item) => item.trim().startsWith('usernameCookie='));
    const hasAdminCookie = document.cookie.split(';').some((item) => item.trim().startsWith('adminCookie='));

    if (hasUsernameCookie && hasAdminCookie) {
        // Intentar login automático
        performLogin();
    } else {
        // Adjuntar un listener al botón de login
        // Asegúrate de que tu botón tiene este ID
        document.getElementById('login-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value; // input con ID 'username'
            const password = document.getElementById('password').value; // input con ID 'password'
            // Enviar los datos de login al servidor
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            }).then(response => {
                if (response.status === 200) {
                    // Si el login es exitoso, realizar el login automáticamente
                    performLogin();
                } else {
                    alert('Datos de acceso incorrectos.');
                }
            });
        });
    }
});

function performLogin() {
    fetch('/check-if-admin', {
        credentials: 'include' // Esto asegura que las cookies se envíen con la petición
    })
    .then(response => response.json())
    .then(data => {
        if (data.isAdmin) {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/menu.html';
        }
    });
}
