document.addEventListener("DOMContentLoaded", () => {
    // Check if the user is already logged in
    fetch('/Kape_Cinco/backend/Login/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                if (data.role === 'Admin') {
                    window.location.href = '/Kape_Cinco/backend/Login/admin.php';
                } else if (data.role === 'Cashier') {
                    window.location.href = '/Kape_Cinco/backend/Login/home.php';
                } 
            } else {
                document.body.classList.remove('hidden'); // Show login form
            }
        })
        .catch(error => console.error('Error:', error));

    // Add event listener for login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', validateLogin);

    function validateLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const params = new URLSearchParams(window.location.search);
        const redirectPage = params.get('redirect');

        fetch('/Kape_Cinco/backend/Login/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.userExists) {
                const role = data.role;

                if (redirectPage) {
                    if (redirectPage.includes('Login/admin.php') && role === 'Cashier') {
                        alert('Access denied: Cashiers cannot access admin page.');
                        window.location.href = '/Kape_Cinco/backend/Login/home.php';
                    } else {
                        window.location.href = `/Kape_Cinco/backend/${redirectPage}`;
                    }
                } else {
                    if (role === 'Admin') {
                        window.location.href = '/Kape_Cinco/backend/Login/admin.php';
                    } else if (role === 'Cashier') {
                        window.location.href = '/Kape_Cinco/backend/Login/home.php';
                    } else {
                        alert('Invalid role detected.');
                    }
                }
            } else {
                alert('Login failed: ' + (data.error || 'Invalid credentials.'));
            }
        })
        .catch(error => console.error('Error:', error));
    }
    /*
    // Add event listeners for registration form show/hide
    const registerForm = document.getElementById('register-form');
    const showRegisterButton = document.getElementById('show-register-btn');
    const hideRegisterButton = document.getElementById('hide-register-btn');

    if (showRegisterButton && hideRegisterButton) {
        showRegisterButton.addEventListener('click', showRegisterForm);
        hideRegisterButton.addEventListener('click', hideRegisterForm);
    }

    function showRegisterForm() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }

    function hideRegisterForm() {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }*/
});

