document.addEventListener('DOMContentLoaded', async function () {
    const allItemsContainer = document.getElementById('AllItemsContainer');

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
        totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Function to update total amount based on quantities
    function updateTotal() {
        let newTotal = 0;
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const price = parseFloat(cartItem.querySelector('.item-price').textContent.replace('Rp ', '').replace(',', ''));
            const quantity = parseInt(cartItem.querySelector('.item-quantity').textContent);
            newTotal += price * quantity;
        });
        totalAmount = newTotal;
        totalAmountElement.textContent = ` ${newTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            <span class="item-price"> ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
        orderNumberElement.textContent = `Order Number: ${generateOrderNumber()}`;
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

        modalTotalAmountElement.textContent = totalAmountElement.textContent;
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

    // Search functionality
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


    document.getElementById('confirm-pending-order').addEventListener('click', function () {
        alert('Order Confirmed');
        document.getElementById('pending-orders-modal').style.display = 'none';
    });

    document.getElementById('cancel-pending-order').addEventListener('click', function () {
        alert('Order Canceled');
        document.getElementById('pending-orders-modal').style.display = 'none';
    });

    document.getElementById('complete-accepted-order').addEventListener('click', function () {
        alert('Order Completed');
        document.getElementById('accepted-orders-modal').style.display = 'none';
    });
    


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
    });

    document.getElementById('nav-Order-num').addEventListener('click', () => {
        // Handle orders navigation
        document.getElementById('main-content').style.display = 'none';
        displayOrderDetails(); // Update order details
        document.getElementById('OrderNum-section').style.display = 'block';
        document.getElementById('statistics-section').style.display = 'none';
        document.getElementById('settings-section').style.display = 'none';
    });

    document.getElementById('nav-statistics').addEventListener('click', () => {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('OrderNum-section').style.display = 'none';
        document.getElementById('statistics-section').style.display = 'block';
        document.getElementById('settings-section').style.display = 'none';
    });

    document.getElementById('nav-settings').addEventListener('click', () => {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('OrderNum-section').style.display = 'none';
        document.getElementById('statistics-section').style.display = 'none';
        document.getElementById('settings-section').style.display = 'block';
    });

    // Function to display modal with order details
    function displayOrderModal(orderNumber) {
        const modal = document.getElementById('payment-modal');
        const closeButton = modal.querySelector('.close-button');

        // Here you would fetch order details from your backend based on the order number
        // For demonstration purposes, let's assume order details are hardcoded
        const orderDetails = {
            items: ['Item 1', 'Item 2', 'Item 3'],
            total: '$100'
        };

        // Populate modal with order details
        const orderNumberElement = modal.querySelector('.order-number');
        orderNumberElement.textContent = `Order Number: ${orderNumber}`;

        const orderDetailsElement = modal.querySelector('#order-details');
        orderDetailsElement.innerHTML = `
            <p><strong>Items:</strong> ${orderDetails.items.join(', ')}</p>
            <p><strong>Total:</strong> ${orderDetails.total}</p>
        `;

        // Display modal
        modal.style.display = 'block';

        // Event listener for closing the modal
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Event listener for clicking outside the modal to close it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Event listener for clicking on order numbers
    document.getElementById('#order-number').forEach(orderNumber => {
        orderNumber.addEventListener('click', () => {
            const clickedOrderNumber = orderNumber.textContent;
            displayOrderModal(clickedOrderNumber);
        });
    });

});