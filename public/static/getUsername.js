function getUsername() {
    let cookieValue = document.cookie.split(';').find(row => row.startsWith('usernameCookie=')).split('=')[1];
    // Decodifica el valor URL-encoded
    let decodedValue = decodeURIComponent(cookieValue);

    // Extrae el nombre de usuario
    let username = decodedValue.split(':')[1].split('.')[0];

    return username;
}

export default getUsername;
