import { getUserRole } from '../../utils/helpers.js';

export const Navbar = () => {
    const userRole = getUserRole();

    return `
        <nav class="navbar">
  <div class="navbar-container">
    <div class="navbar-left">
      <div class="navbar-brand">
        <a href="/" data-link>
          <span class="brand-icon">🛍️</span>
          <span class="brand-text">E-Commerce</span>
        </a>
      </div>
    </div>

    <div class="navbar-right">
      <div class="nav-links">  

        <!-- Default Links for Unauthorized Users -->
        ${userRole === null ? `
          <a href="/" data-link class="nav-link">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Home</span>
          </a>
          <a href="/login" data-link class="nav-link">
            <span class="nav-icon">🔑</span>
            <span class="nav-text">Login</span>
          </a>
          <a href="/signup" data-link class="nav-link">
            <span class="nav-icon">✍️</span>
            <span class="nav-text">Signup</span>
          </a>
        ` : `
        ${userRole === 'admin' ? `
            <a href="/my-products" data-link class="nav-link">
              <span class="nav-icon">📦</span>
              <span class="nav-text">My Products</span>
            </a>
            <a href="/add-product" data-link class="nav-link">
              <span class="nav-icon">➕</span>
              <span class="nav-text">Add Product</span>
            </a>
        ` : ``}

        <a href="/history" data-link class="nav-link">
          <span class="nav-icon">🕓</span>
          <span class="nav-text">History</span>
        </a>
        <a href="/cart" data-link class="nav-link">
          <span class="nav-icon">🛒</span>
          <span class="nav-text">Cart</span>
        </a>
        <a href="#" data-link class="nav-link">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Profile</span>
        </a>
        <button id="logoutButton" class="nav-link">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Logout</span>
        </button>  
        `}
      </div>
    </div>
  </div>
</nav>

    `;
};

export const initNavbar = (router) => {

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            router.navigate('/');
        });
    }
}; 