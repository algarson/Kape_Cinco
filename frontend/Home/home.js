document.addEventListener('DOMContentLoaded', async function () {
    const allItemsContainer = document.getElementById('AllItemsContainer');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.getElementById('total-amount');
    const billsSection = document.querySelector('.bills-section');
    const paymentModal = document.getElementById('payment-modal');
    const closeButton = document.querySelector('.close-button');
    const orderNumberElement = document.getElementById('order-number');
    const orderDetailsElement = document.getElementById('order-details');
    const modalTotalAmountElement = document.getElementById('modal-total-amount');
    const confirmOrderButton = document.getElementById('confirm-order');
    const logoutButton = document.getElementById('logout-button');
    const totalIncome = document.getElementById('total-income-amount');
    const totalOrders = document.getElementById('total-order-amount');

    let totalAmount = 0;

    // Hide the bills section initially
    billsSection.style.display = 'none';
    paymentModal.style.display = 'none';

    // Check login status
    fetch('/Kape_Cinco/backend/Login/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/Kape_Cinco/frontend/Login/login.html';
            } else {
                document.body.classList.remove('hidden');
            }
        })
        .catch(error => console.error('Error:', error));

    async function fetchAllItems() {
        try {
            const res = await fetch("/Kape_Cinco/backend/Home/allitems.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return [];
        }
    }

    async function generateAllItems() {
        const allItems = await fetchAllItems();
        allItemsContainer.innerHTML = '';

        allItems.forEach(item => {
            const allItem = document.createElement('div');
            allItem.className = "food-item";
            
            const allItemImage = document.createElement('img');
            if (item.food_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.food_image;
            } else if (item.drink_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.drink_image;
            } else {
                allItemImage.src = '/Kape_Cinco/frontend/images/kape_cinco.jpg';
            }
            allItemImage.className = 'all-item-image'; 
    
            const allItemName = document.createElement('h3');
            allItemName.className = "all-item-name"; 
            if (item.food_name) {
                allItemName.textContent = item.food_name;
            } else if (item.drink_name) {
                allItemName.textContent = item.drink_name;
            }
    
            const allItemPrice = document.createElement('p');
            allItemPrice.className = "all-item-price"; 
            if (item.food_price) {
                allItemPrice.textContent = item.food_price;
            } else if (item.drink_price) {
                allItemPrice.textContent = item.drink_price;
            }
    
            const addToCartButton = document.createElement('button');
            addToCartButton.className = 'add-to-cart';
    
            const spanElement = document.createElement('span');
            spanElement.textContent = 'add to billing';
            addToCartButton.appendChild(spanElement);

            if (item.food_status === 'Unavailable' || item.drink_status === 'Unavailable') {
                allItemImage.style.opacity = '0.5';
                addToCartButton.disabled = true;
                addToCartButton.style.opacity = '0.5';
                addToCartButton.style.cursor = 'not-allowed';
            }
    
            allItem.appendChild(allItemImage);
            allItem.appendChild(allItemName);
            allItem.appendChild(allItemPrice);
            allItem.appendChild(addToCartButton);
    
            allItemsContainer.appendChild(allItem);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const foodItem = event.target.closest('.food-item');
                const foodName = foodItem.querySelector('h3').textContent;
                const foodPrice = parseFloat(foodItem.querySelector('p').textContent.replace(' ', '').replace(',', ''));

                addToCart(foodName, foodPrice);
                billsSection.style.display = 'block';
            });
        });
    }

    generateAllItems();

    /*------------------------ END OF GENERATE ALL ITEMS ------------------------------*/

    function logout() {
        fetch('/Kape_Cinco/backend/Login/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/Kape_Cinco/frontend/Home/home.html';
                } else {
                    alert('Logout failed!');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    logoutButton.addEventListener('click', () => {
        logout();
        document.body.classList.remove('hidden');
    });

    // Clear the cart and reset total amount function
    function clearCart() {
        cartItemsContainer.innerHTML = '';
        totalAmount = 0;
        totalAmountElement.textContent = `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Function to update total amount based on quantities
    function updateTotal() {
        let newTotal = 0;
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const price = parseFloat(cartItem.querySelector('.item-price').textContent.replace(' ', '').replace(',', ''));
            const quantity = parseInt(cartItem.querySelector('.item-quantity').textContent);
            newTotal += price * quantity;
        });
        totalAmount = newTotal;
        totalAmountElement.textContent = `${newTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function addToCart(name, price) {
        // Check if the item is already in the cart
        const existingCartItem = Array.from(cartItemsContainer.children).find(item => {
            return item.querySelector('.item-name').textContent === name;
        });

        if (existingCartItem) {
            // Item already exists, increment quantity
            const quantityElement = existingCartItem.querySelector('.item-quantity');
            const quantity = parseInt(quantityElement.textContent);
            quantityElement.textContent = quantity + 1;
        } else {
            // Item doesn't exist, add it to the cart
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <span class="item-name">${name}</span>
                <span class="item-price">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div class="quantity-container">
                    <button class="decrement-quantity">-</button>
                    <span class="item-quantity">1</span>
                    <button class="increment-quantity">+</button> 
                </div>
            `;

            // Add event listeners for the new increment and decrement buttons
            cartItem.querySelector('.increment-quantity').addEventListener('click', () => {
                const quantityElement = cartItem.querySelector('.item-quantity');
                const quantity = parseInt(quantityElement.textContent);
                quantityElement.textContent = quantity + 1;
                updateTotal();
            });

            cartItem.querySelector('.decrement-quantity').addEventListener('click', () => {
                const quantityElement = cartItem.querySelector('.item-quantity');
                const quantity = parseInt(quantityElement.textContent);
                if (quantity > 1) {
                    quantityElement.textContent = quantity - 1;
                    updateTotal();
                } else {
                    const price = parseFloat(cartItem.querySelector('.item-price').textContent.replace('Rp ', '').replace(',', ''));
                    totalAmount -= price;
                    totalAmountElement.textContent = `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    cartItem.remove();
                    if (cartItemsContainer.children.length === 0) {
                        billsSection.style.display = 'none';
                    }
                    updateTotal();
                }
            });

            cartItemsContainer.appendChild(cartItem);
        }

        // Update total amount
        totalAmount += price;
        totalAmountElement.textContent = `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    /*------------------------------------- END OF ADD TO CART FUNCTIONS -------------------------------*/

    // Generate a random order number
    function generateOrderNumber() {
        return `ORD-${Math.floor(Math.random() * 1000000)}`;
    }

    // Display order details in the modal

    let currentOrderNumber = '';
    function displayOrderDetails() {
        
        const orderDetailsElement = document.querySelector('#order-details');
        const modalTotalAmountElement = document.querySelector('#modal-total-amount');
        const totalAmountElement = document.querySelector('#total-amount'); 
        
        const orderNumberElement = document.querySelector('#manual-order-number');
        orderNumberElement.textContent = `Order Number: ${generateOrderNumber()}`;
        currentOrderNumber = orderNumberElement.textContent.replace('Order Number:', '').trim();
        
        const cartItems = [];

        orderDetailsElement.innerHTML = '';
    
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const itemName = cartItem.querySelector('.item-name').textContent;
            const itemPrice = cartItem.querySelector('.item-price').textContent;
            const itemQuantity = cartItem.querySelector('.item-quantity').textContent;
    
            const orderDetailItem = document.createElement('div');
            orderDetailItem.classList.add('order-detail-item');
            orderDetailItem.innerHTML = `
                <span class="order-item-name>${itemName}</span>
                <span class="order-item-quantity">x${itemQuantity}</span>
                <span class="order-item-price">${itemPrice}</span>
            `;
    
            orderDetailsElement.appendChild(orderDetailItem);

            cartItems.push({
                name: itemName,
                price: parseFloat(itemPrice.replace('₱', '').trim()),
                quantity: parseInt(itemQuantity.trim())
            });
        });
        
        const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        const ManualOrderDetails = {
            orderNumber: currentOrderNumber,
            totalPrice: totalPrice,
            cart: cartItems
        };

        localStorage.setItem(currentOrderNumber, JSON.stringify(ManualOrderDetails));

        // Setting the total amount in the modal
        modalTotalAmountElement.textContent = totalAmountElement.textContent.trim();
    
        // Real-time calculation of change
        const receivedAmountInput = document.querySelector('#received-amount');
        const changeAmountElement = document.querySelector('#change-amount');
    
        function calculateChange() {
            const totalAmount = parseFloat(modalTotalAmountElement.textContent.trim());
            const receivedAmount = parseFloat(receivedAmountInput.value);
    
            if (!isNaN(totalAmount) && !isNaN(receivedAmount)) {
                const changeAmount = receivedAmount - totalAmount;
                changeAmountElement.textContent = changeAmount.toFixed(2);
            } else {
                changeAmountElement.textContent = '0';
            }
        }
    
        // Event listener for input event on the received amount input field
        receivedAmountInput.addEventListener('input', calculateChange);
    }

    // Event listener for the Proceed to Payment button
    document.getElementById('proceed-to-payment-bills').addEventListener('click', () => {
        displayOrderDetails();
        console.log(currentOrderNumber);
        paymentModal.style.display = 'block';
    });

    // Event listener for the close button in the modal
    closeButton.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // Event listener for the Confirm Order button in the modal
    confirmOrderButton.addEventListener('click', () => {
        const orderDetails = JSON.parse(localStorage.getItem(currentOrderNumber));
        const receivedAmount = document.getElementById('received-amount').value;

        if (!orderDetails) {
            alert('No order details found!');
            return;
        }

        const formData = new FormData();
        formData.append('pending-order-number', orderDetails.orderNumber);
        formData.append('pending-modal-total-amount', orderDetails.totalPrice);
        formData.append('pending-received-amount', receivedAmount);
        formData.append('order-details', JSON.stringify(orderDetails.cart));

        fetch('/Kape_Cinco/backend/Home/confirm_order.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.message) {
                alert('Order Confirmed');
                const manualOngoingOrderNumber = `MANUAL-ONGOING-${orderDetails.orderNumber}`;
            
                localStorage.setItem(manualOngoingOrderNumber, JSON.stringify(orderDetails));

                let manualOngoingOrderNumbers = JSON.parse(localStorage.getItem('ManualOngoingOrderNumbers')) || [];
                manualOngoingOrderNumbers.push(manualOngoingOrderNumber);
                localStorage.setItem('ManualOngoingOrderNumbers', JSON.stringify(manualOngoingOrderNumbers));
            
            fetchAndRenderOngoingOrder();
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));

        clearCart();
        paymentModal.style.display = 'none';
        billsSection.style.display = 'none';
    });

    // Event listener for closing the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

 /*----------------- FOOD CATEGORIES ---------------------------------- */
    document.querySelectorAll('.categories button').forEach(button => {
        button.addEventListener('click', () => {
            billsSection.style.display = 'none';

            // Remove 'active' class from all category buttons
            document.querySelectorAll('.categories button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add 'active' class to the clicked category button
            button.classList.add('active');

            // Filter food items based on category
            const category = button.textContent.trim();
            if (category === 'All Items') {
                document.querySelectorAll('.food-item').forEach(item => {
                    item.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.food-item').forEach(item => {
                    if (item.querySelector('h3').textContent.includes(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });
 /*----------------- END FOOD CATEGORIES ---------------------------------- */
 
/* --------------------    Search functionality     --------------------*/
    const searchInput = document.querySelector('.header input');
    const searchButton = document.querySelector('.header button');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        document.querySelectorAll('.food-item').forEach(item => {
            const foodName = item.querySelector('h3').textContent.toLowerCase();
            if (foodName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Clear the cart and reset total amount when searching
        clearCart();
        billsSection.style.display = 'none';
    });

/* --------------------  End OF Search functionality     --------------------*/

/* --------------------------------------------- modal for pending, accept, completed orders ---------------------------------------*/

//----------------------- PENDING ORDER NUMBER FUNCTIONS --------------------//
    let currentOrderToken = '';
    function fetchAndRenderPendingOrder() {
        const pendingOrdersContainer = document.getElementById('pending-orders');
        const pendingOrderNumber = document.getElementById('pending-order-number');
        const pendingOrderDetails = document.getElementById('pending-order-details');
        const modalTotalAmount = document.getElementById('pending-modal-total-amount');
        const modal = document.getElementById('pending-orders-modal');
       
        pendingOrdersContainer.innerHTML = ''; 

        // Retrieve all pending orders from localStorage
        const pendingOrders = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ORDT-')) {
                pendingOrders.push(JSON.parse(localStorage.getItem(key)));
            }
        }

        pendingOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.setAttribute('data-order-number', order.orderNumber);
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${order.orderNumber}</span></li>
            `;
            pendingOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function() {
                pendingOrderNumber.textContent = order.orderNumber;
                pendingOrderDetails.innerHTML = order.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.name}</span>
                        <span class="quantity">${item.quantity}x</span>
                        <span class="total">Total: ₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${order.totalPrice.toFixed(2)}`;
                currentOrderToken = order.token;
                modal.style.display = 'block';
                pendingPayment();
            });
        });
    }

    let currentOngoingOrderToken = '';
    function fetchAndRenderOngoingOrder() {
        const ongoingOrdersContainer = document.getElementById('ongoing-orders');
        const ongoingOrderNumber = document.getElementById('ongoing-order-number');
        const ongoingOrderDetails = document.getElementById('ongoing-order-details');
        const modalTotalAmount = document.getElementById('ongoing-modal-total-amount');
        const modal = document.getElementById('ongoing-orders-modal');

        ongoingOrdersContainer.innerHTML = ''; 

        const ongoingOrderTokens = JSON.parse(localStorage.getItem('ongoingOrderTokens')) || [];
        const manualOrderNumbers = JSON.parse(localStorage.getItem('ManualOngoingOrderNumbers')) || [];

        const renderOrder = (orderDetails, orderNumber) => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${orderDetails.orderNumber}</span></li>
            `;
            ongoingOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function () {
                ongoingOrderNumber.textContent = orderDetails.orderNumber;
                ongoingOrderDetails.innerHTML = orderDetails.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.name}</span>
                        <span class="quantity">${item.quantity}x</span>
                        <span class="total">Total: ₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${orderDetails.totalPrice.toFixed(2)}`;
                currentOngoingOrderToken = orderNumber; // Note: This should be set to the correct variable based on your context
                modal.style.display = 'block';
            });
        };

        ongoingOrderTokens.forEach(token => {
            if (token.startsWith('ONGOING-')) {
                const ongoingOrder = JSON.parse(localStorage.getItem(token));
                if (ongoingOrder) {
                    renderOrder(ongoingOrder, token);
                }
            }
        });

        manualOrderNumbers.forEach(orderNumber => {
            if (orderNumber.startsWith('MANUAL-ONGOING-')) {
                const manualOrderDetails = JSON.parse(localStorage.getItem(orderNumber));
                if (manualOrderDetails) {
                    renderOrder(manualOrderDetails, orderNumber);
                }
            }
        });

    }

    function fetchAndRenderCompleteOrder() {
        const completedOrdersContainer = document.getElementById('completed-orders');
        const completedOrderNumber = document.getElementById('completed-order-number');
        const completedOrderDetails = document.getElementById('completed-order-details');
        const modalTotalAmount = document.getElementById('completed-modal-total-amount');
        const modal = document.getElementById('completed-orders-modal');

        completedOrdersContainer.innerHTML = ''; 

        const completeOrderTokens = JSON.parse(localStorage.getItem('completeOrderTokens')) || [];
        const manualCompleteOrderNumbers = JSON.parse(localStorage.getItem('ManualCompleteOrderNumbers')) || [];

        const renderOrder = (orderDetails, orderNumber) => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${orderDetails.orderNumber}</span></li>
            `;
            completedOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function () {
                completedOrderNumber.textContent = orderDetails.orderNumber;
                completedOrderDetails.innerHTML = orderDetails.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.name}</span>
                        <span class="quantity">${item.quantity}x</span>
                        <span class="total">Total: ₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${orderDetails.totalPrice.toFixed(2)}`;
                modal.style.display = 'block';
            });
        };

        completeOrderTokens.forEach(token => {
            if (token.startsWith('COMPLETE-')) {
                const completedOrder = JSON.parse(localStorage.getItem(token));
                if (completedOrder) {
                    renderOrder(completedOrder, token);
                }
            }
        });

        manualCompleteOrderNumbers.forEach(orderNumber => {
            if (orderNumber.startsWith('MANUAL-COMPLETE-')) {
                const manualOrderDetails = JSON.parse(localStorage.getItem(orderNumber));
                if (manualOrderDetails) {
                    renderOrder(manualOrderDetails, orderNumber);
                }
            }
        });
    }

    function fetchAndRenderCancelOrder() {
        const canceledOrdersContainer = document.getElementById('canceled-orders');
        const canceledOrderNumber = document.getElementById('canceled-order-number');
        const canceledOrderDetails = document.getElementById('canceled-order-details');
        const modalTotalAmount = document.getElementById('canceled-modal-total-amount');
        const modal = document.getElementById('canceled-orders-modal');
    
        canceledOrdersContainer.innerHTML = ''; 
    
        const canceledOrderTokens = JSON.parse(localStorage.getItem('canceledOrderTokens')) || [];
    
        const renderOrder = (orderDetails, orderNumber) => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${orderDetails.orderNumber}</span></li>
            `;
            canceledOrdersContainer.appendChild(orderItem);
            /*
            orderItem.addEventListener('click', function () {
                canceledOrderNumber.textContent = orderDetails.orderNumber;
                canceledOrderDetails.innerHTML = orderDetails.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.name}</span>
                        <span class="quantity">${item.quantity}x</span>
                        <span class="total">Total: ₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${orderDetails.totalPrice.toFixed(2)}`;
                modal.style.display = 'block';
            });*/
        };
    
        canceledOrderTokens.forEach(token => {
            if (token.startsWith('CANCELED-')) {
                const canceledOrder = JSON.parse(localStorage.getItem(token));
                if (canceledOrder) {
                    renderOrder(canceledOrder, token);
                }
            }
        });
    }

    function pendingPayment () {
        const pendingTotalAmountElement = document.querySelector('#pending-modal-total-amount');
        const receivedAmountInput = document.querySelector('#pending-received-amount');
        const changeAmountElement = document.querySelector('#pending-change-amount');

        function calculateChange() {
            const totalAmount = parseFloat(pendingTotalAmountElement.textContent.replace('₱', '').trim());
            const receivedAmount = parseFloat(receivedAmountInput.value);

            if (!isNaN(totalAmount) && !isNaN(receivedAmount)) {
                const changeAmount = receivedAmount - totalAmount;
                changeAmountElement.textContent = changeAmount.toFixed(2);
            } else {
                changeAmountElement.textContent = '0';
            }
        }

        // Event listener for input event on the received amount input field
        receivedAmountInput.addEventListener('input', calculateChange);
    }

    //----------------------- PENDING ORDER NUMBER FUNCTIONS --------------------//

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function () {
            button.parentElement.parentElement.style.display = 'none';
        });
    });

    document.querySelectorAll('.order-card').forEach(orderCard => {
        orderCard.addEventListener('click', function () {
            const orderNumber = orderCard.querySelector('#order-number').textContent;
            let modalId;
            if (orderCard.parentElement.id === 'pending-orders') {
                modalId = 'pending-orders-modal';
                document.getElementById('pending-order-number').textContent = orderNumber;
                // Fetch and display order details
            } else if (orderCard.parentElement.id === 'ongoing-orders') {
                modalId = 'ongoing-orders-modal';
                document.getElementById('ongoing-order-number').textContent = orderNumber;
                // Fetch and display order details
            } else if (orderCard.parentElement.id === 'completed-orders') {
                modalId = 'completed-orders-modal';
                document.getElementById('completed-order-number').textContent = orderNumber;
                // Fetch and display order details
            }
            document.getElementById(modalId).style.display = 'block';
        });
    });

    function initializeOrders() {
        fetchAndRenderPendingOrder();
        fetchAndRenderOngoingOrder();
        fetchAndRenderCancelOrder();
        fetchAndRenderCompleteOrder();
    }

    initializeOrders();

    //Confirm Pending Order Button
    document.getElementById('confirm-pending-order').addEventListener('click', function () {

        const orderNumber = document.getElementById('pending-order-number').textContent;
        const receivedAmount = document.getElementById('pending-received-amount').value;

        
        const orderToken = currentOrderToken; 
        const orderDetails = JSON.parse(localStorage.getItem(orderToken));
        const cart = orderDetails.cart;
        const totalAmount = orderDetails.totalPrice;

        const formData = new FormData();
        formData.append('pending-order-number', orderNumber);
        formData.append('pending-modal-total-amount', totalAmount);
        formData.append('pending-received-amount', receivedAmount);
        formData.append('order-details', JSON.stringify(cart));

        fetch('/Kape_Cinco/backend/Home/confirm_order.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.message) {
                alert('Order Confirmed');
                const ongoingOrderToken = `ONGOING-${orderNumber}`;
            
                localStorage.setItem(ongoingOrderToken, JSON.stringify(orderDetails));

                let ongoingOrderTokens = JSON.parse(localStorage.getItem('ongoingOrderTokens')) || [];
                ongoingOrderTokens.push(ongoingOrderToken);
                localStorage.setItem('ongoingOrderTokens', JSON.stringify(ongoingOrderTokens));

                localStorage.removeItem(orderToken); 

                document.getElementById('pending-orders-modal').style.display = 'none';
                currentOrderToken = '';
                currentOngoingOrderToken = ongoingOrderToken;
                fetchAndRenderPendingOrder(); 
                fetchAndRenderOngoingOrder();
                
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
        
        document.getElementById('pending-orders-modal').style.display = 'none';
        
        fetchAndRenderPendingOrder();
    });

    //Cancel Pending Order Button
    document.getElementById('cancel-pending-order').addEventListener('click', function () {

        const orderNumber = document.getElementById('pending-order-number').textContent;

        if (currentOrderToken) {
            alert('Order Canceled');
            
            const orderToken = currentOrderToken; 
            const orderDetails = JSON.parse(localStorage.getItem(orderToken));

            const canceledOrderToken = `CANCELED-${orderNumber}`;

            localStorage.setItem(canceledOrderToken, JSON.stringify(orderDetails));

            let canceledOrderTokens = JSON.parse(localStorage.getItem('canceledOrderTokens')) || [];
            if (!canceledOrderTokens.includes(canceledOrderToken)) {
                canceledOrderTokens.push(canceledOrderToken);
                localStorage.setItem('canceledOrderTokens', JSON.stringify(canceledOrderTokens));
            }

            localStorage.removeItem(orderToken); 

            document.getElementById('pending-orders-modal').style.display = 'none';
            currentOrderToken = ''; 
            fetchAndRenderPendingOrder(); 
            fetchAndRenderCancelOrder();
        }
    });

    document.getElementById('complete-ongoing-order').addEventListener('click', function () {
        const orderNumber = document.getElementById('ongoing-order-number').textContent; // Correct ID
        const isManualOrder = orderNumber.startsWith('MANUAL-'); // Check if the order is manual
    
        alert('Order Completed');
    
        const orderToken = currentOngoingOrderToken;
        const orderDetails = JSON.parse(localStorage.getItem(orderToken));
    
        const completeOrderToken = isManualOrder ? `MANUAL-COMPLETE-${orderNumber}` : `COMPLETE-${orderNumber}`;
    
        localStorage.setItem(completeOrderToken, JSON.stringify(orderDetails));
    
        if (isManualOrder) {
            let manualCompleteOrderNumbers = JSON.parse(localStorage.getItem('ManualCompleteOrderNumbers')) || [];
            if (!manualCompleteOrderNumbers.includes(completeOrderToken)) {
                manualCompleteOrderNumbers.push(completeOrderToken);
                localStorage.setItem('ManualCompleteOrderNumbers', JSON.stringify(manualCompleteOrderNumbers));
            }
        } else {
            let completeOrderTokens = JSON.parse(localStorage.getItem('completeOrderTokens')) || [];
            if (!completeOrderTokens.includes(completeOrderToken)) {
                completeOrderTokens.push(completeOrderToken);
                localStorage.setItem('completeOrderTokens', JSON.stringify(completeOrderTokens));
            }
        }

        localStorage.removeItem(orderToken); 

        document.getElementById('ongoing-orders-modal').style.display = 'none';
        currentOngoingOrderToken = '';
        fetchAndRenderOngoingOrder();
        fetchAndRenderCompleteOrder();
    });

    document.getElementById('cancel-ongoing-order').addEventListener('click', function () {
        const orderNumber = document.getElementById('ongoing-order-number').textContent; // Use the correct ID

        if (currentOngoingOrderToken) {
            alert('Order Canceled');
            
            const orderToken = currentOngoingOrderToken;
            const orderDetails = JSON.parse(localStorage.getItem(orderToken));

            const canceledOrderToken = `CANCELED-${orderNumber}`;

            localStorage.setItem(canceledOrderToken, JSON.stringify(orderDetails));

            let canceledOrderTokens = JSON.parse(localStorage.getItem('canceledOrderTokens')) || [];
            if (!canceledOrderTokens.includes(canceledOrderToken)) {
                canceledOrderTokens.push(canceledOrderToken);
                localStorage.setItem('canceledOrderTokens', JSON.stringify(canceledOrderTokens));
            }

            localStorage.removeItem(orderToken); 

            document.getElementById('ongoing-orders-modal').style.display = 'none'; // Correct ID for ongoing orders modal
            currentOngoingOrderToken = ''; 
            fetchAndRenderOngoingOrder(); 
            fetchAndRenderCancelOrder();
        }
    });
    
    setInterval(fetchAndRenderPendingOrder, 3000);

/* ------------------- modal for pending, accept, completed orders ---------------*/

 /* --------------------    Section Categories     --------------------*/
    // Hide the other sections initially
    document.getElementById('OrderNum-section').style.display = 'none';
    document.getElementById('statistics-section').style.display = 'none';
    document.getElementById('settings-section').style.display = 'none';

    // Add event listeners to sidebar navigation
    document.getElementById('nav-home').addEventListener('click', () => {
        // Handle home navigation
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('OrderNum-section').style.display = 'none';
        document.getElementById('statistics-section').style.display = 'none';
        document.getElementById('settings-section').style.display = 'none';
        billsSection.style.display = 'none';
    });

    document.getElementById('nav-Order-num').addEventListener('click', () => {
        // Handle orders navigation
        document.getElementById('main-content').style.display = 'none';
        displayOrderDetails(); // Update order details
        document.getElementById('OrderNum-section').style.display = 'block';
        document.getElementById('statistics-section').style.display = 'none';
        document.getElementById('settings-section').style.display = 'none';
        billsSection.style.display = 'none';
    });

    document.getElementById('nav-statistics').addEventListener('click', () => {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('OrderNum-section').style.display = 'none';
        document.getElementById('statistics-section').style.display = 'block';
        document.getElementById('settings-section').style.display = 'none';
        billsSection.style.display = 'none';
    });

    async function dailySales () {
        try {
            const res = await fetch("/Kape_Cinco/backend/Home/stats.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    async function displaySales () {
        const totalSales = await dailySales();

        console.log(totalSales);
        totalIncome.innerHTML = totalSales[0].Sales;
        totalOrders.innerHTML = totalSales[0].total_orders;

    }

    displaySales()

    /*
    document.getElementById('nav-settings').addEventListener('click', () => {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('OrderNum-section').style.display = 'none';
        document.getElementById('statistics-section').style.display = 'none';
        document.getElementById('settings-section').style.display = 'block';
        billsSection.style.display = 'none';
    });*/ //wala naman to ah? comment ko muna - jedd 

 /* --------------------    End of Section Categories     --------------------*/
  

});
