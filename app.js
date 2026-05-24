const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./omnistock.db');
const PORT = 3000;

// NEW UI ROUTE: Serves an interactive frontend dashboard directly to the browser
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OmniStock Local UI Demo</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/theme/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f4f6f9; font-family: sans-serif; }
                .card { box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; }
                .table-container { background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            </style>
        </head>
        <body>
            <div class="container my-5">
                <div class="row mb-4">
                    <div class="col">
                        <h1 class="fw-bold text-primary">OmniStock Local Engine</h1>
                        <p class="text-muted">Product Management CRUD Module UI Demo</p>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="card p-4">
                            <h4 class="mb-3 fw-bold text-secondary">Add New Product</h4>
                            <form id="productForm">
                                <div class="mb-3">
                                    <label class="form-label font-monospace small">SKU CODE</label>
                                    <input type="text" id="sku_code" class="form-control" required placeholder="e.g., PROD-101">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label font-monospace small">PRODUCT NAME</label>
                                    <input type="text" id="product_name" class="form-control" required placeholder="e.g., Premium Sugar">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label font-monospace small">BARCODE</label>
                                    <input type="text" id="barcode" class="form-control" placeholder="e.g., 480123456">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label font-monospace small">UNIT PRICE (PHP)</label>
                                    <input type="number" step="0.01" id="unit_price" class="form-control" required placeholder="0.00">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label font-monospace small">REORDER POINT</label>
                                    <input type="number" id="reorder_point" class="form-control" value="10">
                                </div>
                                <button type="submit" class="btn btn-primary w-100 fw-bold">Save to Database</button>
                            </form>
                        </div>
                    </div>

                    <div class="col-md-8">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="fw-bold text-secondary m-0">Local Database Inventory Records</h4>
                                <button onclick="loadProducts()" class="btn btn-sm btn-outline-secondary">Refresh Table</button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th>SKU</th>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Reorder</th>
                                            <th class="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="productTableBody">
                                        </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // Form Submit Handling (CREATE)
                document.getElementById('productForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const data = {
                        sku_code: document.getElementById('sku_code').value,
                        product_name: document.getElementById('product_name').value,
                        barcode: document.getElementById('barcode').value,
                        unit_price: parseFloat(document.getElementById('unit_price').value),
                        reorder_point: parseInt(document.getElementById('reorder_point').value)
                    };

                    const response = await fetch('/api/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        document.getElementById('productForm').reset();
                        document.getElementById('reorder_point').value = 10;
                        loadProducts();
                    } else {
                        const err = await response.json();
                        alert('Error: ' + err.error);
                    }
                });

                // Fetch Database Rows (READ)
                async function loadProducts() {
                    const response = await fetch('/api/products');
                    const products = await response.json();
                    const tbody = document.getElementById('productTableBody');
                    tbody.innerHTML = '';

                    if (products.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No data assets logged in local table storage ledger.</td></tr>';
                        return;
                    }

                    products.forEach(p => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = \`
                            <td class="font-monospace fw-bold">\${p.sku_code}</td>
                            <td>\${p.product_name}</td>
                            <td class="fw-semibold">Php \${parseFloat(p.unit_price).toFixed(2)}</td>
                            <td>\${p.reorder_point}</td>
                            <td class="text-center">
                                <button onclick="deleteProduct('\${p.product_id}')" class="btn btn-sm btn-danger px-3">Delete</button>
                            </td>
                        \`;
                        tbody.appendChild(tr);
                    });
                }

                // Delete Entry Handling (DELETE)
                async function deleteProduct(id) {
                    if (confirm('Confirm parsing extraction deletion script command for this asset entry?')) {
                        const response = await fetch('/api/products/' + id, { method: 'DELETE' });
                        if (response.ok) {
                            loadProducts();
                        }
                    }
                }

                // Initial load on page bootstrap entry
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