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
    function displayOrderDetails() {
        
        const orderDetailsElement = document.querySelector('#order-details');
        const modalTotalAmountElement = document.querySelector('#modal-total-amount');
        const totalAmountElement = document.querySelector('#total-amount'); 
        
        // Setting the order number and order details
        orderDetailsElement.innerHTML = '';
    
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const itemName = cartItem.querySelector('.item-name').textContent;
            const itemPrice = cartItem.querySelector('.item-price').textContent;
            const itemQuantity = cartItem.querySelector('.item-quantity').textContent;
    
            const orderDetailItem = document.createElement('div');
            orderDetailItem.classList.add('order-detail-item');
            orderDetailItem.innerHTML = `
                <span class="order-item-name">${itemName}</span>
                <span class="order-item-quantity">x${itemQuantity}</span>
                <span class="order-item-price">${itemPrice}</span>
            `;
    
            orderDetailsElement.appendChild(orderDetailItem);
        });
    
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
        paymentModal.style.display = 'block';
    });

    // Event listener for the close button in the modal
    closeButton.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // Event listener for the Confirm Order button in the modal
    confirmOrderButton.addEventListener('click', () => {
        
        //After Confirm Order lang madisplay yung orderNumber (sa receipt and accepted order)
        /*
        const orderNumberElement = document.querySelector('#manual-order-number');
        orderNumberElement.textContent = `Order Number: ${generateOrderNumber()}`;*/

        alert('Order Confirmed!');
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
            } else if (orderCard.parentElement.id === 'accepted-orders') {
                modalId = 'accepted-orders-modal';
                document.getElementById('accepted-order-number').textContent = orderNumber;
                // Fetch and display order details
            } else if (orderCard.parentElement.id === 'completed-orders') {
                modalId = 'completed-orders-modal';
                document.getElementById('completed-order-number').textContent = orderNumber;
                // Fetch and display order details
            }
            document.getElementById(modalId).style.display = 'block';
        });
    });

    fetchAndRenderPendingOrder();

    document.getElementById('confirm-pending-order').addEventListener('click', function () {

        const orderNumber = document.getElementById('pending-order-number').textContent;
        const receivedAmount = document.getElementById('pending-received-amount').value;

        
        const orderToken = currentOrderToken; 
        const orderDetails = JSON.parse(localStorage.getItem(orderToken));
        const cart = orderDetails.cart;
        const totalAmount = orderDetails.totalPrice;

        console.log('Order Number:', orderNumber);
        console.log('Total Amount:', totalAmount);
        console.log('Received Amount:', receivedAmount);
        console.log('Order Details:', cart);

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
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
        
        document.getElementById('pending-orders-modal').style.display = 'none';
        fetchAndRenderPendingOrder();
    });

    document.getElementById('cancel-pending-order').addEventListener('click', function () {
        if (currentOrderToken) {
            localStorage.removeItem(currentOrderToken); 
            alert('Order Canceled');
            document.getElementById('pending-orders-modal').style.display = 'none';
            currentOrderToken = ''; 
            fetchAndRenderPendingOrder(); 
        }
    });

    document.getElementById('complete-accepted-order').addEventListener('click', function () {
        alert('Order Completed');
        document.getElementById('accepted-orders-modal').style.display = 'none';
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
