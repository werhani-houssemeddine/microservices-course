const orderURL = 'http://localhost:8080/api/orders';

export const fetchOrder = async (id) => {
  const response = await fetch(`${orderURL}/${id}`, { headers: { 'Authorization': `${localStorage.getItem('token')}` } });
  return response.json();
};

export const OrderDetails = (order) => {
  console.log(order);
  return `
  <style>
        #order-details {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0 auto;
            max-width: 1200px;
            padding: 20px;
        }
        .order-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 25px;
            margin-bottom: 30px;
        }
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .order-id {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .order-date {
            color: #7f8c8d;
            font-size: 14px;
        }
        .products-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .product-card {
            display: flex;
            border: 1px solid #eee;
            border-radius: 6px;
            overflow: hidden;
            transition: transform 0.2s;
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .product-image {
            width: 120px;
            height: 120px;
            object-fit: cover;
        }
        .product-details {
            padding: 15px;
            flex-grow: 1;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 16px;
        }
        .product-description {
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .product-price {
            font-weight: bold;
            color: #2c3e50;
        }
        .product-quantity {
            color: #7f8c8d;
            font-size: 14px;
        }
        .order-summary {
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: right;
        }
        .total-price {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }
    </style>

    <main id="order-details">
    <div class="order-container">
        <div class="order-header">
            <div>
                <span class="order-id">Order #${order.id}</span>
                <div class="order-date">Placed on ${order.order_date}</div>
            </div>
        </div>
        <div class="products-list">
        ${order.products.map(product => `
        
          <div class="product-card">
              <img src="${product.product_image}" 
                   alt="${product.product_name}" class="product-image">
              <div class="product-details">
                  <div class="product-name">${product.product_name}</div>
                  <div class="product-description">${product.product_description}</div>
                  <div class="product-price">$${product.price}</div>
                  <div class="product-quantity">Quantity: ${product.quantity}</div>
              </div>
          </div>
          `).join('')}
        </div>
        
        <div class="order-summary">
            <div class="total-price">Total: $${order.total_price}</div>
        </div>
    </div>
    </main>
  `;
};

export const initOrderDetails = () => {
  const orderDetails = document.querySelector('.order-details');
  if (orderDetails) {
    
  }
};
