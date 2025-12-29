document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerLink = document.getElementById('register-link');
    const formTitle = document.getElementById('form-title');
    const toggleForm = document.getElementById('toggle-form');
    const authForm = document.getElementById('auth-form');
    const protectedContent = document.getElementById('protected-content');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout');
    const messageEl = document.getElementById('message');
    
    let isRegisterMode = false;
    
    // Toggle between login and register
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        formTitle.textContent = isRegisterMode ? 'Register' : 'Login';
        toggleForm.innerHTML = isRegisterMode 
            ? 'Already have an account? <a href="#" id="login-link">Login</a>' 
            : 'Don\'t have an account? <a href="#" id="register-link">Register</a>';
        
        // Reattach event listener to new link
        if (isRegisterMode) {
            document.getElementById('login-link').addEventListener('click', (e) => {
                e.preventDefault();
                isRegisterMode = false;
                formTitle.textContent = 'Login';
                toggleForm.innerHTML = 'Don\'t have an account? <a href="#" id="register-link">Register</a>';
                messageEl.textContent = '';
                document.getElementById('register-link').addEventListener('click', registerHandler);
            });
        } else {
            registerLink.addEventListener('click', registerHandler);
        }
    });
    
    function registerHandler(e) {
        e.preventDefault();
        isRegisterMode = true;
        formTitle.textContent = 'Register';
        toggleForm.innerHTML = 'Already have an account? <a href="#" id="login-link">Login</a>';
        document.getElementById('login-link').addEventListener('click', (e) => {
            e.preventDefault();
            isRegisterMode = false;
            formTitle.textContent = 'Login';
            toggleForm.innerHTML = 'Don\'t have an account? <a href="#" id="register-link">Register</a>';
            messageEl.textContent = '';
            registerLink.addEventListener('click', registerHandler);
        });
    }
    
    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        messageEl.textContent = '';
        
        try {
            let response;
            if (isRegisterMode) {
                // Register
                response = await fetch('http://localhost:8000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
            } else {
                // Login
                response = await fetch('http://localhost:8000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
            }
            
            const data = await response.json();
            
            if (response.ok) {
                if (isRegisterMode) {
                    messageEl.textContent = 'Registration successful! Please login.';
                    messageEl.style.color = 'green';
                    // Switch to login mode after successful registration
                    setTimeout(() => {
                        isRegisterMode = false;
                        formTitle.textContent = 'Login';
                        toggleForm.innerHTML = 'Don\'t have an account? <a href="#" id="register-link">Register</a>';
                        document.getElementById('register-link').addEventListener('click', registerHandler);
                    }, 2000);
                } else {
                    // Save token and show protected content
                    localStorage.setItem('token', data.access_token);
                    showProtectedContent(email);
                }
            } else {
                messageEl.textContent = data.detail || 'An error occurred';
                messageEl.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            messageEl.textContent = 'Network error. Please try again.';
            messageEl.style.color = 'red';
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        protectedContent.style.display = 'none';
        authForm.style.display = 'block';
    });
    
    // Check for existing token on page load
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token with protected endpoint
        fetch('http://localhost:8000/protected', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Invalid token');
            }
        })
        .then(data => {
            // Extract email from token (simplified - in production use proper JWT decoding)
            const payload = JSON.parse(atob(token.split('.')[1]));
            showProtectedContent(payload.sub);
        })
        .catch(() => {
            localStorage.removeItem('token');
            authForm.style.display = 'block';
        });
    }
    
    function showProtectedContent(email) {
        welcomeMessage.textContent = `Welcome, ${email}!`;
        authForm.style.display = 'none';
        protectedContent.style.display = 'block';
    }
});
