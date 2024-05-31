document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.getElementById('total-amount');
    const billsSection = document.querySelector('.bills-section');
    let totalAmount = 0;

    // Hide the bills section initially
    billsSection.style.display = 'none';

    // Clear the cart and reset total amount function
    function clearCart() {
        cartItemsContainer.innerHTML = '';
        totalAmount = 0;
        totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
    }

    // Function to update total amount based on quantities
    function updateTotal() {
        let newTotal = 0;
        document.querySelectorAll('.cart-item').forEach(cartItem => {
            const price = parseInt(cartItem.querySelector('.item-price').textContent.replace('Rp ', '').replace('.', ''));
            const quantity = parseInt(cartItem.querySelector('.item-quantity').textContent);
            newTotal += price * quantity;
        });
        totalAmountElement.textContent = `Rp ${newTotal.toLocaleString()}`;
    }

    document.querySelectorAll('.categories button').forEach(button => {
        button.addEventListener('click', () => {
            // Clear the cart and reset total amount when switching categories
            clearCart();
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

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const foodItem = event.target.closest('.food-item');
            const foodName = foodItem.querySelector('h3').textContent;
            const foodPrice = parseInt(foodItem.querySelector('p').textContent.replace('Rp ', '').replace('.', ''));

            addToCart(foodName, foodPrice);
            // Show the bills section when an item is added to the cart
            billsSection.style.display = 'block';
        });
    });

    // Add event listeners for incrementing and decrementing quantities
    document.querySelectorAll('.increment-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const quantityElement = button.parentElement.querySelector('.item-quantity');
            const quantity = parseInt(quantityElement.textContent);
            quantityElement.textContent = quantity + 1;
            updateTotal();
        });
    });

    document.querySelectorAll('.decrement-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const quantityElement = button.parentElement.querySelector('.item-quantity');
            const quantity = parseInt(quantityElement.textContent);
            if (quantity > 1) {
                quantityElement.textContent = quantity - 1;
                updateTotal();
            } else {
                // Remove the item from the cart
                const cartItem = button.closest('.cart-item');
                const price = parseInt(cartItem.querySelector('.item-price').textContent.replace('Rp ', '').replace('.', ''));
                totalAmount -= price;
                totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
                cartItem.remove();
            }
        });
    });
    
    

    function addToCart(name, price) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="quantity-container">
                <button class="decrement-quantity">-</button>
                <span class="item-quantity">1</span>
                <button class="increment-quantity">+</button>
            </div>
            <span class="item-name">${name}</span>
            <span class="item-price">Rp ${price.toLocaleString()}</span>
        `;
        
        cartItemsContainer.appendChild(cartItem);
        totalAmount += price;
        totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
    }
});
