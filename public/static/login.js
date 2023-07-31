document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        if (data.admin) {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/menu';
        }
    }).catch(function() {
        alert('Usuario o contraseña incorrecta');
    });
});
