document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderListContainer = document.getElementById('order-list');
    const summaryContainer = document.getElementById('summary');

    if (cart.length === 0) {
        window.location.href = '/frontend/Menu/menu.html';
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
            imagePath = '/frontend/images/kape_cinco.jpg';
        } else {
            imagePath = `/backend/images/${item.image}`;
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
            <span>Discount</span>
            <span>₱0.00</span>
        </div>
        <button class="complete-order-btn">Confirm Order</button>
    `;

    document.querySelector('.complete-order-btn').addEventListener('click', function() {
        const orderNumber = generateOrderNumber(); 
        const orderToken = generateOrderToken();
        const receivedAmount = 0;
        const orderStats = '';

        const orderDetails = { orderNumber, token: orderToken, orderDate: new Date().toISOString() }; 

        localStorage.setItem(orderToken, JSON.stringify(orderDetails));

        const formData = new FormData();
        formData.append('order-number', orderNumber);
        formData.append('total-amount', totalPrice);
        formData.append('received-amount', receivedAmount);
        formData.append('order-stats', orderStats);
        formData.append('order-details', JSON.stringify(cart));

        fetch('/backend/Home/confirm_order.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.message) {
                alert('Order Confirmed');
                localStorage.removeItem('cart');
                console.log(cart);
                window.location.href = `/frontend/Menu/QRpage.html?order=${orderToken}`;
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
        
    });
    
    document.body.classList.remove('hidden');
});

function generateOrderNumber() {
    return `ORD-${Math.floor(Math.random() * 1000000)}`;
}

function generateOrderToken() {
    return 'ORDT-' + Math.random().toString(36).substr(2, 16); 
}
