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

            updateTotal(this.parentElement.parentElement);
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
        const pricePerItem = parseInt(cartItem.getAttribute('data-price'));
        const totalElement = cartItem.querySelector('.item-total');
        const totalPrice = parseInt(quantityInput.value) * pricePerItem;
        totalElement.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
    }

    function updateSummary() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        let totalItems = 0;
        let totalPrice = 0;

        quantityInputs.forEach(input => {
            const cartItem = input.closest('.cart-item');
            const pricePerItem = parseInt(cartItem.getAttribute('data-price'));
            totalItems += parseInt(input.value);
            totalPrice += parseInt(input.value) * pricePerItem;
        });

        document.querySelector('.summary-item:nth-child(1) span:nth-child(2)').textContent = `Total items(${totalItems} items)`;
        document.querySelector('.summary-item:nth-child(1) span:nth-child(1)').textContent = `₱${totalPrice.toFixed(2)}`;
    }

    // Initial summary update
    updateSummary();
});
