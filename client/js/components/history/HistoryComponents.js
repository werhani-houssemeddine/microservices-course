const historyURL = 'http://localhost:8080/api/orders';

export const getHistory = async () => {
    const response = await fetch(historyURL + '/all', { headers: { 'Authorization': `${localStorage.getItem('token')}` } });
    const data = await response.json();
    console.log(data);
    return data;
};


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export const PurchaseHistory = (orders) => {
  let filteredOrders = orders;
  let filter = 'all';  

  const render = (ordersToDisplay) => {
    return `
      <main id="order-list">
        <div class="purchase-container">
          <div class="list-of-purchases">
            ${ordersToDisplay.map(order => `
              <div class="purchase-card">
                <div class="purchase-date">
                  <span>Date:</span>
                  <span>${new Date(order.order_date).toLocaleDateString()} ${new Date(order.order_date).toLocaleTimeString()}</span>
                </div>

                <div class="purchase-details">
                  <h2>Order #${order.id}</h2>
                  <p><strong>Products:</strong> ${order.products.length}</p>
                  <p><strong>Total Price:</strong> $${order.total_price.toLocaleString()}</p>
                  <button class="btn add-to-cart-btn" style="background-color: #4f46e5; color: white; margin-top: 10px;">
                    <a style="text-decoration: none; color: white;" href="/order-details?id=${order.id}">View Details</a>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  };

  return render(filteredOrders);
};
