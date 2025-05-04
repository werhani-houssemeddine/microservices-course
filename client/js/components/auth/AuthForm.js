export const LoginForm = () => {
    return `
        <div class="form-container">
            <h2>Login</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input type="email" id="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input type="password" id="password" class="form-input" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
            <p>Don't have an account? <a href="/signup" data-link>Sign up</a></p>
        </div>
    `;
};

export const SignupForm = () => {
    return `
        <div class="form-container">
            <h2>Sign Up</h2>
            <form id="signupForm">
                <div class="form-group">
                    <label class="form-label" for="name">Name</label>
                    <input type="text" id="name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input type="email" id="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input type="password" id="password" class="form-input" required>
                </div>
                <button type="submit" class="btn">Sign Up</button>
            </form>
            <p>Already have an account? <a href="/login" data-link>Login</a></p>
        </div>
    `;
};

const API_URL = 'http://localhost:8080/api/auth';

export const initLoginForm = (router) => {
    const form = document.getElementById('loginForm');
    if (!form) return;

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
                localStorage.setItem('role', data.role);
                router.navigate('/');
            } else {
                const error = await response.json();
                alert(error.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });
};

export const initSignupForm = (router) => {
    const form = document.getElementById('signupForm');
    if (!form) return;

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
                const error = await response.json();
                alert(error.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        }
    });
}; 