document.addEventListener('DOMContentLoaded', function() {
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    const removeButtons = document.querySelectorAll('.remove-btn');

    quantityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const quantityInput = this.parentElement.querySelector('.quantity-input');
            let currentValue = parseInt(quantityInput.value);

            if (action === 'increase') {
                currentValue++;
            } else if (action === 'decrease' && currentValue > 1) {
                currentValue--;
            }

            quantityInput.value = currentValue;

            updateTotal(this.closest('.cart-item'));
            updateSummary();
        });
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            cartItem.remove();
            updateSummary();
        });
    });

    function updateTotal(cartItem) {
        
        const quantityInput = cartItem.querySelector('.quantity-input');
        const pricePerItem = parseInt(cartItem.getAttribute('data-price'), 10);
        const quantityValue = parseInt(quantityInput.value, 10);

        if (isNaN(pricePerItem) || isNaN(quantityValue)) {
            console.error('Invalid price or quantity value');
            return;
        }

        const totalPrice = quantityValue * pricePerItem;
        const totalElement = cartItem.querySelector('.item-total');
        totalElement.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
    }

    function updateSummary() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        let totalItems = 0;
        let totalPrice = 0;

        quantityInputs.forEach(input => {
            const cartItem = input.closest('.cart-item');
            const pricePerItem = parseInt(cartItem.getAttribute('data-price'), 10);
            const quantityValue = parseInt(input.value, 10);

            if (isNaN(pricePerItem) || isNaN(quantityValue)) {
                console.error('Invalid price or quantity value');
                return;
            }
            
            totalItems += quantityValue;
            totalPrice += quantityValue * pricePerItem;
            
        });

        const summaryItemsElement = document.querySelector('.summary-item span:first-child');
        const summaryTotalElement = document.querySelector('.summary-item span:last-child');

        summaryItemsElement.textContent = `Total items(${totalItems} items)`;
        summaryTotalElement.textContent = `₱${totalPrice.toFixed(2)}`;
    }

    // Initial summary update
    updateSummary();
});
