import { initLoginForm, initSignupForm } from './authService';

export function LoginForm() {
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
}

export function SignupForm() {
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
}

export { initLoginForm, initSignupForm };
