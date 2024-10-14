document.addEventListener('DOMContentLoaded', async function () {
    const allItemsContainer = document.getElementById('AllItemsContainer');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.getElementById('total-amount');
    const billsSection = document.querySelector('.bills-section');
    const paymentModal = document.getElementById('payment-modal');
    const closeButton = document.querySelector('.close-button');
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
    
    async function fetchAllOrders() {
        try {
            const res = await fetch("/Kape_Cinco/backend/Home/allorders.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return [];
        }
    }

    async function dailySales () {
        try {
            const res = await fetch("/Kape_Cinco/backend/Home/stats.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }
    
    async function generateAllItems() {
        try {
            const allItems = await fetchAllItems();
            allItemsContainer.innerHTML = '';

            allItems.forEach(item => {
                const allItem = document.createElement('div');
                allItem.className = "food-item";

                const category = item.food_type || item.drink_type;
                const categoryMapping = {
                    'Iced': 'Coffee', 
                    'Hot': 'Coffee', 
                    'Iced/Hot': 'Coffee',
                    'Misc': 'Misc Drinks'
                };

                allItem.setAttribute('data-category', categoryMapping[category] || category);

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

                const defaultServeCount = item.food_serve_count || item.drink_serve_count;

                allItem.dataset.serveCount = defaultServeCount;

                const allItemPrice = document.createElement('p');
                allItemPrice.className = "all-item-price"; 
                if (item.food_price) {
                    allItemPrice.textContent = item.food_price;
                } else if (item.drink_price) {
                    allItemPrice.textContent = item.drink_price;
                }
    
                // Create a container for dropdown and button
                const bottomContainer = document.createElement('div');
                bottomContainer.className = 'bottom-container';
    
                // Create a dynamic select dropdown for variants if they exist
                if (item.variants && item.variants.length > 0) {
                    const variantSelect = document.createElement('select');
                    variantSelect.className = 'variant-select';

                    const originalName = item.food_name || item.drink_name;
                    const originalPrice = item.food_price || item.drink_price;
                    const originalServeCount = item.food_serve_count || item.drink_serve_count;

                    // Set the original name and price as the default option
                    const originalOption = document.createElement('option');
                    originalOption.value = '';
                    originalOption.textContent = `${originalName} - ₱${originalPrice}`;
                    originalOption.dataset.serveCount = originalServeCount;
                    originalOption.dataset.price = originalPrice;
                    variantSelect.appendChild(originalOption);
                    
                    item.variants.forEach(variant => {
                        const option = document.createElement('option');
                        option.value = variant.variant_name;
                        option.textContent = `${variant.variant_name} - ₱${variant.variant_price}`;
                        option.dataset.price = variant.variant_price;
                        option.dataset.serveCount = variant.variant_serve_count;
                        
                        if (variant.variant_status === "Unavailable") {
                            option.disabled = true; 
                            option.textContent += ' (Unavailable)'; 
                        }

                        variantSelect.appendChild(option);
                    });
    
                    // Update the item name and price when variant changes
                    variantSelect.addEventListener('change', (event) => {
                        const selectedOption = event.target.selectedOptions[0];
    
                        if (!selectedOption.value) {
                            allItemName.textContent = originalName;
                            allItemPrice.textContent = `₱${parseFloat(originalPrice).toFixed(2)}`;
                            addToCart(originalName, parseFloat(originalPrice), originalServeCount);
                        } else {
                            // Update item name and price for the selected variant
                            const variantPrice = parseFloat(selectedOption.dataset.price);
                            const variantServeCount = selectedOption.dataset.serveCount;
                            allItemName.textContent = `${selectedOption.value}`;
                            allItemPrice.textContent = `₱${variantPrice.toFixed(2)}`;
                            addToCart(selectedOption.value, variantPrice, variantServeCount); 
                        }
                    });
    
                    bottomContainer.appendChild(variantSelect); // Append the variant select to the bottom container
                }
    
                // Add to billing button
                const addToCartButton = document.createElement('button');
                addToCartButton.className = 'add-to-cart';
                const spanElement = document.createElement('span');
                spanElement.textContent = 'Add to billing';
                addToCartButton.appendChild(spanElement);
    
                bottomContainer.appendChild(addToCartButton); // Append the button to the bottom container
    
                allItem.appendChild(allItemImage);
                allItem.appendChild(allItemName);
                allItem.appendChild(allItemPrice);
                allItem.appendChild(bottomContainer); // Append the bottom container to the item
    
                // Handle unavailable status
                if (item.food_status === 'Unavailable' || item.drink_status === 'Unavailable') {
                    allItemImage.style.opacity = '0.5';
                    addToCartButton.disabled = true;
                    addToCartButton.style.opacity = '0.5';
                    addToCartButton.style.cursor = 'not-allowed';
                }
    
                allItemsContainer.appendChild(allItem);
            });
    
            // Event listener for adding items to the cart
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const foodItem = event.target.closest('.food-item');
                    const foodName = foodItem.querySelector('h3').textContent;
                    const foodPrice = parseFloat(foodItem.querySelector('p').textContent.replace('₱', '').replace(',', ''));
    
                    // Get the selected variant, if any
                    const variantSelect = foodItem.querySelector('.variant-select');
                    let serveCount = parseInt(foodItem.dataset.serveCount);

                    if (variantSelect) {
                        const selectedVariant = variantSelect.selectedOptions[0]; // Get the selected option
                        serveCount = selectedVariant.dataset.serveCount ? parseInt(selectedVariant.dataset.serveCount) : null;
                    } 

                    // Pass the foodName, foodPrice, and serveCount to the addToCart function
                    addToCart(foodName, foodPrice, serveCount);
                    billsSection.style.display = 'block';
                });
            });
        } catch (error) {
            console.error('Error generating items:', error);
        }
    }
    
    generateAllItems();
    

    /* ------------------------- FOOD CATEGORIES ------------------------- */
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
            const category = button.getAttribute('data-category');
            
            // Filter items based on the category
            document.querySelectorAll('.food-item').forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === 'All Items' || itemCategory === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
 
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
        /*
        // Clear the cart and reset total amount when searching
        clearCart();
        billsSection.style.display = 'none';*/
    });

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

    /* ------------------------- CLEAR FUNCTIONS ----------------------------*/
    
    // Clear the cart and reset total amount function
    function clearCart() {
        cartItemsContainer.innerHTML = '';
        totalAmount = 0;
        totalAmountElement.textContent = `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Event listener for the close button in the modal
    closeButton.addEventListener('click', () => {
        clearAmountFields ()
        paymentModal.style.display = 'none';
    });
    
    // Clear the amount fields on payment modal
    function clearAmountFields () {
        const receivedAmountInput = document.querySelector('#received-amount');
        const changeAmountElement = document.querySelector('#change-amount');

        receivedAmountInput.value = '';
        changeAmountElement.textContent = '';
    }

    // Clear the amount fields on pending orders modal
    function clearPendingAmountFields () {
        const receivedAmountInput = document.querySelector('#pending-received-amount');
        const changeAmountElement = document.querySelector('#pending-change-amount');

        receivedAmountInput.value = '';
        changeAmountElement.textContent = '';
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
        totalAmountElement.textContent = `₱${newTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function addToCart(name, price, serveCount) {
        // Check if the item is already in the cart
        const existingCartItem = Array.from(cartItemsContainer.children).find(item => {
            return item.querySelector('.item-name').textContent === name;
        });

        if (existingCartItem) {
            // Item already exists, increment quantity
            const quantityElement = existingCartItem.querySelector('.item-quantity');
            const quantity = parseInt(quantityElement.textContent); 
            
            if (!serveCount || quantity <= serveCount) {
                quantityElement.textContent = quantity;
                updateButtonStates(existingCartItem);
            } else {
                alert(`Sorry, you can't order more than ${serveCount} of this item.`);
            }
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

            cartItem.dataset.serveCount = serveCount;

            // Add event listeners for the new increment and decrement buttons
            cartItem.querySelector('.increment-quantity').addEventListener('click', () => {
                const quantityElement = cartItem.querySelector('.item-quantity');
                const quantity = parseInt(quantityElement.textContent);
                const maxServeCount = parseInt(cartItem.dataset.serveCount);

                // Check if quantity is less than the serve count (if maxServeCount is provided)
                if (!maxServeCount || quantity < maxServeCount) {
                    quantityElement.textContent = quantity + 1;
                    updateTotal();
                    updateButtonStates(cartItem);
                } else {
                    updateButtonStates(cartItem);
                }
            });

            cartItem.querySelector('.decrement-quantity').addEventListener('click', () => {
                const quantityElement = cartItem.querySelector('.item-quantity');
                const quantity = parseInt(quantityElement.textContent);
                if (quantity > 1) {
                    quantityElement.textContent = quantity - 1;
                    updateButtonStates(cartItem);
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
        totalAmountElement.textContent = `₱${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Utility function to update button states
    function updateButtonStates(cartItem) {
        const quantityElement = cartItem.querySelector('.item-quantity');
        const quantity = parseInt(quantityElement.textContent);
        const maxServeCount = parseInt(cartItem.dataset.serveCount);

        const incrementButton = cartItem.querySelector('.increment-quantity');
        const decrementButton = cartItem.querySelector('.decrement-quantity');

        // Helper function to toggle button states and classes
        const toggleButtonState = (button, isDisabled) => {
            button.disabled = isDisabled;
            button.classList.toggle('disabled', isDisabled);
        };

        toggleButtonState(incrementButton, maxServeCount && quantity >= maxServeCount);
        toggleButtonState(decrementButton, quantity < 1);
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
        const orderNumberElement = document.querySelector('#manual-order-number');

        orderNumberElement.textContent = `Order Number: ${generateOrderNumber()}`;
        const orderNumber = orderNumberElement.textContent.replace('Order Number:', '').trim();

        orderDetailsElement.innerHTML = '';

        const cartItems = [];
    
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const itemName = cartItem.querySelector('.item-name').textContent;
            const itemPrice = cartItem.querySelector('.item-price').textContent;
            const itemQuantity = cartItem.querySelector('.item-quantity').textContent;
    
            const orderDetailItem = document.createElement('div');
            orderDetailItem.classList.add('order-detail-item');
            orderDetailItem.innerHTML = `
                <span class="order-item-name>${itemName}</span>
                <span class="order-item-quantity">x${itemQuantity}</span>
                <span class="order-item-price">₱${itemPrice}</span>
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
            orderNumber: orderNumber,
            totalPrice: totalPrice,
            cart: cartItems
        };

        localStorage.setItem('ManualOrderDetails', JSON.stringify(ManualOrderDetails));

        modalTotalAmountElement.textContent = totalAmountElement.textContent.trim();
        const receivedAmountInput = document.querySelector('#received-amount');
        const changeAmountElement = document.querySelector('#change-amount');
    
        function calculateChange() {
            const totalAmount = parseFloat(modalTotalAmountElement.textContent.replace('₱', '').replace(',','').trim());
            const receivedAmount = parseFloat(receivedAmountInput.value);
    
            if (!isNaN(totalAmount) && !isNaN(receivedAmount)) {
                const changeAmount = receivedAmount - totalAmount;
                changeAmountElement.textContent = changeAmount.toFixed(2);
            } else {
                changeAmountElement.textContent = '0';
            }
        }
    
        receivedAmountInput.addEventListener('input', calculateChange);
    }

    // Event listener for the Proceed to Payment button
    document.getElementById('proceed-to-payment-bills').addEventListener('click', () => {
        displayOrderDetails();
        paymentModal.style.display = 'block';
    }); 
    
    // Event listener for the Confirm Order button in the modal
    confirmOrderButton.addEventListener('click', () => {
        const orderDetails = JSON.parse(localStorage.getItem('ManualOrderDetails'));
        const pendingTotalAmountElement = document.querySelector('#modal-total-amount');
        const totalAmount = parseFloat(pendingTotalAmountElement.textContent.replace('₱', '').replace(',','').trim());
        const receivedAmount = document.getElementById('received-amount').value;
        const orderStats = 'Ongoing';

        if (!orderDetails.orderNumber) {
            alert('No order details found!');
            return;
        }

        if (isNaN(receivedAmount) || receivedAmount <= 0 || receivedAmount < totalAmount) {
            alert('Please enter a valid amount');
        } else {
            const formData = new FormData();
            formData.append('order-number', orderDetails.orderNumber);
            formData.append('total-amount', orderDetails.totalPrice);
            formData.append('received-amount', receivedAmount);
            formData.append('order-stats', orderStats);
            formData.append('order-details', JSON.stringify(orderDetails.cart));

            fetch('/Kape_Cinco/backend/Home/confirm_order.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json()) 
            .then(data => {
                if (data.message) {
                    alert('Order Confirmed');
                    clearAmountFields ()
                    fetchAndRenderOngoingOrder();
                    paymentModal.style.display = 'none';
                    billsSection.style.display = 'none';
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => console.error('Error:', error));

            clearCart();
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            clearAmountFields ()
            paymentModal.style.display = 'none';
        }
    });

/* --------------------------------------------- modal for pending, accept, completed orders ---------------------------------------*/

//----------------------- PENDING ORDER NUMBER FUNCTIONS --------------------//

    //Fetch Pending Orders
    async function fetchAndRenderPendingOrder() {
        const orders = await fetchAllOrders();
        //console.log(orders);
        const pendingOrdersContainer = document.getElementById('pending-orders');
        const pendingOrderNumber = document.getElementById('pending-order-number');
        const pendingOrderDetails = document.getElementById('pending-order-details');
        const modalTotalAmount = document.getElementById('pending-modal-total-amount');
        const modal = document.getElementById('pending-orders-modal');
        
        pendingOrdersContainer.innerHTML = ''; 

        const pendingOrders = orders.filter(order => order.order_status === 'Pending');

        pendingOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.setAttribute('data-order-number', order.order_number);
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${order.order_number}</span></li>
            `;
            pendingOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function() {
                pendingOrderNumber.textContent = order.order_number;
                pendingOrderDetails.innerHTML = order.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.item_name}</span>
                        <span class="quantity">${item.item_quantity}x</span>
                        <span class="total">Total: ₱${item.item_total_price.toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${order.order_total_amount.toFixed(2)}`;
                modal.style.display = 'block';
                pendingPayment();
            });
        });
    }

    //Fetch Ongoing Orders
    async function fetchAndRenderOngoingOrder() {
        const orders = await fetchAllOrders();

        const ongoingOrdersContainer = document.getElementById('ongoing-orders');
        const ongoingOrderNumber = document.getElementById('ongoing-order-number');
        const ongoingOrderDetails = document.getElementById('ongoing-order-details');
        const modalTotalAmount = document.getElementById('ongoing-modal-total-amount');
        const modalTotalReceived = document.getElementById('ongoing-modal-received-amount');

        const modal = document.getElementById('ongoing-orders-modal');

        ongoingOrdersContainer.innerHTML = ''; 

        const ongoingOrders = orders.filter(order => order.order_status === 'Ongoing');

        ongoingOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${order.order_number}</span></li>
            `;
            ongoingOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function () {
                ongoingOrderNumber.textContent = order.order_number;
                ongoingOrderDetails.innerHTML = order.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.item_name}</span>
                        <span class="quantity">${item.item_quantity}x</span>
                        <span class="total">Total: ₱${item.item_total_price.toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${order.order_total_amount.toFixed(2)}`;
                modalTotalReceived.textContent = `₱${order.order_payment_received.toFixed(2)}`;
                modal.style.display = 'block';
            });
        });
    }

    //Fetch Completed Orders
    async function fetchAndRenderCompleteOrder() {
        const orders = await fetchAllOrders();

        const completedOrdersContainer = document.getElementById('completed-orders');
        const completedOrderNumber = document.getElementById('completed-order-number');
        const completedOrderDetails = document.getElementById('completed-order-details');
        const modalTotalAmount = document.getElementById('completed-modal-total-amount');
        const modalTotalReceived = document.getElementById('completed-modal-received-amount');
        const modalTotalChange = document.getElementById('completed-modal-change-amount');
        const modal = document.getElementById('completed-orders-modal');

        completedOrdersContainer.innerHTML = ''; 
        const completedOrders = orders.filter(order => order.order_status === 'Completed');

        completedOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${order.order_number}</span></li>
            `;
            completedOrdersContainer.appendChild(orderItem);

            orderItem.addEventListener('click', function () {
                completedOrderNumber.textContent = order.order_number;
                completedOrderDetails.innerHTML = order.cart.map(item => `
                    <div class="order-item">
                        <span class="food-name">${item.item_name}</span>
                        <span class="quantity">${item.item_quantity}x</span>
                        <span class="total">Total: ₱${item.item_total_price.toFixed(2)}</span>
                    </div>
                `).join('');
                modalTotalAmount.textContent = `₱${order.order_total_amount.toFixed(2)}`;
                modalTotalReceived.textContent = `₱${order.order_payment_received.toFixed(2)}`;

                const change = order.order_payment_received - order.order_total_amount;
                modalTotalChange.textContent = `₱${change.toFixed(2)}`;
                modal.style.display = 'block';
            });
        });
    }

    //Fetch Canceled Orders
    async function fetchAndRenderCancelOrder() {
        const orders = await fetchAllOrders();

        const canceledOrdersContainer = document.getElementById('canceled-orders');
        const canceledOrderNumber = document.getElementById('canceled-order-number');
        const canceledOrderDetails = document.getElementById('canceled-order-details');
        const modalTotalAmount = document.getElementById('canceled-modal-total-amount');
        const modal = document.getElementById('canceled-orders-modal');
    
        canceledOrdersContainer.innerHTML = ''; 
    
        const canceledOrders = orders.filter(order => order.order_status === 'Canceled');
    
        canceledOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-card');
            orderItem.innerHTML = `
                <li class="order-number-item"><span id="order-number">${order.order_number}</span></li>
            `;
            canceledOrdersContainer.appendChild(orderItem);/*
            orderItem.addEventListener('click', function () {
                canceledOrderNumber.textContent = order.order_number;
                canceledOrderDetails.innerHTML = order.cart.map(item => `
                    <div class="order-item">
                        <span class="total">Total: ₱${item.item_total_price.toFixed(2)}</span>
                    </div>
                `).join('');
                //modalTotalAmount.textContent = `₱${order.order_payment_received.toFixed(2)}`;
                modal.style.display = 'block';
            });*/
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

        receivedAmountInput.addEventListener('input', calculateChange);
    }

    //----------------------- PENDING ORDER NUMBER FUNCTIONS --------------------//

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function () {
            clearPendingAmountFields();
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
    document.getElementById('confirm-pending-order').addEventListener('click',  async function () {
        const orderNumber = document.getElementById('pending-order-number').textContent.replace('Order Number:', '').trim();
        const pendingTotalAmountElement = document.querySelector('#pending-modal-total-amount');
        const totalAmount = parseFloat(pendingTotalAmountElement.textContent.replace('₱', '').trim());
        const receivedAmountInput = document.getElementById('pending-received-amount');
        const receivedAmount = parseFloat(receivedAmountInput.value);

        if (isNaN(receivedAmount) || receivedAmount <= 0 || receivedAmount < totalAmount) {
            alert('Please enter a valid amount');
        } else {
            const orderStatus = 'Ongoing';

            const formData = new FormData();
            formData.append('order-number', orderNumber);
            formData.append('received-amount',receivedAmount);
            formData.append('order-stats',orderStatus);
        
            try {
                const response = await fetch('/Kape_Cinco/backend/Home/update_status.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData.success) {
                        alert("Pending Order Confirmed");
                        fetchAndRenderOngoingOrder();
                        fetchAndRenderPendingOrder();
                        clearPendingAmountFields();
                        document.getElementById('pending-orders-modal').style.display = 'none';
                    } else {
                        alert('Update failed!');
                    }
                } else {
                    alert('Update request failed!');
                }
            } catch (error) {
                console.error('Error updating item:', error);
                alert('An error occurred during the update.');
            }
        }
        
    });

    //Cancel Pending Order Button
    document.getElementById('cancel-pending-order').addEventListener('click', async function () {
        const orderNumber = document.getElementById('pending-order-number').textContent.replace('Order Number:', '').trim();
        const receivedAmountInput = document.getElementById('pending-received-amount');
        const receivedAmount = parseFloat(receivedAmountInput.value);

        if (receivedAmount === ''){
            receivedAmount = 0;
        }
        const orderStatus = 'Canceled';

        const formData = new FormData();
        formData.append('order-number', orderNumber);
        formData.append('received-amount',receivedAmount);
        formData.append('order-stats',orderStatus);
       
        try {
            const response = await fetch('/Kape_Cinco/backend/Home/update_status.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    alert("Pending Order Canceled");
                    fetchAndRenderCancelOrder();
                    fetchAndRenderPendingOrder();
                    document.getElementById('pending-orders-modal').style.display = 'none';
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
        }
    });

    //Complete Ongoing Order Button
    document.getElementById('complete-ongoing-order').addEventListener('click', async function () {
        const orderNumber = document.getElementById('ongoing-order-number').textContent.replace('Order Number:', '').trim();
        const receivedAmount = document.getElementById('ongoing-modal-received-amount').textContent.replace('₱', '').trim();
        const orderStatus = 'Completed';

        const formData = new FormData();
        formData.append('order-number', orderNumber);
        formData.append('received-amount',receivedAmount);
        formData.append('order-stats',orderStatus);
       
        try {
            const response = await fetch('/Kape_Cinco/backend/Home/update_status.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    alert("Ongoing Order Completed");
                    fetchAndRenderOngoingOrder();
                    fetchAndRenderCompleteOrder();
                    document.getElementById('ongoing-orders-modal').style.display = 'none';
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
        }
    });

    //Cancel Ongoing Order Button
    document.getElementById('cancel-ongoing-order').addEventListener('click', async function () {
        const orderNumber = document.getElementById('ongoing-order-number').textContent.replace('Order Number:', '').trim();
        const receivedAmount = document.getElementById('ongoing-modal-received-amount').textContent.replace('₱', '').trim();
        const orderStatus = 'Canceled';

        const formData = new FormData();
        formData.append('order-number', orderNumber);
        formData.append('received-amount',receivedAmount);
        formData.append('order-stats',orderStatus);
       
        try {
            const response = await fetch('/Kape_Cinco/backend/Home/update_status.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    alert("Ongoing Order Canceled");
                    fetchAndRenderOngoingOrder();
                    fetchAndRenderCancelOrder();
                    document.getElementById('ongoing-orders-modal').style.display = 'none';
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
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

    /* --------------------------- DAILY SALES ---------------------------- */
    async function fetchandRenderDailySales() {
        try {
            const modalTotalAmount = document.getElementById('sales-completed-modal-total-amount');
            const modalTotalReceived = document.getElementById('sales-completed-modal-received-amount');
            const modalTotalChange = document.getElementById('sales-completed-modal-change-amount');
            const SalesTableBody = document.getElementById('sales-table-body');
            const orderDetails = document.getElementById("orderDetails");
            const modal = document.getElementById("salesModal");  // Modal ID stays the same

            const orders = await fetchAllOrders();
            const today = new Date().toISOString().split('T')[0];
    
            // Filter for completed orders
            const completedOrders = orders.filter(order => order.order_status === 'Completed');
    
            // Filter for orders that were completed today
            const completedOrdersToday = completedOrders.filter(order => {
                const orderDate = order.order_date.split(' ')[0];
                return orderDate === today;
            });

            SalesTableBody.innerHTML = '';

            completedOrdersToday.reverse().forEach(order => {
                const row = document.createElement('tr');
                row.className = "order-row";
                row.setAttribute('data-sales-number', order.order_number); 
                
                // Build row content and store item names in a single pass
                let rowContent = '';
                let orderDetailsContent = '';
                let totalquantity = 0;

                order.cart.forEach(item => {
                    totalquantity += Number(item.item_quantity);
                    rowContent = `
                        <td>${order.order_number}</td>
                        <td>${totalquantity}</td>
                        <td>${order.order_total_amount.toFixed(2)}</td>
                    `;
    
                    orderDetailsContent += `
                        <span>${item.item_name}</span>
                        <span>x${item.item_quantity}</span>
                        <br></br>
                    `;
                });
    
                row.innerHTML = rowContent;
                
                row.addEventListener("click", function () {
                    modalTotalAmount.textContent = `₱${order.order_total_amount.toFixed(2)}`;
                    modalTotalReceived.textContent = `₱${order.order_payment_received.toFixed(2)}`;

                    const change = order.order_payment_received - order.order_total_amount;
                    modalTotalChange.textContent = `₱${change.toFixed(2)}`;
                    orderDetails.innerHTML = orderDetailsContent;
                    modal.style.display = "block";
                });

                SalesTableBody.appendChild(row);
            });
        }catch (err) {
            console.error('Error rendering daily sales:', err);
        }
    }

    /*end daily sales */
    /*async function fetchandRenderDailySales() {
        try {
            const orders = await fetchAllOrders();
            console.log(orders);
            const rowParent = document.getElementById('row-parent');
            rowParent.innerHTML = '';

            const today = new Date().toISOString().split('T')[0];
    
            // Filter for completed orders
            const completedOrders = orders.filter(order => order.order_status === 'Completed');
    
            // Filter for orders that were completed today
            const completedOrdersToday = completedOrders.filter(order => {
                const orderDate = order.order_date.split(' ')[0];
                return orderDate === today;
            });
    
            // Loop through each completed order and create dynamic rows
            completedOrdersToday.reverse().forEach(order => {
                const orderHtml = document.createElement('div');
                orderHtml.classList.add('row');
                orderHtml.innerHTML = order.cart.map(item => `
                        <div class="columns">
                            <img src="${item.item_image ? '/Kape_Cinco/backend/images/' + item.item_image : '/Kape_Cinco/frontend/images/kape_cinco.jpg'}" alt="${item.item_name}">
                            <strong>${item.item_name}</strong>
                        </div>
                        <div class="columns"><strong>Orders: ${item.item_quantity}</strong></div>
                        <div class="columns"><strong>Total: ₱${item.item_total_price.toFixed(2)}</strong></div>
                `).join('');
    
                rowParent.appendChild(orderHtml);
            });
        } catch (err) {
            console.error('Error rendering daily sales:', err);
        }
    }*/

    async function displaySales () {
        const totalSales = await dailySales();

        //console.log(totalSales);
        totalIncome.innerHTML = totalSales[0].Sales;
        totalOrders.innerHTML = totalSales[0].total_orders;
    }
    
    fetchandRenderDailySales();
    displaySales();

    setInterval(fetchandRenderDailySales,3000);
    setInterval(displaySales,3000);
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
