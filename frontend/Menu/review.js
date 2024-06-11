document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderListContainer = document.getElementById('order-list');
    const summaryContainer = document.getElementById('summary');

    if (cart.length === 0) {
        window.location.href = '/Kape_Cinco/frontend/Menu/menu.html';
        return;
    }

    let totalItems = 0;
    let totalPrice = 0;
    
    orderListContainer.innerHTML = '';

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        
        let imagePath;
        if (item.image === 'default_image' || !item.image) {
            imagePath = '/Kape_Cinco/frontend/images/kape_cinco.jpg';
        } else {
            imagePath = `/Kape_Cinco/backend/images/${item.image}`;
        }

        const orderItem = document.createElement('div');
        orderItem.classList.add('order-item');
        orderItem.innerHTML = `
            <img src="${imagePath}" alt="${item.name}" class="food-image">
            <div class="order-details">
                <span class="food-name">${item.name}</span>
                <span class="quantity">${item.quantity}x</span>
                <span class="total">Total: ₱${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        orderListContainer.appendChild(orderItem);
    });

    summaryContainer.innerHTML = `
        <div class="summary-item">
            <span>Total items(${totalItems} items)</span>
            <span>₱${totalPrice.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Delivery Fee</span>
            <span>₱0.00</span>
        </div>
        <div class="summary-item">
            <span>Discount</span>
            <span>₱0.00</span>
        </div>
        <button class="complete-order-btn">Confirm Order</button>
    `;

    document.querySelector('.complete-order-btn').addEventListener('click', function() {
        const orderNumber = generateOrderNumber(); 
        const orderDetails = { orderNumber, totalItems, totalPrice, cart }; 

        localStorage.setItem('pendingOrder', JSON.stringify(orderDetails)); 

        window.location.href = '/Kape_Cinco/frontend/Home/QRpage.html'; 
    });

    document.body.classList.remove('hidden');
});

function generateOrderNumber() {
    return `ORD-${Math.floor(Math.random() * 1000000)}`;
}
