# OmniStock

> **A Cloud-Synchronized, Offline-First Inventory and POS System for Philippine MSMEs**
> Developed in partial fulfillment of the requirements for **MIT 202, Advanced Software Development with Web Application** at Saint Mary's University School of Graduate Studies.

## 📌 Project Overview

OmniStock is a hybrid local-first enterprise solution designed to bridge the gap between business operational continuity and cloud reporting architecture. While modern retail systems assume constant high-speed connectivity, Philippine Micro, Small, and Medium Enterprises face real-world infrastructure constraints, particularly in provincial areas.

OmniStock allows users to execute complete retail workflows, register inventory data assets, and manage point of sale actions with zero active internet access. Data integrity is maintained on a localized Node database before it securely streams updates to a centralized cloud system once connectivity re-establishes.

## ✨ Core Features

* **Offline-First Data Resiliency:** Full data entry execution and storage capability even during total network failure conditions.

* **ACID-Compliant Local Ledger:** Powered by an embedded SQLite architecture that prevents data corruption during unexpected local node shutdowns.

* **UUID Isolation Model:** Employs universally unique identifiers across all primary keys to guarantee background cloud merging without primary key collision risks.

* **Modern Dashboard Interface:** Built using an elegant, lightweight CSS implementation that is fully responsive across desktop systems, tablet views, and mobile smartphones.

* **BIR-Compliance Readiness:** Built-in structural fields optimized for automated non-editable daily tax logging summaries and transaction records.

## 🛠️ System Architecture

OmniStock is structured across three distinct processing tiers to handle local state persistence and cloud state synchronization:

1. **Local Client Tier:** A responsive web dashboard interface that handles user interactions and commits entries locally using a fast embedded file engine.

2. **Synchronization Layer:** A background state manager featuring an outbox transaction queue that detects network presence and resolves merge states automatically.

3. **Centralized Cloud Tier:** A secure distributed microservice backend infrastructure that hosts long-term history tables and global analytics.

## 🚀 Getting Started

Follow these operational steps to build, initialize, and execute the OmniStock localized component workspace inside Visual Studio Code.

### 1. Prerequisites

Ensure that you have installed the recommended runtime platform environment:

* **Node.js** version 18 or later is recommended

* **npm** or Node Package Manager

### 2. File Repository Structure

Verify your local workspace contains these core project files:

* `package.json` is for system metadata configuration and explicit version scopes

* `initDb.js` is for database schema creation and initial base branch seed script

* `app.js` is the active backend gateway logic containing CRUD endpoints and the visual interface

### 3. Dependency Installation

Open the integrated terminal in Visual Studio Code and pull the necessary packages from the public network repository:

<code>npm install</code>

### 4. Database Optimization and Cleanup

If you encounter warning states regarding outdated native tool sub-dependencies, secure the directory workspace configuration with these remediation commands:

<code>npm install uuid@11</code>
<code>npm audit fix --force</code>

### 5. Local Database Initialization

Build the initial internal relational tables before starting up the operational application logic:

<code>node initDb.js</code>

*Confirmation message:* OmniStock local database tables initialized successfully.

### 6. Booting the Application

Launch the live server gateway to start the engine process loop:

<code>node app.js</code>

*Confirmation message:* OmniStock Local Backend Engine active on port 3000

## 💻 Technical Usage Demo

### Web Interface Access

With the backend server running, open any standard modern browser platform on your device and navigate to the application terminal address:

<code>http://localhost:3000/</code>

### API Endpoint Structures

For automated testing via command-line network tools or explicit extension suites, you can interface directly with these raw JSON paths:

* **CREATE [POST]:** `/api/products` is to register a brand new product item into the tracking system ledger.

* **READ ALL [GET]:** `/api/products` is to extract the full listing array of active database entries.

* **READ ONE [GET]:** `/api/products/:id` is to isolate a specific item detail using its unique UUID key descriptor.

* **UPDATE [PUT]:** `/api/products/:id` is to alter attributes or pricing parameters for an existing item layer.

* **DELETE [DELETE]:** `/api/products/:id` is to permanently strip an asset row entry from the internal workspace disk file.

## 📝 Academic Profile Details

* **Institution:** Saint Mary's University, Bayombong, Nueva Vizcaya, Philippines

* **Department:** School of Graduate Studies

* **Coursework:** Master of Information Technology

* **Student Researcher:** IC Ramzil P. Ruiz

* **Course Professor:** Dr. Adonis V. Garces