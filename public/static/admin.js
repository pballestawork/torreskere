document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    }).then(function(response) {
        if (response.ok) {
            alert('Usuario registrado exitosamente');
        } else {
            alert('Hubo un error al registrar el usuario');
        }
    });
});
