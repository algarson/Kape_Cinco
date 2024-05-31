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

    function addToCart(name, price) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `<span>${name}</span><span>Rp ${price.toLocaleString()}</span>`;
        
        cartItemsContainer.appendChild(cartItem);
        totalAmount += price;
        totalAmountElement.textContent = `Rp ${totalAmount.toLocaleString()}`;
    }
});
