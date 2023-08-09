// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

// Obtener y mostrar el valor de todas las cookies
function mostrarCookies() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        console.log(`${name} = ${decodeURIComponent(value)}`);
    }
}

// Llamar a la función al cargar la página
window.onload = function() {
    mostrarCookies();
};