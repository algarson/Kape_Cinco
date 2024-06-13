document.addEventListener("DOMContentLoaded", async function (){

    const tableBody = document.getElementById('tableBody');
    const categoryButtons = document.querySelectorAll('.category-nav button');
    const updateModal = document.getElementById('updateModal');
    const addModal = document.getElementById('addModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeButton = document.querySelector('.close-button');
    const yesButton = document.querySelector('.yes-button');
    const noButton = document.querySelector('.no-button');
    const addButton = document.querySelector('.add-button'); // Add button
    
    
    updateModal.style.display = 'none';
    addButton.addEventListener('click', openAddModal);
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

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            filterItems(category);
        });
    });
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            filterItems(category);
        });
    });

    

    function createTableRow(item) {
        const row = document.createElement('tr');
        
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.food_name ? 'Silog' : 'Drinks';
        row.appendChild(categoryCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.food_name || item.drink_name;
        row.appendChild(nameCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = item.drink_type || '';
        typeCell.classList.add('drink-type-cell');
        row.appendChild(typeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = item.food_price || item.drink_price;
        row.appendChild(priceCell);

        const descCell = document.createElement('td');
        descCell.textContent = item.food_desc || '';
        row.appendChild(descCell);

        const imageCell = document.createElement('td');
        const image = document.createElement('img') ;
        image.className = "image_item";
        image.src = item.food_image 
                    ? `/Kape_Cinco/backend/images/${item.food_image}`
                    : item.drink_image
                    ? `/Kape_Cinco/backend/images/${item.drink_image}`
                    : '/Kape_Cinco/frontend/images/kape_cinco.jpg';
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = item.food_status || item.drink_status;
        row.appendChild(statusCell);

        const updateCell = document.createElement('td');
        const updateButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        deleteButton.className = "deletebtn"
        deleteButton.textContent = 'Delete';       
        updateButton.className = "updatebtn"
        updateButton.textContent = 'Update';
        deleteButton.addEventListener('click', () => openDeleteModal(item));
        updateCell.appendChild(deleteButton);
        row.appendChild(updateCell);
        updateButton.addEventListener('click', () => openUpdateModal(item));
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);
        

        row.setAttribute('data-category', item.food_name ? 'Foods' : 'Drinks');
        return row;
    }

    async function generateAllItems() {
        const allItems = await fetchAllItems();
        tableBody.innerHTML = '';

        allItems.forEach(item => {
            const row = createTableRow(item);
            tableBody.appendChild(row);
        });

        filterItems('Foods');  
    }

    function filterItems(category) {
        const descriptionHeader = document.querySelector('.description-header');
        const drinkTypeHeader = document.querySelector('.drinktype-header');

        document.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.cells;
            const itemCategory = row.getAttribute('data-category');

            if (category === 'Drinks') {
                drinkTypeHeader.style.display = '';
                descriptionHeader.style.display = 'none';
                cells[4].style.display = 'none'; 
                cells[2].style.display = '';     

                row.style.display = itemCategory === 'Drinks' ? '' : 'none';
            } else {
                drinkTypeHeader.style.display = 'none';
                descriptionHeader.style.display = '';
                cells[2].style.display = 'none'; 
                cells[4].style.display = '';     

                row.style.display = itemCategory === 'Foods' ? '' : 'none';
            }
        });
    }

    fetch('/Kape_Cinco/backend/Login/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/Kape_Cinco/frontend/Login/login.html';
            } else {
                document.body.classList.remove('hidden');
                generateAllItems();
            }
        })
        .catch(error => console.error('Error:', error));
    
    
    function logout() {
    fetch('/Kape_Cinco/backend/Login/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/Kape_Cinco/frontend/Login/login.html';
            } else {
                alert('Logout failed!');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    window.logout = logout;

    //----------------------------- END OF DISPLAY ITEMS ------------------------ //

    function openUpdateModal(item) {
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';
        updateModal.style.display = 'block';
    }


    function openAddModal() {   
        addModal.style.display = 'block';
    }

    function openDeleteModal(item) {
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';
        deleteModal.style.display = 'block';

        yesButton.onclick = async () => {
            try {
                const response = await fetch('/Kape_Cinco/backend/Admin/delete_item.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: item.food_id || item.drink_id,
                        type: item.food_id ? 'food' : 'drink'
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success) {
                    alert('Item deleted successfully');
                    deleteModal.style.display = 'none';
                    await generateAllItems();
                } else {
                    alert('Delete failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the item.');
            }
        };
    }
    
    closeButton.addEventListener('click', function() {
        updateModal.style.display = 'none';
    });

    closeButton.addEventListener('click', function() {
        addModal.style.display = 'none';
    });

    closeButton.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });
    

    noButton.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });

    document.getElementById('updateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        console.log('Form submitted');
        // Log form data key-value pairs
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const response = await fetch('/Kape_Cinco/backend/Admin/update_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Item updated successfully');
                updateModal.style.display = 'none';
                await generateAllItems(); 
            } else {
                alert('Update failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the item.');
        }
        
        document.getElementById('addForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            console.log('Add Form submitted');
            for (const pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
    
            try {
                const response = await fetch('/Kape_Cinco/backend/Admin/add_item.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('Item added successfully');
                    addModal.style.display = 'none';
                    await generateAllItems();
                } else {
                    alert('Add failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while adding the item.');
            }
        });
    
        // Event listener for the "Add" button to open the addModal
        
    });
});