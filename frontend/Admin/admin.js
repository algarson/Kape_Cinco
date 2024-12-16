document.addEventListener("DOMContentLoaded", async function () {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const logsTableBody = document.getElementById('logsTableBody');
    const usersTableBody = document.getElementById('usersTableBody');

    const categoryButtons = document.querySelectorAll('.category-nav button');
    const updateModal = document.getElementById('updateModal');
    const addModal = document.getElementById('addModal');
    const deleteModal = document.getElementById('deleteModal');
    const addVariantModal = document.getElementById('addVariantModal');
    const deleteUserModal = document.getElementById('deleteUserModal');
    
    const addUserModalElement = document.getElementById('addUserModal');
    const updateUserModal = document.getElementById('updateUserModal');

    const closeButton = document.querySelector('.close-button');
    const inventoryLink = document.getElementById('inventoryLink');
    const statisticsLink = document.getElementById('statisticsLink');
    const logsLink = document.getElementById('logsLink');
    const usersLink = document.getElementById('usersLink');
    const mainContent = document.getElementById('mainContent');
    const inventorySection = document.getElementById('inventorySection');
    const statisticsSection = document.getElementById('statisticsSection');
    const logSection = document.getElementById('logSection');
    const usersSection = document.getElementById('usersSection');
    const statisticsChartElement = document.getElementById('statisticsChart').getContext('2d');

    let statisticsChart; // Variable to hold the chart instance
    const yesButton = document.querySelector('.yes-button');
    const noButton = document.querySelector('.no-button');
    const addButton = document.querySelector('.add-button'); // Add but
    
    const userYesButton = document.getElementById('userYesButton');
    const userNoButton = document.getElementById('userNoButton');
    const openModalButton = document.querySelector('.addusers-button'); 

    fetch(`/backend/Login/check_login.php`)
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                alert('Access denied: You do not have permission to view this content.');
                window.location.href = `/frontend/Login/login.html?redirect=Login/admin.php`;
            } else if (data.role !== 'Admin') {
                alert('Access denied: Only admins can access this page.');
                window.location.href = `/frontend/Home/home.html`;
            } else {
                document.body.classList.remove('hidden');
                generateAllItems();
                generateAllLogs();
                generateAllUsers();
            }
        })
    .catch(error => console.error('Error:', error));
    
    function formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);

        // Format date as MM/DD/YYYY
        const formattedDate = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });

        // Format time as HH:MM AM/PM
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        return { formattedDate, formattedTime };
    }

    function logout() {
        fetch(`/backend/Login/logout.php`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/frontend/Login/login.html`;
                } else {
                    alert('Logout failed!');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    window.logout = logout;
    
    updateModal.style.display = 'none';

    async function fetchAllItems() {
        try {
            const res = await fetch(`/backend/Home/allitems.php`);

            if (res.status === 403) {
                alert('Access denied: You do not have permission to view this content.');
                window.location.href = `/frontend/Login/login.html?redirect=Login/admin.php`; 
                return []; 
            }
    
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return []; 
        }
    }

    async function fetchAllLogs() {
        try {
            const res = await fetch(`/backend/Admin/logs.php`);

            if (res.status === 403) {
                alert('Access denied: You do not have permission to view this content.');
                window.location.href = `/frontend/Login/login.html?redirect=Login/admin.php`; 
                return []; 
            }
    
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return []; 
        }
    }

    async function fetchAllUsers() {
        try {
            const res = await fetch(`/backend/Admin/users.php`);

            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }
    
    async function generateAllItems() {
        const allItems = await fetchAllItems();
        inventoryTableBody.innerHTML = '';

        allItems.forEach(item => {
            const row = createInventoryTableRow(item);
            inventoryTableBody.appendChild(row);
        });

        filterItems('Foods');  
    }

    // --------------------- GENERATE DATA --------------------- //
    async function generateAllLogs() {
        const allLogs = await fetchAllLogs();
        logsTableBody.innerHTML = '';

        allLogs.forEach(item => {
            const row = createLogsTableRow(item);
            logsTableBody.appendChild(row);
        });
    }

    async function generateAllUsers() {
        const allUsers = await fetchAllUsers();
        usersTableBody.innerHTML = '';

        allUsers.forEach(item => {
            const row = createUsersTableRow(item);
            usersTableBody.appendChild(row);
        });
    }

    function filterItems(category) {
        const descriptionHeader = document.querySelector('.description-header');
        const drinkTypeHeader = document.querySelector('.drinktype-header');

        document.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.cells;
            const itemCategory = row.getAttribute('data-category');

            // Check if the row has enough cells
            if (!cells[2] || !cells[4]) {
                // Skip rows that don't have the required cells
                return;
            }

            if (category === 'Drinks') {
                drinkTypeHeader.style.display = '';
                descriptionHeader.style.display = 'none';
                cells[4].style.display = 'none'; 
                cells[2].style.display = '';     

                row.style.display = itemCategory === 'Drinks' ? '' : 'none';
            } else {
                descriptionHeader.style.display = '';
                cells[4].style.display = '';     

                row.style.display = itemCategory === 'Foods' ? '' : 'none';
            }
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            filterItems(category);
        });
    });

    function createInventoryTableRow(item) {
        const row = document.createElement('tr');

        // Category cell: either 'Silog' or 'Drinks'
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.food_name ? 'Foods' : 'Drinks';
        row.appendChild(categoryCell);

        // Name cell: either variant dropdown or the default food/drink name
        const nameCell = document.createElement('td');

        if (item.variants && item.variants.length > 0) {
            // Create a dropdown if the item has variants
            const variantSelect = document.createElement('select');
            variantSelect.className = 'variant-select';

            const originalName = item.food_name || item.drink_name;
            const originalPrice = item.food_price || item.drink_price;
            const originalServeCount = item.food_serve_count || item.drink_serve_count;
            
            // Default option with the original food/drink name and price
            const originalOption = document.createElement('option');
            originalOption.value = '';
            originalOption.textContent = originalName;
            originalOption.dataset.price = originalPrice;
            originalOption.dataset.serveCount = originalServeCount;
            variantSelect.appendChild(originalOption);

            // Loop through variants and add them as options
            item.variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.variant_name;
                option.textContent = `${variant.variant_name}`;
                option.dataset.price = variant.variant_price;
                option.dataset.serveCount = variant.variant_serve_count;
                
                // If the variant is unavailable, disable the option
                if (variant.variant_status === "Unavailable") {
                    option.disabled = true;
                    option.textContent += ' (Unavailable)';
                }

                variantSelect.appendChild(option);
            });

            // Add an event listener to update the price when the variant is selected
            variantSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                const variantPrice = selectedOption.dataset.price || (item.food_price || item.drink_price);
                const variantServeCount = selectedOption.dataset.serveCount || (item.food_serve_count || item.drink_serve_count);
                serveCell.textContent = variantServeCount;
                priceCell.textContent = `₱${parseFloat(variantPrice)}`;
            });

            nameCell.appendChild(variantSelect); // Add the variant dropdown to the nameCell
        } else {
            // If no variants, just display the default name
            nameCell.textContent = item.food_name || item.drink_name;
        }

        row.appendChild(nameCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = item.food_type || item.drink_type;
        row.appendChild(typeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `₱${(item.food_price || item.drink_price)}`;
        row.appendChild(priceCell);

        const descCell = document.createElement('td');
        descCell.textContent = item.food_desc || '';
        row.appendChild(descCell);

        const serveCell = document.createElement('td');
        serveCell.textContent = item.food_serve_count || item.drink_serve_count;
        row.appendChild(serveCell);

        const imageCell = document.createElement('td');
        const image = document.createElement('img') ;
        image.className = "image_item";
        image.src = item.food_image 
                    ? `/backend/images/${item.food_image}`
                    : item.drink_image
                    ? `/backend/images/${item.drink_image}`
                    : '/frontend/images/kape_cinco.jpg';
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = item.food_status || item.drink_status;
        row.appendChild(statusCell);

        const updateCell = document.createElement('td');
        const updateButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const addVariantButton = document.createElement('button');
        deleteButton.className = "deletebtn"
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        updateButton.className = "updatebtn"
        updateButton.innerHTML = '<i class="fas fa-edit"></i> ';
        addVariantButton.className = "addVariantbtn"
        addVariantButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';

        deleteButton.addEventListener('click', () => openDeleteModal(item));
        updateCell.appendChild(deleteButton);
        row.appendChild(updateCell);
        updateButton.addEventListener('click', () => openUpdateModal(item));
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);
        addVariantButton.addEventListener('click', () => openAddVariantModal(item));
        updateCell.appendChild(addVariantButton);
        row.appendChild(updateCell);
        
        row.setAttribute('data-category', item.food_name ? 'Foods' : 'Drinks');
        return row;
    }
    
    function createLogsTableRow(item) {
        const row = document.createElement('tr');
    
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = `${item.user_firstname} ${item.user_lastname}`;
        row.appendChild(nameCell);
    
        // Extract formatted date and time
        const timeInFormatted = formatDateTime(item.time_in);
        const timeOutFormatted = formatDateTime(item.time_out);
    
        // Date cell (from time_in)
        const dateCell = document.createElement('td');
        dateCell.textContent = timeInFormatted.formattedDate;
        row.appendChild(dateCell);
    
        // Time In cell
        const timeInCell = document.createElement('td');
        timeInCell.textContent = timeInFormatted.formattedTime;
        row.appendChild(timeInCell);
    
        // Time Out cell
        const timeOutCell = document.createElement('td');
        if (item.time_out) {
            const timeOutFormatted = formatDateTime(item.time_out);
            timeOutCell.textContent = timeOutFormatted.formattedTime;
        } else {
            timeOutCell.textContent = "Currently Working"; 
        }
        row.appendChild(timeOutCell);
    
        // Total Shift cell
        const totalShiftCell = document.createElement('td');
        totalShiftCell.textContent = item.total_shift_duration; 
        row.appendChild(totalShiftCell);
    
        return row;
    }

    function createUsersTableRow(item) {
        const row = document.createElement('tr');
    
        // Name cell
        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = item.user_firstname;
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = item.user_lastname;
        row.appendChild(lastNameCell);
    
        // Time In cell
        const roleCell = document.createElement('td');
        roleCell.textContent = item.user_role;
        row.appendChild(roleCell);
    
        const imageCell = document.createElement('td');
        const image = document.createElement('img') ;
        image.className = "image_item";
        image.src = item.user_image
                    ? `/backend/User/${item.user_image}`
                    : '/frontend/images/kape_cinco.jpg';
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        const updateCell = document.createElement('td');
        const updateButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        deleteButton.className = "deletebtn"
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        updateButton.className = "updatebtn"
        updateButton.innerHTML = '<i class="fas fa-edit"></i> ';

        deleteButton.addEventListener('click', () => openDeleteUserModal(item));
        updateCell.appendChild(deleteButton);
        row.appendChild(updateCell);
        updateButton.addEventListener('click', () => openUpdateUserModal(item));
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);
    
        return row;
    }

    // ------------------------------ OPEN MODAL FUNCTIONS ----------------------------- //
   
    // function to open add item modal
    function openAddModal() {   
        addModal.style.display = 'block';
    }

    // Function to open add user modal
    function openAddUserModal() {
        addUserModalElement.style.display = 'block';
    }

    function openUpdateModal(item) {
        // Set the default values (for food or drink without variants)
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';
        document.getElementById('update_name').value = item.food_name || item.drink_name;
        document.getElementById('update_price').value = item.food_price || item.drink_price;
        document.getElementById('update_type').value = item.food_type || item.drink_type;
        document.getElementById('update_serving').value = item.food_serve_count || item.drink_serve_count;
        
        // If the item has variants, create a dropdown to select variants
        const variantSelect = document.getElementById('variant_select');
        variantSelect.innerHTML = ''; // Clear previous options, if any

        if (item.food_name) {
            document.getElementById('update_description').style.display = 'block';
            document.querySelector('label[for="update_description"]').style.display = 'block';
            document.getElementById('update_description').value = item.food_desc;

        } else {
            document.getElementById('update_description').style.display = 'none';
            document.querySelector('label[for="update_description"]').style.display = 'none';
        }

        if (item.variants && item.variants.length > 0) {

            document.getElementById('variant_select').style.display = 'block';
            document.querySelector('label[for="variant_select"]').style.display = 'block';

            // Create a default option (no variant selected)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `${item.food_name || item.drink_name}`;
            variantSelect.appendChild(defaultOption);

            // Loop through the variants and add them to the dropdown
            item.variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.variant_name;
                option.textContent = `${variant.variant_name}`;
                option.dataset.price = variant.variant_price;
                option.dataset.serveCount = variant.variant_serve_count;
                variantSelect.appendChild(option);
            });

            // Add an event listener to update fields when a variant is selected
            variantSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                if (selectedOption.value) {
                    // Update the modal fields with the selected variant's data
                    document.getElementById('update_name').value = selectedOption.value;
                    document.getElementById('update_price').value = selectedOption.dataset.price;
                    document.getElementById('update_serving').value = selectedOption.dataset.serveCount;

                    document.getElementById('is_variant').value = 'true';
                    document.getElementById('variant_name').value = selectedOption.value;
                } else {
                    // Reset to original item details if no variant is selected
                    document.getElementById('update_name').value = item.food_name || item.drink_name;
                    document.getElementById('update_price').value = item.food_price || item.drink_price;
                    document.getElementById('update_type').value = item.food_type || item.drink_type;
                    document.getElementById('update_serving').value = item.food_serve_count || item.drink_serve_count;

                    document.getElementById('is_variant').value = '';
                    document.getElementById('variant_name').value = '';
                    
                }
            });
        } else {
            document.getElementById('variant_select').style.display = 'none';
            document.querySelector('label[for="variant_select"]').style.display = 'none';
        }
        updateModal.style.display = 'block';
    }

    function openUpdateUserModal(item) {
        document.getElementById('user_id').value = item.user_id;
        document.getElementById('update_fname').value = item.user_firstname;
        document.getElementById('update_lname').value = item.user_lastname;
        document.getElementById('update_role').value = item.user_role;

        updateUserModal.style.display = 'block';
    }

    function openDeleteModal(item) {
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';

        yesButton.onclick = async () => {
            try {
                const response = await fetch('/backend/Admin/delete_item.php', {
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
                console.error('error:', error);
                alert('An error occurred while deleting the item.');
            }
        };
        
        deleteModal.style.display = 'block';
    }

    function openDeleteUserModal(item) {

        // Ensure valid user_id
        if (!item.user_id) {
            alert('Invalid user ID');
            return;
        }

        // Assign new click handler
        userYesButton.onclick = async () => {
            userYesButton.disabled = true;
            try {
                const response = await fetch('/backend/Admin/delete_user.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: item.user_id
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                // Check HTTP status
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                // Parse JSON response
                const result = await response.json();
    
                if (result.success) {
                    alert('User deleted successfully');
                    deleteUserModal.style.display = 'none';
                    await generateAllUsers();
                } else {
                    alert('Delete failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the user.');
            } finally {
                userYesButton.disabled = false;
            }
        };
    
        // Show the modal
        deleteUserModal.style.display = 'block';
    }    

    function openAddVariantModal(item){
        document.getElementById('variant_item_id').value = item.food_id || item.drink_id;
        document.getElementById('variant_item_type').value = item.food_id ? 'food' : 'drink';
        document.getElementById('item_name').textContent = item.food_name || item.drink_name;
        addVariantModal.style.display = 'block';
    }
    
    
    // ------------------------------- MODAL EVENTLISTENER ----------------
   
    noButton.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });
    
    userNoButton.addEventListener('click', function () {
        deleteUserModal.style.display = 'none';
    });

    // Attach event listeners
    addButton.addEventListener('click', openAddModal); // Open add item modal on button click
    openModalButton.addEventListener('click', openAddUserModal); // Open add user modal on button click

    // Close modal if clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === addUserModalElement) {
            closeAddUserModal();
        }
    });

    //-------------------- DOCUMENT EVENT LISTENERS ----------------------//

    document.getElementById('updateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const response = await fetch('/backend/Admin/update_item.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    updateModal.style.display = 'none';
                    await generateAllItems();
                    document.getElementById('updateForm').reset();
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
        }
    });

    document.getElementById('updateUserForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        console.log('Form submitted');
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const response = await fetch('/backend/Admin/update_userinfo.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    updateUserModal.style.display = 'none';
                    await generateAllUsers();
                    document.getElementById('updateUserForm').reset();
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
        }
    });

    document.getElementById('addForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const serveCount = parseInt(formData.get('add_serving'), 10);
    
        if (serveCount < 1) {
            alert('Serving count must be at least 1.');
            return; 
        }
    
        try {
            const response = await fetch('/backend/Admin/add_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Item added successfully');
                addModal.style.display = 'none';
                await generateAllItems();
                document.getElementById('addForm').reset();
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            console.error('error:', error);
            alert('An error occurred while adding the item.');
        }
    });

    document.getElementById('addVariantForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        const serveCount = parseInt(formData.get('add_variant_serving'), 10);
    
        if (serveCount < 1) {
            alert('Serving count must be at least 1.');
            return; 
        }
    
        try {
            const response = await fetch('/backend/Admin/add_variant_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Item added successfully');
                addVariantModal.style.display = 'none';
                await generateAllItems();
                document.getElementById('addVariantForm').reset();
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            //alert('An error occurred while adding the item.');
        }
    });

    document.getElementById('add_category').addEventListener('change', function() {
        const descriptionContainer = document.getElementById('description_container');
        const selectedCategory = this.value;
    
        // Hide the description field if category is 'drink'
        if (selectedCategory === 'drink') {
            descriptionContainer.style.display = 'none';
        } else {
            descriptionContainer.style.display = 'flex';
        }
    });

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function () {
            button.parentElement.parentElement.style.display = 'none';
        });
    });

    document.getElementById('addUserForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        try {
            const response = await fetch('/backend/Admin/add_user.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                alert('User added successfully');
                addUserModalElement.style.display = 'none';
                await generateAllUsers();
                document.getElementById('addUserForm').reset();
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            console.error('error:', error);
            alert('An error occurred while adding the item.');
        }
    });
    
    // Add event listeners for navigation links
    inventoryLink.addEventListener('click', () => {
        inventoryLink.classList.add('active');
        statisticsLink.classList.remove('active');
        logsLink.classList.remove('active');
        usersLink.classList.remove('active');  // Ensure 'Users' link is not active
        inventorySection.style.display = '';
        statisticsSection.style.display = 'none';
        logSection.style.display = 'none';
        usersSection.style.display = 'none'; // Hide Users section
        document.body.classList.add('inventory-active');
        filterItems('Foods');  // Set default category to Foods on inventory section load
    });

    statisticsLink.addEventListener('click', () => {
        inventoryLink.classList.remove('active');
        statisticsLink.classList.add('active');
        logsLink.classList.remove('active');
        usersLink.classList.remove('active');  // Ensure 'Users' link is not active
        inventorySection.style.display = 'none';
        statisticsSection.style.display = '';
        logSection.style.display = 'none';
        usersSection.style.display = 'none'; // Hide Users section
        generateStatisticsChart('weekly'); // Default to weekly view
    });

    logsLink.addEventListener('click', () => {
        inventoryLink.classList.remove('active');
        statisticsLink.classList.remove('active');
        logsLink.classList.add('active');
        usersLink.classList.remove('active');  // Ensure 'Users' link is not active
        inventorySection.style.display = 'none'; // Hide Inventory section
        statisticsSection.style.display = 'none'; // Hide Statistics section
        logSection.style.display = ''; // Show Log section
        usersSection.style.display = 'none'; // Hide Users section
        generateAllLogs();
    });

    // Event listener for Users navigation
    usersLink.addEventListener('click', () => {
        inventoryLink.classList.remove('active');
        statisticsLink.classList.remove('active');
        logsLink.classList.remove('active');
        usersLink.classList.add('active');  // Activate Users link
        inventorySection.style.display = 'none'; // Hide Inventory section
        statisticsSection.style.display = 'none'; // Hide Statistics section
        logSection.style.display = 'none'; // Hide Log section
        usersSection.style.display = ''; // Show Users section
        generateAllUsers();
    });


     // Event listener for weekly button
     document.getElementById('weeklyBtn').addEventListener('click', () => {
        generateStatisticsChart('weekly');
    });

    // Event listener for monthly button
    document.getElementById('monthlyBtn').addEventListener('click', () => {
        generateStatisticsChart('monthly');
    });

    // Event listener for yearly button
    document.getElementById('yearlyBtn').addEventListener('click', () => {
        generateStatisticsChart('yearly');
    });

    // Set default view on page load
    inventoryLink.click();

    async function weeklySales () {
        try {
            const res = await fetch("/backend/Admin/weeklyStats.php");
            const weeklyData = await res.json();
            return weeklyData;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    async function monthlySales () {
        try {
            const res = await fetch("/backend/Admin/monthlyStats.php");
            const monthlyData = await res.json();
            return monthlyData;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    async function yearlySales () {
        try {
            const res = await fetch("/backend/Admin/yearlyStats.php");
            const yearlyData = await res.json();
            return yearlyData;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    async function yearlySalesDate () {
        try {
            const res = await fetch("/backend/Admin/yearlyStatsYears.php");
            const yearlyDateData = await res.json();
            return yearlyDateData;
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }



    async function generateStatisticsChart(timeframe = 'weekly') {
        let chartData = {};
        const weekly = await weeklySales();
        const monthly = await monthlySales();
        const yearly = await yearlySales();
        const YD = await yearlySalesDate();



        switch (timeframe) {
            case 'weekly':
                //for (i = 1; i>=4; i++){
                    chartData = {
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                        datasets: [
    
                            {
                                label: 'Sales',
                                data: weekly,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }
                        ]
                    };
                //}
                break;
                case 'monthly':
                    chartData = {
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        datasets: [
    
                            {
                                label: 'Sales',
                                data: monthly,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }
                        ]
                    };
                    break;

                    case 'yearly':
                        chartData = {
                            labels: YD,
                            datasets: [
                               
                                {
                                    label: 'Sales',
                                    data: yearly,
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                }
                            ]
                        };
                        break;

            default:
                chartData = {}; // Handle unexpected cases
        }

        const chartOptions = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        // Replace existing chart with new chart based on selected timeframe
        if (statisticsChart) {
            statisticsChart.destroy(); // Destroy existing chart instance
        }
        statisticsChart = new Chart(statisticsChartElement, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }


    // Set default view on page load
    inventoryLink.click();
});

async function getSummaryLog() {
    // Get the selected date from the input field
        
    const setDate = document.getElementById("summary-datetimelocal").value;
    const setDate2 = document.getElementById("summary-datetimelocal2").value;

    if (!setDate) {
        alert("Please select a date.");
        return;
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append('setDate', setDate);
    formData.append('setDate2', setDate2);

    try {
        // Make the POST request
        const response = await fetch('/backend/Admin/summarySales.php', {
            method: 'POST',
            body: formData
        });

        // Parse JSON response
        const data = await response.json();

       

        // Handle the response
        if (data.success) {
            getSummaryPerformance();
            // Example: Update the UI with the total sales
            
            const totalSales = data.data.total_sales || 0;
            document.getElementById("date-summary").textContent = `${setDate} to ${setDate2}`;
            document.getElementById("sale-summary").textContent = ` PHP ${totalSales}`;
        } else if (data.error) {
            // Handle errors sent from the backend
            alert(data.error);
        }
    } catch (error) {
        // Handle fetch/network errors
        console.error('Error:', error);
        alert("An error occurred while fetching the summary log.");
    }
}


    async function getSummaryPerformance() {
        // Get the selected dates from the input fields
        const setDate = document.getElementById("summary-datetimelocal").value;
        const setDate2 = document.getElementById("summary-datetimelocal2").value;
    
        if (!setDate) {
            alert("Please select a date.");
            return;
        }
    
        // Prepare the form data
        const formData = new FormData();
        formData.append('setDate', setDate);
        formData.append('setDate2', setDate2);
    
        try {
            // Make the POST request
            const response = await fetch('/backend/Admin/summaryPerfomance.php', {
                method: 'POST',
                body: formData
            });
    
            // Parse JSON response
            const data = await response.json();
    
            // Handle the response
            if (data.success) {
                // Example: Update the UI with item names and their frequencies
                const items = data.data || [];
                const tbody = document.getElementById("performance-data");
    
                // Clear previous content
                tbody.innerHTML = '';
    
                // Append each item to the table body
                items.forEach(item => {
                    const row = document.createElement('tr');
    
                    const cell1 = document.createElement('td');
                    cell1.textContent = item.item_name;
                    row.appendChild(cell1);
    
                    const cell2 = document.createElement('td');
                    cell2.textContent = item.frequency;
                    row.appendChild(cell2);
    
                    tbody.appendChild(row);
                });

                
            } else if (data.error) {
                // Handle errors sent from the backend
                alert(data.error);
            }
        } catch (error) {
            // Handle fetch/network errors
            console.error('Error:', error);
            alert("An error occurred while fetching the summary log.");
        }
    }
    




// Function to open the Summary Log Modal
function openSummaryLogModal() {
    getSummaryLog();
    const modal = document.getElementById("summaryLogModal");
    modal.style.display = "block"; // Show the modal
}

// Function to close the Summary Log Modal
function closeSummaryLogModal() {
    const modal = document.getElementById("summaryLogModal");
    modal.style.display = "none"; // Hide the modal
}

// Function to open summary log date modal
function opensummarylogmodaldate() {
    const modal = document.getElementById("summarylogmodaldate")
    modal.style.display = "block";
}
// Function to close the summary log date modal
function closesummarylogmodaldate () {
    const modal = document.getElementById("summarylogmodaldate")
    modal.style.display = "none";
}

// Add event listener to the close button
// document.querySelector(".summarylog-button").addEventListener("click", openSummaryLogModal);
// document.querySelector("#summaryLogModal .close-button").addEventListener("click", closeSummaryLogModal);

// add event listener to the summary log date modal
document.querySelector(".summarylogdate-button").addEventListener("click", opensummarylogmodaldate);


//LOG EMPLOYEE MODAL

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#LogTable tbody");

    // Event listener for row clicks
    tableBody.addEventListener("click", handleRowClick);

    // Get the modal elements
    const modal = document.getElementById("myModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const closeButton = document.querySelector(".close-button");

    // Handle row click
    function handleRowClick(event) {
        const row = event.target.closest("tr");
        if (row) {
            // Get data from clicked row
            const date = row.getAttribute("data-date");

            // Populate the modal with data from the clicked row
            document.getElementById("modalDate").textContent = date;

            // Show the modal and overlay
            modal.style.display = "block";
            modalOverlay.style.display = "block";
        }
    }

    // Close the modal when close button is clicked
    closeButton.addEventListener("click", function () {
        // Hide modal and overlay
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });
    /*
    // Close the modal when clicking on the overlay (optional)
    modalOverlay.addEventListener("click", function () {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });*/
});



