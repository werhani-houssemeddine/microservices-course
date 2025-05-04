export class Home {
    constructor(isAuthenticated, user) {
        this.isAuthenticated = isAuthenticated;
        this.user = user;
    }

    render() {
        const main = document.createElement('main');
        main.className = 'home-page';

        if (this.isAuthenticated) {
            main.innerHTML = `
                <div class="dashboard">
                    <h1>Welcome to Your Dashboard</h1>
                    <p>Manage your products and view your orders</p>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h2>Product Management</h2>
                            <p>View and manage your products</p>
                            <a href="/products" class="btn btn-primary">Go to Products</a>
                        </div>
                        
                        <div class="dashboard-card">
                            <h2>My Cart</h2>
                            <p>View your shopping cart</p>
                            <a href="/cart" class="btn btn-primary">View Cart</a>
                        </div>
                        
                    </div>
                </div>
            `;
        } else {
            main.innerHTML = `
                <div class="welcome-page">
                    <h1>Welcome to Our E-Commerce Platform</h1>
                    <p>Sign up or log in to start managing your products</p>
                    
                    <div class="auth-buttons">
                        <a href="/login" class="btn btn-primary">Login</a>
                        <a href="/signup" class="btn btn-secondary">Sign Up</a>
                    </div>
                    
                    <div class="features">
                        <h2>Features</h2>
                        <div class="feature-list">
                            <div class="feature-item">
                                <h3>Product Management</h3>
                                <p>Create, update, and manage your products</p>
                            </div>
                            <div class="feature-item">
                                <h3>Secure Authentication</h3>
                                <p>Safe and secure user authentication</p>
                            </div>
                            <div class="feature-item">
                                <h3>Search Functionality</h3>
                                <p>Search through products easily</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return main;
    }
} 