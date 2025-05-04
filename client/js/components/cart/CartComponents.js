export const getCarts = () => {
    const carts = sessionStorage.getItem('cart');
    return carts ? JSON.parse(carts) : [];
};

export const saveCart = (carts) => {
  if (!Array.isArray(carts)) {
    console.error('saveCart expects an array of carts.');
    return;
  }
  sessionStorage.setItem('cart', JSON.stringify(carts));
};


export const CartPage = (carts) => {
    return `
      <div class="cart-page">
        <h1>Your Carts</h1>
        ${carts.length === 0 ? `
          <p>You have no carts.</p>
          <a href="/products" class="btn" data-link>Continue Shopping</a>
        ` : `
          <div class="all-carts">
            ${carts.map((cart, cartIndex) => `
              <div class="cart" id="cart-${cartIndex}">
                <h2>${cart.title}</h2>
                <div class="cart-items">
                  ${cart.products.map((product, productIndex) => `
                    <div class="cart-item">
                      <img src="${product.image || '/assets/no-image-available.png'}" alt="${product.name}" class="cart-item-image">
                      <div class="cart-item-details">
                        <h3>${product.name}</h3>
                        <p>Price: $${product.price}</p>
                        <p>Quantity: ${product.quantity}</p>
                        <button class="btn" cart-index="${cartIndex}" product-index="${productIndex}" onclick="removeFromCart(event)">Remove</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div class="cart-total" style="display: flex; justify-content: space-between;">
                  <button class="btn" style="color: #fff; background-color: #28b700;" onclick="purchase(${cartIndex})">Purchase</button>
                  <h3 id="cart-total">Cart Total: $${calculateCartTotal(cart.products)}</h3>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  };

const calculateCartTotal = (products) => {
    return products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0).toFixed(2);
};
  
export const removeFromCart = (event) => {
  const productIndex = event.target.getAttribute('product-index');
  const cartIndex = event.target.getAttribute('cart-index');
  const carts = getCarts();

  if (!carts[cartIndex]) {
    console.error('Cart not found at index:', cartIndex);
    return;
  }

  carts[cartIndex].products.splice(productIndex, 1);

  if (carts[cartIndex].products.length === 0) {
    carts.splice(cartIndex, 1);
  }

  saveCart(carts);
  const cartTotal = calculateCartTotal(carts[cartIndex].products);
  document.getElementById('cart-total').innerHTML = `Cart Total: $${cartTotal}`;
  event.target.parentElement.parentElement.remove();
};

export const purchase = async (cartIndex) => {
  const carts = getCarts();
  const cart = carts[cartIndex];

  if (!cart) {
    console.error('Cart not found at index:', cartIndex);
    return;
  }

  const products = cart.products.map(product => ({
    product_id: product.id,
    quantity: parseInt(product.quantity),
  }));
  
  const totalPrice = calculateCartTotal(cart.products);

  try {
    const response = await fetch('http://localhost:8080/api/orders/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        products,
        total_price: parseFloat(totalPrice)
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.alert('Purchase successful');

    carts.splice(cartIndex, 1);
    saveCart(carts);
    document.getElementById(`cart-${cartIndex}`).remove();
    
  } catch (error) {
    console.error('Failed to complete purchase:', error);
  }
};



window.purchase = purchase;
window.removeFromCart = removeFromCart;