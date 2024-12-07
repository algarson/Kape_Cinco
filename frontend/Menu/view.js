
function goBack() {
    window.history.back();
}

function redirectToMenu() {
    window.location.href = '/frontend/Menu/menu.html';
}

document.addEventListener('DOMContentLoaded', async function () {
    async function fetchItemDetails() {
        const item = JSON.parse(localStorage.getItem('itemDetails'));

        if (!item || !item.name || !item.price) {
            redirectToMenu();
            return null;
        }
        
        return item;
    }

    function displayItemDetails(item) {
        let imagePath;
    
        if (item.image === 'default_image') {
            imagePath = '/frontend/images/kape_cinco.jpg';
        } else {
            imagePath = `/backend/images/${item.image}`;
        }
        
        const itemDetailsContainer = document.getElementById('item-details');
        itemDetailsContainer.classList.add('hidden');

        const itemImage = document.getElementById('item-image');
        itemImage.src = imagePath;
        
        const itemDesc = document.getElementById('item-desc');
        itemDesc.textContent = item.desc;

        const itemNameElement = document.getElementById('item-name');
        const itemQuantity = document.getElementById('item-quantity');
        const itemTotalElement = document.getElementById('item-total');
        itemTotalElement.textContent = `Total: ₱${parseFloat(item.price).toFixed(2)}`;

        const serveCount = item.serving;
        updateButtonStates(serveCount);
        //console.log(serveCount);
        
        if (item.variants && item.variants.length > 0) {
            const variantSelect = document.createElement('select');
            variantSelect.className = 'variant-select';
    
            const originalOption = document.createElement('option');
            originalOption.value = '';
            originalOption.textContent = `${item.name}`;
            originalOption.dataset.price = item.price;
            variantSelect.appendChild(originalOption);

            item.variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = JSON.stringify(variant); 
                option.textContent = `${variant.variant_name}`;
                option.dataset.price = variant.variant_price;
    
                if (variant.variant_status === "Unavailable") {
                    option.disabled = true; 
                    option.textContent += ' (Unavailable)'; 
                }
    
                variantSelect.appendChild(option);
            });
    
            itemNameElement.innerHTML = ''; 
            itemNameElement.appendChild(variantSelect);
            
            variantSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
    
                if (!selectedOption.value) {
                    itemTotalElement.textContent = `Total: ₱${parseFloat(item.price).toFixed(2)}`;
                    itemQuantity.textContent = '1';
                    updateButtonStates(serveCount);
                } else {
                    const variant = JSON.parse(selectedOption.value);
                    itemTotalElement.textContent = `Total: ₱${parseFloat(variant.variant_price).toFixed(2)}`;
                    itemQuantity.textContent = '1';
                    updateButtonStates(variant.variant_serve_count);
                }
            });
        } else {
            itemNameElement.textContent = item.name;
            itemTotalElement.textContent = `Total: ₱${item.price}`;
        }
    
        document.getElementById('add-order-button').textContent = 'Add to order';
        itemImage.addEventListener('load', () => {
            itemDetailsContainer.classList.remove('hidden'); 
        });

        itemImage.addEventListener('error', () => {
            itemDetailsContainer.classList.remove('hidden'); 
        });

        document.body.classList.remove('hidden');
    }

    function getSelectedVariantAndServeCount() {
        const variantSelect = document.getElementById('item-name').querySelector('.variant-select');
        let serveCount = item.serving; 
        let selectedVariant = null;

        if (variantSelect && variantSelect.value) {
            selectedVariant = JSON.parse(variantSelect.value);
            serveCount = selectedVariant.variant_serve_count;
        }
    
        return { selectedVariant, serveCount };
    }

    function decreaseQuantity() {
        const { selectedVariant, serveCount } = getSelectedVariantAndServeCount();
        
        const quantityElement = document.getElementById('item-quantity');
        let quantity = parseInt(quantityElement.textContent);
        if (quantity > 1) {
            quantityElement.textContent = quantity - 1;
            updateTotal();
            updateButtonStates(serveCount);
        } 
    }

    function increaseQuantity() {
        const { selectedVariant, serveCount } = getSelectedVariantAndServeCount();

        const quantityElement = document.getElementById('item-quantity');
        let quantity = parseInt(quantityElement.textContent);
        if (!serveCount || quantity < serveCount) {
            quantityElement.textContent = quantity + 1;
            updateTotal();
            updateButtonStates(serveCount);
        } else {
            updateButtonStates(serveCount);
        }
    }

    function updateButtonStates(serveCount) {
        const quantityElement = document.getElementById('item-quantity');
        const quantity = parseInt(quantityElement.textContent);
        const maxServeCount = parseInt(serveCount);
    
        const incrementButton = document.getElementById('increment-quantity');
        const decrementButton = document.getElementById('decrement-quantity');
    
        const toggleButtonState = (button, isDisabled) => {
            button.disabled = isDisabled;
            button.classList.toggle('disabled', isDisabled);
            console.log(button.classList);
        };
    
        toggleButtonState(incrementButton, maxServeCount && quantity >= maxServeCount);
        toggleButtonState(decrementButton, quantity <= 1);
    }
    
    function updateTotal() {
        const item = JSON.parse(localStorage.getItem('itemDetails'));
        const price = item.price;
        const quantity = parseInt(document.getElementById('item-quantity').textContent);
        const total = quantity * price;
        document.getElementById('item-total').textContent = `Total: ₱${total.toFixed(2)}`;
    }
    
    function addToOrder() {
        const item = JSON.parse(localStorage.getItem('itemDetails'));
        
        const { selectedVariant, serveCount } = getSelectedVariantAndServeCount();
    
        const cartItem = {
            image: item.image,
            name: selectedVariant ? `${selectedVariant.variant_name}` : item.name,
            desc: item.desc,
            price: selectedVariant ? parseFloat(selectedVariant.variant_price) : parseFloat(item.price),
            quantity: parseInt(document.getElementById('item-quantity').textContent),
            total: selectedVariant 
                ? parseFloat(selectedVariant.variant_price) * parseInt(document.getElementById('item-quantity').textContent)
                : parseFloat(item.price) * parseInt(document.getElementById('item-quantity').textContent),
            serving: serveCount
        };
    
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(cartCartItem => cartCartItem.name === cartItem.name);
    
        if (existingItemIndex !== -1) { 
            
            cart[existingItemIndex].quantity += cartItem.quantity;
            cart[existingItemIndex].total += cartItem.total;
            if (cart[existingItemIndex].quantity > serveCount) {
                alert(`You have reached maximum limit for ${cart[existingItemIndex].name} 
                    \n Order limit: ${serveCount} 
                    \n Your current order: ${cart[existingItemIndex].quantity}`);
            } else {
                alert('Quantity added to food cart');
                localStorage.setItem('cart', JSON.stringify(cart));
                localStorage.removeItem('itemDetails');
                redirectToMenu();
            }
        } else {
            cart.push(cartItem);
            alert('Item added to food cart');
            
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.removeItem('itemDetails');
            redirectToMenu();
        }
    }

    const item = await fetchItemDetails();
    if (item) {
        displayItemDetails(item);
    }

    window.goBack = goBack;
    window.decreaseQuantity = decreaseQuantity;
    window.increaseQuantity = increaseQuantity;
    window.addToOrder = addToOrder;
});

