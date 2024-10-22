document.addEventListener('DOMContentLoaded', async function () {
    const allMenuContainer = document.getElementById('AllMenuContainer');

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
    
    /* --------------------    Search functionality     --------------------*/
    const searchInput = document.querySelector('.search-right input');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
    
        document.querySelectorAll('.menu-item').forEach(item => {
            const foodName = item.querySelector('h2').textContent.toLowerCase();
            if (foodName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    async function generateAllItems() {
        const allItems = await fetchAllItems();

        allMenuContainer.innerHTML = '';

        allItems.forEach(item => {
            const allItem = document.createElement('div');
            allItem.className = "menu-item";
            
            if (item.food_name) {
                allItem.setAttribute('data-category', 'Meals');
            } else if (item.drink_name) {
                allItem.setAttribute('data-category', 'Drinks');
            }
            
            const allItemImage = document.createElement('img');
            if (item.food_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.food_image;
            } else if (item.drink_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.drink_image;
            } else {
                allItemImage.src = '/Kape_Cinco/frontend/images/kape_cinco.jpg';
            }
            allItemImage.className = 'all-item-image';
            
            const allItemInfo = document.createElement('div');
            allItemInfo.className = "menu-info";
            
            //----------------------- MENU-INFO CONTAINER --------------------------//
            const allItemName = document.createElement('h2');
            if (item.food_name) {
                allItemName.textContent = item.food_name;
                allItemInfo.appendChild(allItemName);
            } else if (item.drink_name) {
                allItemName.textContent = item.drink_name;
                allItemInfo.appendChild(allItemName);
            }

            const allItemPrice = document.createElement('span');
            allItemPrice.className = "price"; 
            if (item.food_price) {
                allItemPrice.textContent = item.food_price;
                allItemInfo.appendChild(allItemPrice);
            } else if (item.drink_price) {
                allItemPrice.textContent = item.drink_price;
                allItemInfo.appendChild(allItemPrice);
            }
            
            if (item.food_desc) {
                const foodDesc = document.createElement('p');
                foodDesc.textContent = item.food_desc;
                allItemInfo.appendChild(foodDesc);
            }

            const viewButton = document.createElement('button');
            viewButton.className = 'view-button';
            viewButton.textContent = 'View'; 
    
            if (item.food_status === 'Unavailable' || item.drink_status === 'Unavailable') {
                allItemImage.style.opacity = '0.5';
                viewButton.style.opacity = '0.7';
                viewButton.textContent = 'Unavailable';
                viewButton.disabled = true;
                allItem.style.cursor = 'not-allowed';
                viewButton.style.cursor = 'not-allowed';
            } else {
                allItem.addEventListener('click', () => {
                    const orderitems = {
                        image: item.food_image || item.drink_image || 'default_image',
                        name: item.food_name || item.drink_name,
                        desc: item.food_desc || '',
                        serving: item.food_serve_count || item.drink_serve_count,
                        price: item.food_price || item.drink_price,
                        variants: item.variants || []
                    };
                    setItemDetails(orderitems);
                });
            }

            allItem.appendChild(allItemImage);
            allItem.appendChild(allItemInfo);
            allItem.appendChild(viewButton);
    
            allMenuContainer.appendChild(allItem);
        });
        //localStorage.removeItem('cart');
    }

    function setItemDetails(orderitems) {
        localStorage.setItem('itemDetails', JSON.stringify(orderitems));
        window.location.href = '/Kape_Cinco/frontend/Menu/view.html';
    }

    generateAllItems();

    //------------------------ END OF GENERATE ALL ITEMS ------------------------------//

    document.querySelectorAll('.category-nav button').forEach(button => {
        button.addEventListener('click', () => {

            document.querySelectorAll('.category-nav button').forEach(btn => {
                btn.classList.remove('active');
            });

            button.classList.add('active');

            const category = button.textContent.trim();
            if (category === 'All') {
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.menu-item').forEach(item => {
                    if (item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });

    //--------------------- END OF CATEGORY BUTTONS ----------------------//
    
    function updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const summaryContainer = document.querySelector('.summary');
    
        cartItemsContainer.innerHTML = '';
        summaryContainer.innerHTML = '';
    
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="summary-item">
                    <span>Food Cart is Empty</span>
                </div>
            `;
            return;
        }
    
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.setAttribute('data-index', index); // Unique identifier
    
            let imagePath = item.image === 'default_image' || !item.image 
                            ? '/Kape_Cinco/frontend/images/kape_cinco.jpg' 
                            : `/Kape_Cinco/backend/images/${item.image}`;
    
            cartItem.innerHTML = `
                <div class="card-image-left">
                    <img src="${imagePath}" alt="${item.name}" id="foodID">
                </div>
                <div class="item-details-right">
                    <div class="top-text">
                        <h2>${item.name}</h2>
                        <button class="remove-btn" data-index="${index}">Remove</button>
                    </div>
                    <p>${item.desc}</p>
                    <div class="Lower-text">
                        <div class="quantity-control">
                            <button class="quantity-btn" id="decrement-quantity-${index}" data-action="decrease" data-index="${index}"><span class="material-icons-sharp">remove</span></button>
                            <input type="number" id="item-quantity-${index}" value="${item.quantity}" class="quantity-input" readonly>
                            <button class="quantity-btn" id="increment-quantity-${index}" data-action="increase" data-index="${index}"><span class="material-icons-sharp">add</span></button>
                        </div>
                        <div class="item-total">Total: ₱${item.total.toFixed(2)}</div>
                    </div>
                </div>
            `;
    
            cartItemsContainer.appendChild(cartItem);
        });
    
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <span>Total items(items)</span>
                <span>₱0.00</span>
            </div>
            <div class="summary-item">
                <span>Delivery Fee</span>
                <span>₱0.00</span>
            </div>
            <div class="summary-item">
                <span>Discount</span>
                <span>₱0.00</span>
            </div>
            <button class="complete-order-btn">Review Order</button>
        `;
    
        document.querySelector('.complete-order-btn').addEventListener('click', function() {
            window.location.href = '/Kape_Cinco/frontend/Menu/review.html';
        });
    
        addEventListenersToCartItems();
        updateSummary();
    }

    function addEventListenersToCartItems() {
        const quantityButtons = document.querySelectorAll('.quantity-btn');
        const removeButtons = document.querySelectorAll('.remove-btn'); // Add remove buttons
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
        quantityButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();

                const action = this.getAttribute('data-action');
                const index = parseInt(this.getAttribute('data-index')); // Get the correct index
                const quantityElement = document.getElementById(`item-quantity-${index}`);
                let currentValue = parseInt(quantityElement.value);
    
                const serveCount = cart[index].serving; // Access the correct item's serving count
    
                if (action === 'increase') {
                    if (!serveCount || currentValue < serveCount) {
                        quantityElement.value = currentValue + 1;
                        updateButtonStates(index, serveCount);
                    } else {
                        updateButtonStates(index, serveCount);
                    }
                } else if (action === 'decrease' && currentValue > 1) {
                    quantityElement.value = currentValue - 1;
                    updateButtonStates(index, serveCount);
                }
    
                // Update cart item quantity and total price
                cart[index].quantity = parseInt(quantityElement.value);
                cart[index].total = cart[index].price * cart[index].quantity;
    
                // Save updated cart to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                updateCartDisplay();
                updateSummary();
            });
        });
    
        removeButtons.forEach(button => { 
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeCartItem(index); 
                updateCartDisplay(); 
            });
        });
    }

    function removeCartItem(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
        cart.splice(index, 1);
    
        localStorage.setItem('cart', JSON.stringify(cart));
    
        if (cart.length === 0) {
            const cartItemsContainer = document.querySelector('.cart-items');
            const summaryContainer = document.querySelector('.summary');
    
            cartItemsContainer.innerHTML = `
                <div class="summary-item">
                    <span>Food Cart is Empty</span>
                </div>
            `;
            summaryContainer.innerHTML = '';
        }
    }
    
    function updateSummary() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = 0;
        let totalPrice = 0;
    
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });
    
        const summaryItemsElement = document.querySelector('.summary-item span:first-child');
        const summaryTotalElement = document.querySelector('.summary-item span:last-child');
    
        summaryItemsElement.textContent = `Total items(${totalItems} items)`;
        summaryTotalElement.textContent = `₱${totalPrice.toFixed(2)}`;
    }

    function showCartModal() {
        updateCartDisplay();
        const modal = document.getElementById('myModal');
        modal.style.display = 'block';
    }

    function closeCartModal() {
        const modal = document.getElementById('myModal');
        modal.style.display = 'none';
    }

    function updateButtonStates(index, serveCount) {
        const quantityElement = document.getElementById(`item-quantity-${index}`);
        const quantity = parseInt(quantityElement.value);
        const maxServeCount = parseInt(serveCount);
    
        const incrementButton = document.getElementById(`increment-quantity-${index}`);
        const decrementButton = document.getElementById(`decrement-quantity-${index}`);
    
        const toggleButtonState = (button, isDisabled) => {
            button.disabled = isDisabled;
            button.classList.toggle('disabled', isDisabled);
            console.log(button.classList);
        };
    
        toggleButtonState(incrementButton, maxServeCount && quantity >= maxServeCount);
        toggleButtonState(decrementButton, quantity <= 1);
    }
    

    document.querySelector('.material-icons-sharp').addEventListener('click', showCartModal);
    document.querySelector('.close').addEventListener('click', closeCartModal);

    updateCartDisplay();

    // --------------------- END OF FOOD CART FUNCTIONS ---------------- //

});


//------------------------ START OF MODAL ------------------------------//
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var openModalButton = document.querySelector(".top-header-right .material-icons-sharp");

// Get the <span> element that closes the modal
var closeModalButton = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
openModalButton.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeModalButton.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}