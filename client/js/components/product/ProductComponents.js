const productURL = 'http://localhost:8080/api/products';

export const ProductGrid = (products) => {
  return `
    <div class="products-page">
      <div class="product-grid">
        ${products.map(product => `
          <div class="product-card" style="position: relative;">
          <div class="sold-out-badge" style="display: ${product.stock <= 0 ? 'block' : 'none'}; position: absolute; top: 10px; left: 10px; background-color: rgba(255, 0, 0, 0.8); color: white; padding: 5px 10px; transform: rotate(-15deg); font-weight: bold; border-radius: 3px; z-index: 10;">
            SOLD OUT
          </div>
            <img src="${product.image || '/assets/no-image-available.png'}" alt="${product.name}" class="product-image">
            <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
              <p class="product-price">$${product.price}</p>
              <div class="product-actions" style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn add-to-cart-btn" style="background-color: #4f46e5; color: white;" data-product-id="${product.id}">Add to Cart</button>
                <button class="btn product-page-btn" style="background-color:rgb(0, 168, 3); color: white;" data-product-id="${product.id}">
                  <a href="/product?id=${product.id}" style="text-decoration: none; color: white;">View Product</a>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div id="cart-popup" class="popup hidden">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <link rel="stylesheet" href="/css/cart.css">
      <div class="modal-overlay">
        <div class="action-modal">
            <div class="modal-header">
                Cart Actions
            </div>
            <div class="modal-body">
                <div class="action-title">
                    What would you like to do with this item?
                </div>
                <div class="action-buttons">
                    <button class="action-btn btn-new-cart" id="create-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                        Create New Cart
                    </button>
                    <button class="action-btn btn-add-cart" id="add-existing-cart-btn">
                        <i class="fas fa-cart-plus"></i>
                        Add to Existing Cart
                        <span class="cart-count-badge" id="cart-count">0</span>
                    </button>
                    <button class="action-btn btn-buy-now" id="buy-now-btn">
                        <i class="fas fa-bolt"></i>
                        Buy Now
                    </button>
                    <button class="action-btn btn-cancel" id="close-popup-btn">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
    </div>
  `;
};

export const initCart = (products) => {
  let selectedProduct = null;
  const popup = document.getElementById('cart-popup');
  const buyNowBtn = document.getElementById('buy-now-btn');
  const createCartBtn = document.getElementById('create-cart-btn');
  const addExistingCartBtn = document.getElementById('add-existing-cart-btn');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const carts = JSON.parse(sessionStorage.getItem('cart')) || [];


  document.getElementById('cart-count').innerHTML = carts.length;

  if(carts.length === 0) {
    addExistingCartBtn.disabled = true;
  }

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(button.getAttribute('data-product-id'));
      selectedProduct = products.find(p => p.id === productId);

      if (selectedProduct) {
        popup.classList.remove('hidden');
        if(selectedProduct.stock <= 0) {
          buyNowBtn.disabled = true;
          createCartBtn.disabled = true;
          addExistingCartBtn.disabled = true;
          buyNowBtn.style.backgroundColor = '#ccc';
          addExistingCartBtn.style.backgroundColor = '#ccc';
          createCartBtn.style.backgroundColor = '#ccc';
          buyNowBtn.style.cursor = 'not-allowed';
          addExistingCartBtn.style.cursor = 'not-allowed';
          createCartBtn.style.cursor = 'not-allowed';
        } else {
          buyNowBtn.disabled = false;
          createCartBtn.disabled = false;
          addExistingCartBtn.disabled = false;
          buyNowBtn.style.backgroundColor = '#218838';
          addExistingCartBtn.style.backgroundColor = '#e9ecef';
          createCartBtn.style.backgroundColor = '#3a5bef';

        }
      }
    });
  });

  buyNowBtn.addEventListener('click', async () => {
    if (selectedProduct) {
      alert(`Buying ${selectedProduct.name} now!`);
      
      try {
        const response = await fetch('http://localhost:8080/api/orders/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            products: [{ product_id: selectedProduct.id, quantity: 1 }],
            total_price: parseFloat(selectedProduct.price)
          })
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        window.alert('Purchase successful');
        
      } catch (error) {
        console.error('Failed to complete purchase:', error);
      }

      popup.classList.add('hidden');
    }
  });

  createCartBtn.addEventListener('click', () => {
    if (selectedProduct) {
      const t = prompt('Enter a title for your new cart');
      if(t) {
      const quantity = prompt('Enter a quantity for your new cart\n(max: ' + selectedProduct.stock + ')');
      if(quantity && quantity < selectedProduct.stock) {
        const savedCart = JSON.parse(sessionStorage.getItem('cart')) || [];
        let cart = { title: t, products: [{ ...selectedProduct, quantity }] };
        savedCart.push(cart);
        sessionStorage.setItem('cart', JSON.stringify(savedCart));
        alert('New cart created ' + t + ' with ' + quantity + ' ' + selectedProduct.name);
        popup.classList.add('hidden');
      } else {
        alert('Quantity is greater than stock');
      }
    }
    }
  });

  addExistingCartBtn.addEventListener('click', () => {
    let carts = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartTitle = prompt('Enter the title of the cart you want to add the product to:');
    const selectedCart = carts.find(c => c.title === cartTitle);

    if (selectedProduct) {
      if (carts.length === 0) {
        alert('No existing carts found. Please create a new cart first.');
        return;
      }
  
      if (!selectedCart) {
        alert('Cart not found.');
        return;
      }

      const quantity = prompt('Enter a quantity for your new cart\n(max: ' + selectedProduct.stock + ')');
      if(quantity && quantity < selectedProduct.stock) { 
  
      const existingProduct = selectedCart.products.find(p => p.id === selectedProduct.id);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        selectedCart.products.push({ ...selectedProduct, quantity });
      }
  
        sessionStorage.setItem('cart', JSON.stringify(carts));
        alert(`${selectedProduct.name} added to cart "${cartTitle}"`);
        popup.classList.add('hidden');
      } else {
        alert('Quantity is greater than stock');
      }
    }
  });
  

  closePopupBtn.addEventListener('click', () => {
    popup.classList.add('hidden');
    selectedProduct = null;
  }); 
}

export const MyProducts = (products) => {
    return `
      <div class="products-page">
        <h1>My Products</h1>
        <div class="product-grid">
          ${products.map(product => `
            <div class="product-card" style="position: relative;" product-container="${product.id}">
              <div class="product-actions" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px;">
                <button class="btn edit-btn" product-id="${product.id}" style="background-color: #facc15; color: #000; font-size: 1.5rem;">✍</button>
                <button class="btn delete-btn" product-id="${product.id}" style="background-color: #ef4444; color: #fff;">🗑️</button>
              </div>
              <img src="${product.image || '/assets/no-image-available.png'}" alt="${product.name}" class="product-image">
              <div class="product-info">
              <div class="product-details" style="display: flex; justify-content: space-between; gap: 10px;">
                  <h4 class="product-title">${product.name}</h4>
                  <p class="product-price">$${product.price}</p>
                </div>
                <p class="product-description">${product.description}</p>
                <p class="product-stock">Stock: ${product.stock}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };


export const AddProductForm = () => {
    return `
        <div class="admin-panel">
            <div class="admin-form">
                <h2>Add New Product</h2>
                <form id="addProductForm">
                    <div class="form-group">
                        <label class="form-label" for="productName">Product Name</label>
                        <input type="text" id="productName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="productDescription">Description</label>
                        <textarea id="productDescription" class="form-input" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="productPrice">Price</label>
                        <input type="number" id="productPrice" class="form-input" required min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="productStock">Stock</label>
                        <input type="number" id="productStock" class="form-input" required min="0">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="productImage">Image</label>
                        <input type="text" id="productImage" class="form-input">
                    </div>

                    <button type="submit" class="btn">Add Product</button>
                </form>
            </div>
        </div>
    `;
};

export const initAddProductForm = () => {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const product = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value
        };
        
        try {
            const response = await fetch(productURL + '/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify(product)
            });
            
            if (response.ok) {
                alert('Product added successfully!');
                form.reset();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add product.');
            }
        } catch (error) {
            console.error('Add product error:', error);
            alert('An error occurred while adding the product.');
        }
    });
}; 

let sideEditContainer;

export const initMyProducts = (products) => {
  const editBtn = document.querySelectorAll('.edit-btn');
  const deleteBtn = document.querySelectorAll('.delete-btn');

  deleteBtn.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this product?')) {
        const productId = e.target.getAttribute('product-id');
        const response = await fetch(productURL + '/' + productId, {
          method: 'DELETE',
          headers: {
            'Authorization': `${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          alert('Product deleted successfully!');
          document.querySelector(`[product-container="${productId}"]`).remove();
        } else {
          alert('Failed to delete product.');
        }
      }
    });
  });

  editBtn.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('product-id');
      const product = products.find(p => p.id === parseInt(productId));

      if (product) {
        showEditContainer(product);
      }
    });
  });

  createEditContainer();
};

function createEditContainer() {
  sideEditContainer = document.createElement('div');
  sideEditContainer.style.position = 'fixed';
  sideEditContainer.style.top = '0';
  sideEditContainer.style.right = '-400px'; // Hidden initially
  sideEditContainer.style.width = '400px';
  sideEditContainer.style.height = '100vh';
  sideEditContainer.style.background = '#f9fafb';
  sideEditContainer.style.boxShadow = '-2px 0 5px rgba(0,0,0,0.1)';
  sideEditContainer.style.transition = 'right 0.3s ease-in-out';
  sideEditContainer.style.padding = '20px';
  sideEditContainer.style.overflowY = 'auto';
  sideEditContainer.style.zIndex = '1000';
  sideEditContainer.innerHTML = `
    <h2>Edit Product</h2>
    <form id="edit-form">
      <input type="hidden" id="edit-id" class="form-input">
      
      <div class="form-group">
        <label class="form-label" for="edit-name">Name</label>
        <input type="text" id="edit-name" class="form-input" name="name">
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-description">Description</label>
        <textarea id="edit-description" class="form-input" name="description"></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="edit-price">Price</label>
        <input type="number" id="edit-price" class="form-input" name="price" min="0">
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-stock">Stock</label>
        <input type="number" id="edit-stock" class="form-input" name="stock" min="0">
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-image">Image</label>
        <input type="text" id="edit-image" class="form-input" name="image">
      </div>
      
      <button type="submit" class="btn" style="background: #4f46e5; color: white; width: 100%;">Save Changes</button>
    </form>
  `;

  document.body.appendChild(sideEditContainer);

  // Optional: handle form submission
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideEditContainer();
    const productId = document.getElementById('edit-id').value; 
    const formData = new FormData(this); 

    const data = {
      name: document.getElementById('edit-name').value,
      price: document.getElementById('edit-price').value,
      description: document.getElementById('edit-description').value,
      stock: document.getElementById('edit-stock').value,
      image: document.getElementById('edit-image').value
    }
    
    const response = await fetch(productURL + '/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Product updated successfully!');
      window.location.reload();
    } else {
      alert('Failed to update product.');
    }

  });
}

// Function to show the edit container and fill form
function showEditContainer(product) {
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-description').value = product.description;
  document.getElementById('edit-stock').value = product.stock;
  document.getElementById('edit-image').value = product.image;
  document.getElementById('edit-id').value = product.id;
  sideEditContainer.style.right = '0'; // Slide in
}

// Optional: hide container
function hideEditContainer() {
  sideEditContainer.style.right = '-400px'; // Slide out
}
