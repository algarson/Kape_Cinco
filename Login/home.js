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
                <div class="quantity-container">
                    <button class="decrement-quantity">-</button>
                    <span class="item-quantity">1</span>
                    <button class="increment-quantity">+</button> 
                </div>
                <span class="item-name">${name}</span>
                <span class="item-price">Rp ${price.toLocaleString()}</span>
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
                    totalAmount -= price;
                    totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
                    cartItem.remove();
                }
            });
    
            cartItemsContainer.appendChild(cartItem);
        }
    
        // Update total amount
        totalAmount += price;
        totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
    }
    

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

 
});
 