const API_URL = 'http://localhost:8080/api/products';
const REVIEW_URL = 'http://localhost:8080/api/reviews';
const USER_URL = 'http://localhost:8080/api/auth/user-details';

export async function fetchProducts() {
    try {
        const response = await fetch(API_URL + '/all', {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}   

export async function fetchMyProducts() {
    try {
        const response = await fetch(API_URL + '/my-products', {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error fetching my products:', error);
        return [];
    }
}

export async function addProduct(product) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem('token')}`
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding product:', error);
        return false;
    }
}

export async function fetchProduct(id) {
	const response = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': `${localStorage.getItem('token')}` } });
	return response.json();
}

export async function fetchReviews(id) {
	const response = await fetch(`${REVIEW_URL}/product/${id}`, { headers: { 'Authorization': `${localStorage.getItem('token')}` } });
	return response.json();
}

export async function fetchUserDetails(ids) {
    const response = await fetch(`${USER_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `${localStorage.getItem('token')}` },
        body: JSON.stringify({ ids })
    });
    return response.json();
}

export async function ProductPage(product, reviews) {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function stars(rating) {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
        return fullStars + emptyStars;
    }

    return `
    <link rel="stylesheet" href="/css/product.css">
    <div class="product-container">
        <div class="product">
            <img src="${product.image}" alt="Product Image">
        </div>
        <div class="product-details">
            <h1 class="product-title">${product.name}</h1>
            <div class="product-price">$${product.price}</div>
            <div class="product-stock">Stock: ${product.stock}</div>
            <div class="product-description">
                <p>${product.description}</p>
            </div>
        </div>
    </div>
    
    <div class="review-section">
        <h2>Customer Reviews</h2>
        
        <div class="review-list">
        ${reviews.length > 0 ? 
        reviews.map(review => `
            
             <div class="review-item">
                <div class="review-avatar-container">
                        <img src="https://ui-avatars.com/api/?name=${review.user.username}&background=random" alt="${review.user.username}" class="review-avatar">
                        <div class="reviewer-badge ${review.user.role === 'admin' ? 'admin-badge' : 'client-badge'}">
                            ${review.user.role === 'admin' ? 'Admin' : 'Client'}
                        </div>
                    </div>
                    
                    <div class="review-body">
                        <div class="review-meta">
                            <div class="reviewer-info">
                                <h4 class="reviewer-name">${review.user.username}</h4>
                                <span class="review-date">${formatDate(review.createdAt)}</span>
                            </div>
                            <div class="review-rating" aria-label="Rating: ${review.rating} out of 5 stars">
                                <div class="stars">
                                    ${stars(review.rating)}
                                </div>
                                <span class="rating-value">${review.rating}</span>
                            </div>
                        </div>
                        
                        <div class="review-text">
                            <p>${review.comment}</p>
                        </div>
                    </div>
                </div>
        `).join('') : '<h2 style="text-align: center; color: #666; margin: 20px 0;">No reviews yet, be the first to review this product!</h2>'}
        </div>

        <div class="review-form">
            <h3>Write a Review</h3>
            <form id="reviewForm">
                <input type="hidden" id="productId" value="${product.id}">
                <div class="form-group">
                    <label for="rating">Rating:</label>
                    <select id="rating" name="rating" required>
                        <option value="">Select a rating</option>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Very Good</option>
                        <option value="3">3 Stars - Good</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="1">1 Star - Poor</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="review">Your Review:</label>
                    <textarea id="review" name="review" required></textarea>
                </div>
                
                <button type="submit" class="submit-btn">Submit Review</button>
            </form>
        </div>
    </div>
    `
}

export const initReviewForm = () => {
    const reviewForm = document.querySelector('#reviewForm');
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = document.getElementById("rating").value;
        const comment = document.getElementById("review").value;
        const productId = document.getElementById("productId").value;

        const reviewData = {
            userId: 0,
            productId: productId,
            comment,
            rating: parseInt(rating, 10)
        };

        try {
            const response = await fetch(REVIEW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Review created successfully:');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating review:', error);
        }
    });
}