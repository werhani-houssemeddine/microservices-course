import { LoginForm, SignupForm, initLoginForm, initSignupForm } from './components/auth/AuthForm.js';
import { ProductGrid, AddProductForm, initAddProductForm, MyProducts, initMyProducts, initCart } from './components/product/ProductComponents.js';
import { CartPage, getCarts } from './components/cart/CartComponents.js';
import { fetchMyProducts, fetchProducts, fetchProduct, ProductPage, fetchReviews, initReviewForm, fetchUserDetails } from './components/product/ProductService.js';
import { OrderDetails, initOrderDetails, fetchOrder } from './components/history/OrderComponents.js';
import { isAuthenticated, showNotification } from './utils/helpers.js';
import { Navbar, initNavbar } from './components/common/Navbar.js';
import { PurchaseHistory, getHistory } from './components/history/HistoryComponents.js';

class Router {
    constructor(routes) {
        this.routes = routes;
        this.root = document.getElementById('app');
        this.currentPath = window.location.pathname;
        
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                console.log(e.target.getAttribute('href'));
                this.navigate(e.target.getAttribute('href'));
            }
        });

        window.addEventListener('popstate', () => {
            this.render(window.location.pathname);
        });

        this.render(this.currentPath);
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.render(path);
    }

    async render(path) {
        const route = this.routes[path] || this.routes['404'];
        
        // Check authentication for protected routes
        if (route.protected && !isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        try {
            // Render navbar
            const navbar = Navbar();
            
            // Get the main content
            const content = await route.template();
            
            // Combine navbar and content
            this.root.innerHTML = navbar + content;
            
            // Initialize navbar
            initNavbar(this);
            
            // Initialize route if needed
            if (route.init) {
                route.init(this);
            }
        } catch (error) {
            console.error('Error rendering route:', error);
            showNotification('An error occurred while loading the page', 'error');
        }
    }
}

// Define routes
const routes = {
    '/': {
        template: async () => {
            const isLoggedIn = isAuthenticated();
            if (isLoggedIn) {
                window.location.href = '/products';
            }
            return `
                <div class="home">
                    <h1>Welcome to our E-Commerce Platform</h1>
                    <p>Discover amazing products and shop with confidence</p>   
                </div>
            `;
        }
    },
    '/login': {
        template: async () => LoginForm(),
        init: (router) => initLoginForm(router)
    },
    '/signup': {
        template: async () => SignupForm(),
        init: (router) => initSignupForm(router)
    },
    '/products': {
        data: {
            products: []
        },
        protected: true,
        template: async () => {
            const products = await fetchProducts();
            routes['/products'].data.products = products;
            return ProductGrid(products);
        },
        init: () => initCart(routes['/products'].data.products)
    },
    '/my-products': {
        data: {
            products: []
        },
        protected: true,
        template: async () => {
            const products = await fetchMyProducts();
            routes['/my-products'].data.products = products;
            return MyProducts(products);
        },
        init: () => initMyProducts(routes['/my-products'].data.products)
    },
    '/product': {
        protected: true,
        init: () => initReviewForm(),
        template: async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            const product = await fetchProduct(id);
            const reviews = await fetchReviews(id);
            const userIds = [...(new Set(reviews.map(review => review.userId)))];
            const userDetails = await fetchUserDetails(userIds);
            
            reviews.forEach(review => {
                const user = userDetails.find(user => user.id === review.userId);
                review.user = user;
            });

            console.table(reviews);

            // const reviews = [
            //     {
            //       id: 1,
            //       rating: 5,
            //       review: "These headphones are absolutely amazing! The sound quality is exceptional and the noise cancellation works perfectly on my commute. The battery life lasts me all week with moderate use. Worth every penny!",
            //       created_at: "2023-10-15",
            //       user: {
            //         id: 1,
            //         username: "Sarah Johnson",
            //         avatar: "/assets/user-default-image.png"
            //       }
            //     },
            //     {
            //       id: 2,
            //       rating: 4,
            //       review: "Great headphones overall. The sound is crisp and clear, though I wish the bass was a bit stronger. Comfortable for long listening sessions. The only minor issue is the touch controls can be too sensitive sometimes.",
            //       created_at: "2023-09-28",
            //       user: {
            //         id: 2,
            //         username: "Michael Chen",
            //         avatar: "/assets/user-default-image.png"
            //       }
            //     },
            //     {
            //       id: 3,
            //       rating: 3,
            //       review: "They're good headphones but not perfect. The noise cancellation works well, but I've had some connectivity issues when using them with my laptop. Sound quality is good but not exceptional for the price. They're comfortable though.",
            //       created_at: "2023-08-05",
            //       user: {
            //         id: 3,
            //         username: "Emma Rodriguez",
            //         avatar: "/assets/user-default-image.png"
            //       }
            //     }
            //   ];

            return ProductPage(product, reviews);
        }
    },
    '/add-product': {
        protected: true,
        template: async () => AddProductForm(),
        init: () => initAddProductForm()
    },
    '/cart': {
        protected: true,
        template: async () => {
            const cart = getCarts();
            return CartPage(cart);
        }
    },
    '/history': {
        protected: true,
        template: async () => {
            const history = await getHistory();
            return PurchaseHistory(history);
        }
    },
    '/order-details': {
        protected: true,
        init: () => initOrderDetails(),
        template: async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            const order = await fetchOrder(id);
            return OrderDetails(order);
        }
    },
    '404': {
        template: async () => {
            return `
                <div class="error-page">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you are looking for does not exist.</p>
                    <a href="/" class="btn" data-link>Go Home</a>
                </div>
            `;
        }
    }
};

const router = new Router(routes);


window.router = router;
