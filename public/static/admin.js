//FIXEDERROR: Esto daba error porque el scrip estaba colocado en la cabecera
//Si el evento se encuentra en el body el script tiene que estar despues de su definición
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password}),
        credentials: 'include' //Incluimos las cookies
    }).then(function(response) {
        if (response.ok) {
            alert('Usuario registrado exitosamente');
        } else {
            alert('Hubo un error al registrar el usuario');
        }
    });
});
