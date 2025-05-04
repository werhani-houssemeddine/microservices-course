const API_URL = 'http://localhost:8080/api/auth/';

export function initLoginForm(router) {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    router.navigate('/');
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login.');
            }
        });
    }
}

export function initSignupForm(router) {
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                if (response.ok) {
                    router.navigate('/login');
                } else {
                    alert('Signup failed. Please try again.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred during signup.');
            }
        });
    }
} 