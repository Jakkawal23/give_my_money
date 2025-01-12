document.addEventListener("DOMContentLoaded", () => {

    const request = indexedDB.open('transactionsDB', 2);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('transactions')) {
            const store = db.createObjectStore('transactions', { autoIncrement: true });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('description', 'description', { unique: false });
            store.createIndex('borrow', 'borrow', { unique: false });
            store.createIndex('refund', 'refund', { unique: false });
        }

        if (!db.objectStoreNames.contains('parameter')) {
            const parameterStore = db.createObjectStore('parameter', { autoIncrement: true });
            parameterStore.createIndex('name', 'name', { unique: false });
            parameterStore.createIndex('lastName', 'lastName', { unique: false });
            parameterStore.createIndex('startRate', 'startRate', { unique: false });
            parameterStore.createIndex('dayRate', 'dayRate', { unique: false });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        let startRate = 0.1;
        let dayRate = 0.01;

        // Function to add data to IndexedDB
        function addData(transactionData, callback) {
            const transaction = db.transaction('transactions', 'readwrite');
            const store = transaction.objectStore('transactions');
            const addRequest = store.add(transactionData);

            addRequest.onsuccess = () => {
                console.log('Data added successfully');
                if (callback) callback();
            };

            addRequest.onerror = (event) => {
                console.error('Error adding data:', event.target.error);
            };
        }

        function getData(callback) {
            const transaction = db.transaction('transactions', 'readonly');
            const store = transaction.objectStore('transactions');
            const request = store.openCursor();
            const result = [];
        
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const record = { id: cursor.key, ...cursor.value };
                    result.push(record);
                    cursor.continue();
                } else {
                    callback(result); 
                }
            };
        
            request.onerror = (event) => {
                console.error('Error fetching data:', event.target.error);
            };
        }        

        // Function to retrieve data by ID from IndexedDB
        function getDataById(id, callback) {
            const transaction = db.transaction('transactions', 'readonly');
            const store = transaction.objectStore('transactions');
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    const record = { id: id, ...request.result };
                    callback(record);
                } else {
                    console.warn(`No record found with id ${id}.`);
                    callback(null);
                }
            };

            request.onerror = (event) => {
                console.error('Error retrieving data:', event.target.error);
                callback(null);
            };
        }

        //Function to update data in IndexedDB
        function updateData(id, updatedData) {
            const transaction = db.transaction('transactions', 'readwrite');
            const store = transaction.objectStore('transactions');
            const request = store.get(id);
        
            request.onsuccess = () => {
                const data = request.result;
        
                if (!data) {
                    console.error(`No record found with id ${id}. Update aborted.`);
                    return;
                }
        
                // Preserve the `id` and merge updates
                const updatedRecord = { ...data, ...updatedData };
                store.put(updatedRecord, id); // Explicitly specify the `id`
            };
        
            request.onerror = (event) => {
                console.error('Error retrieving data for update:', event.target.error);
            };
        }
        
        // Function to delete data from IndexedDB
        function deleteData(id) {
            const transaction = db.transaction('transactions', 'readwrite');
            const store = transaction.objectStore('transactions');
            store.delete(id);
        }

        function clearAllTransactionData() {
            if (!db) {
                console.error('Database not initialized.');
                return;
            }
            const transaction = db.transaction('transactions', 'readwrite');
            const store = transaction.objectStore('transactions');
            const clearRequest = store.clear();
        
            clearRequest.onsuccess = () => {
                console.log('All data cleared successfully.');
            };
        
            clearRequest.onerror = (event) => {
                console.error('Error clearing data:', event.target.error);
            };
        }

        function setParameterDataByKey(key, data) {
            const transaction = db.transaction('parameter', 'readwrite');
            const store = transaction.objectStore('parameter');
        
            const request = store.put(data, key);
        
            request.onsuccess = () => {
                console.log('Data set successfully.');
            };
        
            request.onerror = (event) => {
                console.error('Error setting data:', event.target.error);
            };
        }
        
        function getParameterDataByKey(key, callback) {
            const transaction = db.transaction('parameter', 'readonly');
            const store = transaction.objectStore('parameter');
        
            const request = store.get(key); // Specify the key to get the record.
        
            request.onsuccess = () => {
                if (request.result) {
                    callback(request.result); // If found, return the data
                } else {
                    console.warn('No record found with that key.');
                    callback(null); // If not found, return null
                }
            };
        
            request.onerror = (event) => {
                console.error('Error retrieving data:', event.target.error);
                callback(null);
            };
        }

        function clearAllParameter() {
            if (!db) {
                console.error('Database not initialized.');
                return;
            }
            const transaction = db.transaction('parameter', 'readwrite');
            const store = transaction.objectStore('parameter');
            const clearRequest = store.clear();
        
            clearRequest.onsuccess = () => {
                console.log('All data cleared successfully.');
            };
        
            clearRequest.onerror = (event) => {
                console.error('Error clearing data:', event.target.error);
            };
        }

        const hamBurger = document.querySelector(".toggle-btn");

        hamBurger.addEventListener("click", function () {
            document.querySelector("#sidebar").classList.toggle("expand");
        });

        const sidebarLinks = document.querySelectorAll(".sidebar-link");
        const sections = document.querySelectorAll(".content-section");

        sidebarLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();

                const targetId = link.getAttribute("data-target");

                sections.forEach(section => section.style.display = "none");

                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = "block";
                }
            });
        });

        const quotes = [
            'ช่วงนี้ชีวิตเงียบเหงา…ช่วยเอาเงินเธอมาฝากไว้ที่เราได้ไหม?',
            'ถ้าไม่อยากแตกหัก โปรด! อย่าทักมายืมเงิน',
            'ไม่ลืม ไม่มี ไม่หนี ไม่จ่าย แต่เที่ยวสบายนี่แหละวิถีลูกหนี้',
            'คำว่า “หนี้” ไม่มี...คืน',
            'ถ้าจะทักมายืมเงิน กรุณารอคิวถัดไป ...ไปไกลๆ',
            'ทำงานหนัก อยากมีเงินไว้ใช้ ไม่ได้มีไว้ให้ใครมายืม',
            'ตอนยืมบอก “เดือนหน้า” ตอนคืน “แม้แต่หน้าก็ยังไม่เห็น”',
            'ใช้ชีวิตอย่างหรู คืนหนี้มาด้วยนะจ๊ะหนู',
            'ไม่มีเลยค่ะ ไม่ลูกหนี้คนไหนคืนเงินเลยค่ะ',
            'ทวงก็ผิด นิ่งก็เงียบ บอกทีต้องทำยังไงถึงจะได้เงินคืน',
            'ยืมเงินไปไม่คืน สงสัยจะเก็บไว้อม',
            'ติดหนี้ใคร.. ก็ใช้เถอะ ชาติหน้าจะได้ไม่ต้องมาเจอกัน',
            'ถ้าพี่เอ็นดู ช่วยโอนให้หนูห้าพัน',
            'ซินเจียยู่อี่ มีหนี้ต้องใช้',
            'โพสต์แต่ละอย่าง มีตังค์ สบายดี แต่มีหนี้ไม่ยอมใช้',
            'ตอนขอยืมหน้าบาง ตอนทวงคืนหน้าหนาเชียว',
            'ก่อนจะขอยืมใหม่ หนี้เก่าช่วยคืนก่อน',
            'เงินที่ให้ยืมไม่ได้มีมาก อยากช่วยยามลำบาก แต่อย่าคืนยากเลย',
            'เงินเป็นกระดาษที่คมมาก ตัดได้แม้กระทั่งญาติ',
            'วันนี้ถ้าไม่เห็นค่า วันหน้าคิดดอก',
            'เงินที่ยืมไป ไม่ได้บริจาค คืนด้วย'
        ];

        // เลือกข้อความสุ่ม
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // แสดงข้อความใน #randomQuote
        document.getElementById('randomQuote').textContent = 'คำคมวันนี้(สุ่ม): ' + randomQuote;

        let rowsPerPage = 10; 
        let currentPage = 1;
        let filteredData = [];

        const tableBody = document.getElementById("transactionTableBody");
        const pagination = document.getElementById("pagination");
        const rowsPerPageSelector = document.getElementById("rowsPerPageSelector");
        const searchInput = document.getElementById("searchInput");

        function renderTable(data) {
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
            tableBody.innerHTML = "";
            data.forEach((row, index) => {
                const tr = document.createElement("tr");

                const borrow = row.borrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const refund = row.refund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                
                // Format the date (YYYY-MM-DD to DD/MM/YYYY)
                const formattedDate = new Date(row.date);
                const day = String(formattedDate.getDate()).padStart(2, '0');  // Add leading zero if needed
                const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                const year = formattedDate.getFullYear();

                const dateString = `${day}/${month}/${year}`;

                tr.innerHTML = `
                    <td data-label="#">${index + 1}</td>
                    <td data-label="Type">${row.type}</td>
                    <td data-label="Date">${dateString}</td>
                    <td data-label="Description">${row.description}</td>
                    <td data-label="Borrow" class="text-end">${borrow}</td>
                    <td data-label="Refund" class="text-end">${refund}</td>
                    <td data-label="Edit">
                        <button class="btn btn-warning btn-sm" onclick="editRow(${row.id})"><i class="lni lni-pencil me-1"></i> แก้ไข</button>
                    </td>
                    <td data-label="Delete">
                        <button class="btn btn-danger btn-sm" onclick="deleteRow(${row.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>  
                            ลบ
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }   

        function renderHistoryTable(historyData) {
            const historyTableBody = document.getElementById("historyTableBody");
            historyTableBody.innerHTML = "";
            historyData.forEach((row, index) => {
                const tr = document.createElement("tr");
        
                // Format numbers with commas
                const borrow = row.borrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const refund = row.refund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const nowInterest = row.nowInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const totalInterest = row.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const totalToPay = row.totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
                // Format the date (YYYY-MM-DD to DD/MM/YYYY)
                const formattedDate = new Date(row.date);
                const day = String(formattedDate.getDate()).padStart(2, '0');  // Add leading zero if needed
                const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                const year = formattedDate.getFullYear();

                const dateString = `${day}/${month}/${year}`;

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.type}</td>
                    <td>${dateString}</td>
                    <td>${row.description}</td>
                    <td class="text-end">${borrow}</td>
                    <td class="text-end">${refund}</td>
                    <td class="text-end">${nowInterest}</td>
                    <td class="text-end">${totalInterest}</td>
                    <td class="text-end">${totalToPay}</td>
                `;
                historyTableBody.appendChild(tr);
            });
        }
        
        // Function to render pagination
        function renderPagination(totalRows) {
            pagination.innerHTML = "";
            const totalPages = Math.ceil(totalRows / rowsPerPage);

            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement("li");
                li.className = "page-item";
                li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                li.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentPage = i;
                    updateTable();
                });
                pagination.appendChild(li);
            }
        }

        // Function to update the table content
        function updateTable() {
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedData = filteredData.slice(start, end); 
            if (paginatedData.length <= 0) {
                rowsPerPageSelector.style.display = "none";
            } else {
                rowsPerPageSelector.style.display = "block";
            }
            renderTable(paginatedData);
            renderPagination(filteredData.length);
            updateTaskSummary()

            Array.from(pagination.children).forEach((li, index) => {
                li.classList.toggle("active", index + 1 === currentPage);
            });
        }

        // Handle rows per page change
        rowsPerPageSelector.addEventListener("change", () => {
            rowsPerPage = parseInt(rowsPerPageSelector.value, 10);
            currentPage = 1;
            updateTable();
        });

        // Search function
        window.searchTable = function(keyword) {
            const searchTerm = searchInput.value.toLowerCase();
            getData((baseTransactionData) => {
                console.log('All data:', baseTransactionData);

                filteredData = baseTransactionData.filter(row => {

                    // Format the date (YYYY-MM-DD to DD/MM/YYYY)
                    const formattedDate = new Date(row.date);
                    const day = String(formattedDate.getDate()).padStart(2, '0');  // Add leading zero if needed
                    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                    const year = formattedDate.getFullYear();
    
                    const dateString = `${day}/${month}/${year}`;
    
                    return row.type.toLowerCase().includes(searchTerm) || 
                        dateString.toLowerCase().includes(searchTerm) || 
                        row.description.toLowerCase().includes(searchTerm) || 
                        row.borrow.toString().includes(searchTerm) || 
                        row.refund.toString().includes(searchTerm);
                });
                    
                currentPage = 1;
                updateTable();
            });
        };

        // Function to handle the Delete action
        window.deleteRow = function(id) {
            console.log("Delete ID => ",id)
            // clearAllData();
            deleteData(id);
            searchInput.value = "";
            searchTable();
        };

        // Reference to the modal and the form
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        const modalElement = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');

        let editId = null;

        window.openAddModal = function(type) {
            toggleBorrowField(type);
            const today = new Date().toISOString().split('T')[0];

            document.getElementById('editType').value = type;  
            document.getElementById('editDate').value = today;
            document.getElementById('editDescription').value = "";
            document.getElementById('editBorrow').value = 0;
            document.getElementById('editRefund').value = 0;
            editId = null;

            modalElement.removeAttribute('aria-hidden');  // Modal visible for screen readers
            modalElement.removeAttribute('inert');  // Remove inert to allow interaction
            editModal.show();
        };

        window.editRow = function(id) {
            getDataById(id, (baseTransactionData) => {
                if (baseTransactionData) {
                    toggleBorrowField(baseTransactionData.type);
                    document.getElementById('editType').value = baseTransactionData.type;
                    document.getElementById('editDate').value = baseTransactionData.date;
                    document.getElementById('editDescription').value = baseTransactionData.description;
                    document.getElementById('editBorrow').value = baseTransactionData.borrow;
                    document.getElementById('editRefund').value = baseTransactionData.refund;
                    editId = baseTransactionData.id;

                    modalElement.removeAttribute('aria-hidden');  // Modal visible for screen readers
                    modalElement.removeAttribute('inert');  // Remove inert to allow interaction
                    editModal.show();
                }
            });    
        }

        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const updatedType = document.getElementById('editType').value;
            const updatedDate = document.getElementById('editDate').value;
            const updatedDescription = document.getElementById('editDescription').value;
            const updatedBorrow = parseFloat(document.getElementById('editBorrow').value);
            const updatedRefund = parseFloat(document.getElementById('editRefund').value);

            document.getElementById('editDate').classList.remove('highlight-empty');
            document.getElementById('editBorrow').classList.remove('highlight-empty');
            document.getElementById('editRefund').classList.remove('highlight-empty');

            if (!updatedDate) {
                document.getElementById('editDate').classList.add('highlight-empty');
                return;
            }

            if ((updatedType === "Borrow" && updatedBorrow <= 0)) {
                document.getElementById('editBorrow').classList.add('highlight-empty');
                return;
            }

            if ((updatedType === "Refund" && updatedRefund <= 0)) {
                document.getElementById('editRefund').classList.add('highlight-empty');
                return;
            }

            if (editId) {
                const editRow = {
                    type: updatedType,
                    date: updatedDate,
                    description: updatedDescription,
                    borrow: updatedBorrow,
                    refund: updatedRefund,
                };

                updateData(editId, editRow);
                showToast("success", "แก้ไขข้อมูล", "แก้ไขข้อมูลเสร็จสิ้น");
            } else {
                const newRow = {
                    type: updatedType,
                    date: updatedDate,
                    description: updatedDescription,
                    borrow: updatedType === "Borrow" ? updatedBorrow : 0,
                    refund: updatedType === "Refund" ? updatedRefund : 0,
                };
                addData(newRow, () => {
                    searchInput.value = "";
                    searchTable();
                    showToast("success", "บันทึกข้อมูล", "บันทึกข้อมูลเสร็จสิ้น");
                });
            }

            modalElement.setAttribute('aria-hidden', 'true');  // Modal hidden for screen readers
            modalElement.setAttribute('inert', 'true');  // Add inert to prevent interaction
            editModal.hide();
            searchTable();
        });

        const editDateInput = document.getElementById('editDate');
        const editBorrowInput = document.getElementById('editBorrow');
        const editRefundInput = document.getElementById('editRefund');

        editDateInput.addEventListener('input', function () {
            if (editDateInput.value) {
                editDateInput.classList.remove('highlight-empty');
            }
        });

        editBorrowInput.addEventListener('input', function () {
            if (editBorrowInput.value) {
                editBorrowInput.classList.remove('highlight-empty');
            }
        });

        editRefundInput.addEventListener('input', function () {
            if (editRefundInput.value) {
                editRefundInput.classList.remove('highlight-empty');
            }
        });

        function toggleBorrowField(type) {
            const editBorrow = document.getElementById('editBorrow');   
            const editRefund = document.getElementById('editRefund');   
            
            if (type === "Refund") {
                editBorrow.disabled = true;   
                editRefund.disabled = false;  
            } else {
                editBorrow.disabled = false;  
                editRefund.disabled = true;  
            }
        }

        function updateTaskSummary() {
            getData((baseTransactionData) => {
                const history = calculateInterest(baseTransactionData);

                const totalBorrow = baseTransactionData.reduce((sum, row) => sum + (row.borrow || 0), 0);
                const totalInterest = history.length > 0 ? parseFloat(history[history.length - 1].totalInterest) : 0;
                const totalRefund = baseTransactionData.reduce((sum, row) => sum + (row.refund || 0), 0);
                const totalTopay = totalBorrow + totalInterest - totalRefund;

                const new_totalBorrow = totalBorrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const new_totalInterest = totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const new_totalTopay = totalTopay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const new_totalRefund = totalRefund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });


                document.getElementById("totalBorrow").textContent = new_totalBorrow;
                document.getElementById("totalInterest").textContent = new_totalInterest;
                document.getElementById("totalRefund").textContent = new_totalRefund;
                document.getElementById("totalTopay").textContent = new_totalTopay;

                document.getElementById("reportTotalBorrow").textContent = new_totalBorrow;
                document.getElementById("reportTotalInterest").textContent = new_totalInterest;
                document.getElementById("reportTotalRefund").textContent = new_totalRefund;
                document.getElementById("reportTotalTopay").textContent = new_totalTopay;

                renderHistoryTable(history);
            });
        }

        function calculateInterest(baseTransactionData) {
            const history = []; 

            let totalToPay = 0;
            let totalInterest = 0; 
            let lastDate = null;

            function calculateDaysBetween(date1, date2) {
                const d1 = new Date(date1);
                const d2 = new Date(date2);
                return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
            }

            baseTransactionData.sort((a, b) => new Date(a.date) - new Date(b.date));

            baseTransactionData.forEach(row => {
                let nowInterest = 0;
                
                if (lastDate) {
                    const days = calculateDaysBetween(lastDate, row.date == "" ? lastDate : row.date);
                    nowInterest = days * totalToPay * dayRate;
                }

                if (row.type === "Borrow") {
                    nowInterest += parseFloat(row.borrow) * startRate; 
                    totalToPay += parseFloat(row.borrow);
                }

                totalInterest += nowInterest;

                if (row.type === "Refund") {
                    if (row.refund >= totalInterest) {
                        totalInterest = 0; 
                        totalToPay = Math.max(0, totalToPay - parseFloat(row.refund)); 
                    } else {
                        totalInterest -= parseFloat(row.refund); 
                    }
                }

                history.push({
                    type: row.type,
                    date: row.date,
                    description: row.description,
                    borrow: row.type === "Borrow" ? parseFloat(row.borrow) : 0,
                    refund: row.type === "Refund" ? parseFloat(row.refund) : 0,
                    nowInterest: nowInterest,
                    totalInterest: totalInterest,
                    totalToPay: totalToPay,
                });

                lastDate = row.date;
            });

            return history;
        }

        document.getElementById("downloadReport").addEventListener("click", () => {
            const reportElement = document.getElementById("reportData");
        
            // Save original styles to restore them after export
            const originalStyles = {
                width: reportElement.style.width,
                maxWidth: reportElement.style.maxWidth,
                display: reportElement.style.display,
                flexDirection: reportElement.style.flexDirection,
                padding: reportElement.style.padding,
                flexWrap: reportElement.style.flexWrap,
                border: reportElement.style.border, // Save original border
            };
        
            // Temporarily force desktop layout for export (force cards to 25% width like on desktop)
            reportElement.style.width = "1200px"; // Force the element to have desktop-like width
            reportElement.style.maxWidth = "none"; // Remove any max-width constraints
            reportElement.style.display = "block"; // Ensure it's displayed as a block element
            reportElement.style.flexWrap = "wrap"; // Ensure the cards wrap nicely
            reportElement.style.padding = "20px"; // Add padding around the content
            reportElement.style.border = "5px solid #000"; // Add a border around the report
        
            // Apply temporary "desktop" behavior for col-md-3 (force each card to 25% width)
            const cards = reportElement.querySelectorAll(".col-md-3");
            cards.forEach(card => {
                card.style.flex = "0 0 25%"; // Force each card to take up 25% width (like in desktop layout)
            });
        
            // Use html2canvas to capture the element
            html2canvas(reportElement, {
                logging: true, // Enable logging to debug (optional)
                useCORS: true, // Enable CORS to capture images from external resources
                backgroundColor: "#ffffff" // Ensure the background is white
            }).then((canvas) => {
                const link = document.createElement("a");
                link.download = "history-report.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
                
                // Restore the original styles after the capture
                reportElement.style.width = originalStyles.width;
                reportElement.style.maxWidth = originalStyles.maxWidth;
                reportElement.style.display = originalStyles.display;
                reportElement.style.flexDirection = originalStyles.flexDirection;
                reportElement.style.padding = originalStyles.padding;
                reportElement.style.flexWrap = originalStyles.flexWrap;
                reportElement.style.border = originalStyles.border; // Restore original border
        
                // Restore the original card flex properties
                cards.forEach(card => {
                    card.style.flex = ""; // Remove the forced flex style
                });

                showToast("success", "บันทึกรายงาน", "บันทึกรายงานเสร็จสิ้น");
            }).catch(error => {
                console.error('Error capturing the image:', error);
            });
        });

        // Function to display the toast with dynamic content and type
        function showToast(type, title, message) {
            const toast = document.getElementById("dynamic-toast");
            const toastTitle = document.getElementById("toast-title");
            const toastMessage = document.getElementById("toast-message");

            // Set the title and message dynamically
            toastTitle.textContent = title;
            toastMessage.textContent = message;

            // Remove all previous toast types
            toast.classList.remove("toast-success", "toast-error", "toast-info", "toast-warning");

            // Add the appropriate class based on the type
            switch(type) {
                case "success":
                    toast.classList.add("toast-success");
                    break;
                case "error":
                    toast.classList.add("toast-error");
                    break;
                case "info":
                    toast.classList.add("toast-info");
                    break;
                case "warning":
                    toast.classList.add("toast-warning");
                    break;
                default:
                    toast.classList.add("toast-info"); // Default to info
                    break;
            }

            // Show the toast using Bootstrap Toast API
            const toastInstance = new bootstrap.Toast(toast);
            toastInstance.show();
        }

        window.resetParameter = function() {
            clearAllTransactionData();
            clearAllParameter();

            const nameParameter = document.getElementById("nameParameter").value = ""; 
            const lastNameParameter = document.getElementById("lastNameParameter").value = ""; 
            const startRateParameter = document.getElementById("startRateParameter").value = 10;  
            const dayRateParameter = document.getElementById("dayRateParameter").value = 1;
        
            const setParameter = {
                name: nameParameter,
                lastName: lastNameParameter,
                startRate: startRateParameter,
                dayRate: dayRateParameter,
            };

            setParameterDataByKey("Parameter", setParameter);
            getParameter();
            searchTable();
            showToast("success", "รีเซ็ตข้อมูล", "รีเซ็ตข้อมูลเสร็จสิ้น");
        }

        window.updateParameter = function(){
            clearAllParameter();

            const nameParameter = document.getElementById("nameParameter").value; 
            const lastNameParameter = document.getElementById("lastNameParameter").value;  
            const startRateParameter = document.getElementById("startRateParameter").value;  
            const dayRateParameter = document.getElementById("dayRateParameter").value; 
        

            document.getElementById('nameParameter').classList.remove('highlight-empty');
            document.getElementById('lastNameParameter').classList.remove('highlight-empty');
            document.getElementById('startRateParameter').classList.remove('highlight-empty');
            document.getElementById('dayRateParameter').classList.remove('highlight-empty');

            if ((nameParameter.length > 20)) {
                document.getElementById('nameParameter').classList.add('highlight-empty');
                showToast("error", "ข้อมูลผิด", "กรุณากรอกตัวอักษรไม่เกิน 20 อักษร");
                return;
            }

            if ((lastNameParameter.length > 20)) {
                document.getElementById('lastNameParameter').classList.add('highlight-empty');
                showToast("error", "ข้อมูลผิด", "กรุณากรอกตัวอักษรไม่เกิน 20 อักษร");
                return;
            }

            if ((startRateParameter <= 0 || startRateParameter > 100)) {
                document.getElementById('startRateParameter').classList.add('highlight-empty');
                showToast("error", "ข้อมูลผิด", "กรุณากรอกตัวเลขให้ถูกต้อง 1 - 100");
                return;
            }

            if ((dayRateParameter <= 0 || dayRateParameter > 100)) {
                document.getElementById('dayRateParameter').classList.add('highlight-empty');
                showToast("error", "ข้อมูลผิด", "กรุณากรอกตัวเลขให้ถูกต้อง 1 - 100");
                return;
            }

            const updateParameter = {
                name: nameParameter,
                lastName: lastNameParameter,
                startRate: startRateParameter,
                dayRate: dayRateParameter,
            };

            setParameterDataByKey("Parameter", updateParameter);
            getParameter();
            showToast("success", "บันทึกข้อมูล", "บันทึกข้อมูลเสร็จสิ้น");
        }

        function getParameter() {
            getParameterDataByKey("Parameter", (data) => {
                if (data) {
                    document.getElementById("nameParameter").value = data.name; 
                    document.getElementById("lastNameParameter").value = data.lastName;
                    document.getElementById("startRateParameter").value = data.startRate;
                    document.getElementById("dayRateParameter").value = data.dayRate; 
                    startRate = data.startRate / 100;
                    dayRate = data.dayRate / 100;
                    if(data.name.trim() && data.lastName.trim()){
                        setEmployeeName(data.name + " " + data.lastName); 
                    }
                }
            });
        }

        function setEmployeeName(name) {
            const employeeNameTransaction = document.getElementById("employeeNameTransaction");
            const employeeNameReport = document.getElementById("employeeNameReport");
            employeeNameTransaction.textContent = name;
            employeeNameReport.textContent = name;
        }

        const nameParameterInput = document.getElementById('nameParameter');
        const lastNameParameterInput = document.getElementById('lastNameParameter');
        const startRateParameterInput = document.getElementById('startRateParameter');
        const dayRateParameterInput = document.getElementById('dayRateParameter');

        nameParameterInput.addEventListener('input', function () {
            if (nameParameterInput.value) {
                nameParameterInput.classList.remove('highlight-empty');
            }
        });

        lastNameParameterInput.addEventListener('input', function () {
            if (lastNameParameterInput.value) {
                lastNameParameterInput.classList.remove('highlight-empty');
            }
        });

        startRateParameterInput.addEventListener('input', function () {
            if (startRateParameterInput.value) {
                startRateParameterInput.classList.remove('highlight-empty');
            }
        });

        dayRateParameterInput.addEventListener('input', function () {
            if (dayRateParameterInput.value) {
                dayRateParameterInput.classList.remove('highlight-empty');
            }
        });


        // Initialize table and pagination
        getParameter();
        searchTable();
        setEmployeeName("ลูกหนี้ ที่เคารพรัก"); 
    };
});