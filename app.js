const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./omnistock.db');
const PORT = 3000;

// Serves the fully featured, mobile-responsive dashboard with full CRUD capabilities
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OmniStock Dashboard</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
            </style>
        </head>
        <body class="text-slate-800 antialiased">
            <!-- Top Navigation Bar -->
            <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <span class="text-xl font-bold tracking-tight text-indigo-600 font-mono">OmniStock</span>
                            <span class="ml-2 px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">Local Node</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                            <span class="text-xs font-medium text-slate-500">Offline Ledger Ready</span>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Dashboard Container -->
            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Header Segment -->
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">Product Management</h1>
                    <p class="mt-1 text-sm text-slate-500">Maintain and audit local retail merchandise records before cloud sync deployment.</p>
                </div>

                <!-- Responsive Grid Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Form Section -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
                            <h2 id="formTitle" class="text-lg font-semibold text-slate-900 mb-5">Register Product</h2>
                            <form id="productForm" class="space-y-4">
                                <!-- Hidden field to track the product currently being edited -->
                                <input type="hidden" id="editing_id" value="">

                                <div>
                                    <label class="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">SKU Code</label>
                                    <input type="text" id="sku_code" class="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm font-mono border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" required placeholder="SKU-XXXX">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Product Name</label>
                                    <input type="text" id="product_name" class="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" required placeholder="Brand / Item Details">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Barcode Identifier</label>
                                    <input type="text" id="barcode" class="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" placeholder="UPC Barcode">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Price (PHP)</label>
                                        <input type="number" step="0.01" id="unit_price" class="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" required placeholder="0.00">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Reorder Pt</label>
                                        <input type="number" id="reorder_point" class="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" value="10">
                                    </div>
                                </div>
                                
                                <div class="space-y-2">
                                    <button type="submit" id="submitBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition duration-150 flex items-center justify-center gap-2">
                                        Commit to Storage
                                    </button>
                                    <button type="button" id="cancelBtn" onclick="resetFormState()" class="hidden w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-2.5 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2">
                                        Cancel Edit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Data Grid Section -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                <h2 class="text-lg font-semibold text-slate-900">Active Inventory Ledger</h2>
                                <button onclick="loadProducts()" class="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition">
                                    Force Sync Check
                                </button>
                            </div>
                            
                            <!-- Mobile Responsive Scroll Container -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr class="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            <th class="px-6 py-3">Tracking SKU</th>
                                            <th class="px-6 py-3">Item Specification</th>
                                            <th class="px-6 py-3">Retail Price</th>
                                            <th class="px-6 py-3 text-center">Reorder Point</th>
                                            <th class="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="productTableBody" class="divide-y divide-slate-100 text-sm">
                                        <!-- Rows injected dynamically via Javascript -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <script>
                // Handle Form Submissions (CREATE & UPDATE)
                document.getElementById('productForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const id = document.getElementById('editing_id').value;
                    const data = {
                        sku_code: document.getElementById('sku_code').value,
                        product_name: document.getElementById('product_name').value,
                        barcode: document.getElementById('barcode').value,
                        unit_price: parseFloat(document.getElementById('unit_price').value),
                        reorder_point: parseInt(document.getElementById('reorder_point').value)
                    };

                    let url = '/api/products';
                    let method = 'POST';

                    // If an ID exists, we execute an UPDATE operation instead
                    if (id) {
                        url = '/api/products/' + id;
                        method = 'PUT';
                    }

                    const response = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        resetFormState();
                        loadProducts();
                    } else {
                        const err = await response.json();
                        alert('System Warning: ' + err.error);
                    }
                });

                // Load Data Records From Database (READ)
                async function loadProducts() {
                    const response = await fetch('/api/products');
                    const products = await response.json();
                    const tbody = document.getElementById('productTableBody');
                    tbody.innerHTML = '';

                    if (products.length === 0) {
                        tbody.innerHTML = \`
                            <tr>
                                <td colspan="5" class="text-center text-slate-400 py-12 bg-white font-medium">
                                    No data assets currently logged in local system storage ledger.
                                </td>
                            </tr>\`;
                        return;
                    }

                    products.forEach(p => {
                        const tr = document.createElement('tr');
                        tr.className = "hover:bg-slate-50/70 transition duration-150";
                        tr.innerHTML = \`
                            <td class="px-6 py-4 font-mono font-bold text-indigo-600">\${p.sku_code}</td>
                            <td class="px-6 py-4 font-medium text-slate-900">\${p.product_name}</td>
                            <td class="px-6 py-4 font-semibold text-slate-700">Php \${parseFloat(p.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td class="px-6 py-4 text-center"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">\${p.reorder_point}</span></td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button onclick="startEdit('\${p.product_id}', '\${p.sku_code}', '\${p.product_name}', '\${p.barcode || ""}', \${p.unit_price}, \${p.reorder_point})" class="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-100 hover:text-indigo-700 transition">
                                    Edit
                                </button>
                                <button onclick="deleteProduct('\${p.product_id}')" class="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-100 hover:text-rose-700 transition">
                                    Purge
                                </button>
                            </td>
                        \`;
                        tbody.appendChild(tr);
                    });
                }

                // Transition the visual form into Update State
                function startEdit(id, sku, name, barcode, price, reorder) {
                    document.getElementById('editing_id').value = id;
                    document.getElementById('sku_code').value = sku;
                    document.getElementById('product_name').value = name;
                    document.getElementById('barcode').value = barcode;
                    document.getElementById('unit_price').value = price;
                    document.getElementById('reorder_point').value = reorder;

                    // Alter titles and labels to indicate update mode
                    document.getElementById('formTitle').innerText = 'Modify Product';
                    document.getElementById('submitBtn').innerText = 'Save Changes';
                    document.getElementById('cancelBtn').classList.remove('hidden');
                }

                // Restore form elements back to default registration states
                function resetFormState() {
                    document.getElementById('productForm').reset();
                    document.getElementById('editing_id').value = '';
                    document.getElementById('reorder_point').value = 10;

                    document.getElementById('formTitle').innerText = 'Register Product';
                    document.getElementById('submitBtn').innerText = 'Commit to Storage';
                    document.getElementById('cancelBtn').classList.add('hidden');
                }

                // Delete Entry Handling (DELETE)
                async function deleteProduct(id) {
                    if (confirm('Confirm permanent removal of this product entry from local tracking records?')) {
                        const response = await fetch('/api/products/' + id, { method: 'DELETE' });
                        if (response.ok) {
                            loadProducts();
                        }
                    }
                }

                // Initial fetch command on view initialization
                loadProducts();
            </script>
        </body>
        </html>
    `);
});

// CREATE: Add a New Product record with unique UUID identifier
app.post('/api/products', (req, res) => {
    const { sku_code, product_name, barcode, unit_price, reorder_point } = req.body;
    
    if (!sku_code || !product_name || !unit_price) {
        return res.status(400).json({ error: 'Missing mandatory tracking parameters' });
    }

    const product_id = uuidv4();
    const query = `
        INSERT INTO products (product_id, sku_code, product_name, barcode, unit_price, reorder_point)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [product_id, sku_code, product_name, barcode, unit_price, reorder_point || 10], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Product listing logged successfully',
            product_id: product_id
        });
    });
});

// READ ALL: Retrieve Complete Inventory Product Listings
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// READ ONE: Fetch Specific Product Entry using Unique ID lookup
app.get('/api/products/:id', (req, res) => {
    const query = 'SELECT * FROM products WHERE product_id = ?';
    
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Target inventory entry not found' });
        }
        res.status(200).json(row);
    });
});

// UPDATE: Modify Attributes of an Existing Product List Segment
app.put('/api/products/:id', (req, res) => {
    const { sku_code, product_name, barcode, unit_price, reorder_point } = req.body;
    
    const query = `
        UPDATE products 
        SET sku_code = ?, product_name = ?, barcode = ?, unit_price = ?, reorder_point = ?
        WHERE product_id = ?
    `;

    db.run(query, [sku_code, product_name, barcode, unit_price, reorder_point, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'No record matching identifier found to alter' });
        }
        res.status(200).json({ message: 'Inventory asset variables amended successfully' });
    });
});

// DELETE: Terminate Product Listing Entry from Local Storage
app.delete('/api/products/:id', (req, res) => {
    const query = 'DELETE FROM products WHERE product_id = ?';

    db.run(query, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'No operational item found to purge' });
        }
        res.status(200).json({ message: 'Product record successfully scrubbed from local ledger' });
    });
});

app.listen(PORT, () => {
    console.log(`OmniStock Local Backend Engine active on port ${PORT}`);
});