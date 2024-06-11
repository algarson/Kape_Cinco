document.addEventListener('DOMContentLoaded', async function () {
    async function fetchItemDetails() {
        const params = new URLSearchParams(window.location.search);
        const item = {
            image: params.get('image'),
            name: params.get('name'),
            desc: params.get('desc'),
            price: params.get('price')
        };

        if (!item.name || !item.price) {
            redirectToMenu();
            return null;
        }

        return item;
    }

    function goBack() {
        window.history.back();
    }

    function redirectToMenu() {
        window.location.href = '/Kape_Cinco/frontend/Menu/menu.html';
    }

    function displayItemDetails(item) {
        let imagePath;
        
        if (item.image === 'default_image') {
            imagePath = '/Kape_Cinco/frontend/images/kape_cinco.jpg';
        } else {
            imagePath = `/Kape_Cinco/backend/images/${item.image}`;
        }

        const itemImage = document.getElementById('item-image');
        itemImage.src = imagePath;
        itemImage.addEventListener('load', () => {
            document.getElementById('item-name').textContent = item.name;
            document.getElementById('item-desc').textContent = item.desc;
            document.getElementById('item-total').textContent = `Total: ₱${item.price}`;
            document.getElementById('add-order-button').textContent = 'Add to order';
            document.body.classList.remove('hidden');
        });

    }

    function decreaseQuantity() {
        const quantityElement = document.getElementById('item-quantity');
        let quantity = parseInt(quantityElement.textContent);
        if (quantity > 1) {
            quantity--;
            quantityElement.textContent = quantity;
            updateTotal();
        }
    }

    function increaseQuantity() {
        const quantityElement = document.getElementById('item-quantity');
        let quantity = parseInt(quantityElement.textContent);
        quantity++;
        quantityElement.textContent = quantity;
        updateTotal();
    }

    function updateTotal() {
        const params = new URLSearchParams(window.location.search);
        const price = parseFloat(params.get('price'));
        const quantity = parseInt(document.getElementById('item-quantity').textContent);
        const total = quantity * price;
        document.getElementById('item-total').textContent = `Total: ₱${total.toFixed(2)}`;
    }

    function addToOrder() {
        const params = new URLSearchParams(window.location.search);
        const item = {
            image: params.get('image'),
            name: params.get('name'),
            desc: params.get('desc'),
            price: parseFloat(params.get('price')),
            quantity: parseInt(document.getElementById('item-quantity').textContent),
            total: parseFloat(params.get('price')) * parseInt(document.getElementById('item-quantity').textContent)
        };
    
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
    
        alert('Item added to order');
        redirectToMenu();
    }

    window.goBack = goBack;
    window.decreaseQuantity = decreaseQuantity;
    window.increaseQuantity = increaseQuantity;
    window.addToOrder = addToOrder;

    const item = await fetchItemDetails();
    if (item) {
        displayItemDetails(item);
    }
});

