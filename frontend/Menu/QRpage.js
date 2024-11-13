document.addEventListener('DOMContentLoaded', function() {
    
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const orderToken = getQueryParam('order');
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
    
    const countdownDuration = 20 * 1000; 
    const orderDate = new Date(orderDetails.orderDate); 
    const endTime = orderDate.getTime() + countdownDuration; 

    const countdownElement = document.getElementById('countdown-timer');
    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const remainingTime = endTime - now; 

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            localStorage.removeItem(orderToken);
            alert('Your order has been removed due to timeout.');
            window.location.href = '/Kape_Cinco/frontend/Menu/menu.html';
            return;
        }

        const remainingSeconds = Math.floor(remainingTime / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        countdownElement.textContent = `Time remaining: ${formattedTime}`;
    }, 1000); 

    document.body.classList.remove('hidden');
    localStorage.removeItem(orderToken)
});