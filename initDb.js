const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omnistock.db');

db.serialize(() => {
    // 1. Create Branches Table
    db.run(`
        CREATE TABLE IF NOT EXISTS branches (
            branch_id TEXT PRIMARY KEY,
            branch_name TEXT NOT NULL,
            address TEXT,
            tin_number TEXT
        )
    `);

    // 2. Create Products Table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT PRIMARY KEY,
            sku_code TEXT UNIQUE NOT NULL,
            product_name TEXT NOT NULL,
            barcode TEXT,
            unit_price REAL NOT NULL,
            reorder_point INTEGER DEFAULT 10
        )
    `);

    // Seed Initial Branch Data for Testing
    db.run(`
        INSERT OR IGNORE INTO branches (branch_id, branch_name, address, tin_number)
        VALUES ('b1111111-2222-3333-4444-555555555555', 'Main Branch', 'Bayombong Nueva Vizcaya', '123-456-789-000')
    `);
});

console.log('OmniStock local database tables initialized successfully.');
db.close();