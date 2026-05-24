const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./omnistock.db');
const PORT = 3000;

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