document.addEventListener('DOMContentLoaded', function() {
    
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const orderToken = getQueryParam('orderToken');
    if (!orderToken) {
        window.location.href = '/Kape_Cinco/frontend/Menu/menu.html';
        return;
    }

    const orderDetails = JSON.parse(localStorage.getItem(orderToken));
    if (!orderDetails) {
        window.location.href = '/Kape_Cinco/frontend/Menu/menu.html';
        return;
    }

    const orderNumContainer = document.getElementById('order-number');

    orderNumContainer.innerHTML = `
        <h2>Order Number</h2>
        <div class="number">${orderDetails.orderNumber}</div>
        <p>kindly present this number in the counter</p>
    `;

    document.body.classList.remove('hidden');
});