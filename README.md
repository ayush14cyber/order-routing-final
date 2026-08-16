# 🚚 Order Routing Engine — AI-Powered Warehouse Selection

A full-stack logistics decision platform inspired by Amazon, Flipkart, and Blinkit. Place a customer order and the system **instantly selects the optimal warehouse** based on distance, inventory health, delivery speed, and cost — then generates an **AI-powered business explanation** of why that warehouse was chosen.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Running the Application](#-running-the-application)
- [How the Routing Engine Works](#-how-the-routing-engine-works)
- [Weighted Scoring Formula](#-weighted-scoring-formula)
- [Authentication & Authorization](#-authentication--authorization)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Reference](#-api-reference)
- [Database Models (Schemas)](#-database-models-schemas)
- [Frontend Architecture](#-frontend-architecture)
- [Frontend Pages](#-frontend-pages)
- [Auto-Order Generation (Cron)](#-auto-order-generation-cron)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🔭 Overview

The **Order Routing Engine** is a full-stack web application that simulates a real-world order fulfillment pipeline. When a customer order is placed, the system:

1. **Filters** warehouses — eliminates inactive warehouses and those with insufficient inventory.
2. **Scores** remaining warehouses on four weighted factors (distance, inventory health, delivery speed, and cost) using **Min-Max normalization** so scores are always relative and fair across candidates.
3. **Selects** the warehouse with the highest composite score.
4. **Reserves** inventory at the selected warehouse in real time.
5. **Generates** a natural-language AI explanation (via Groq/Llama 3.1 8B Instant) of the routing decision in plain business English.
6. **Persists** the full decision history (all scores, eliminated warehouses, weights snapshot, AI explanation) for future auditing.

The platform also includes an interactive **Leaflet map** that draws a polyline from the customer to the selected warehouse, a role-based **admin/manager dashboard**, and a configurable **routing weights panel**.

---

## ✨ Key Features

| Category | Feature |
|---|---|
| **Deterministic Routing** | Multi-factor weighted scoring with Min-Max normalization ensures fair, relative comparison across all eligible warehouses — no single metric dominates due to scale differences. |
| **AI Explanations** | Groq SDK + Llama 3.1 8B Instant generates concise, business-friendly plain-English explanations for every routing decision. Scores are explicitly never surfaced to the user. |
| **Interactive Mapping** | Leaflet / React-Leaflet visually draws a dashed polyline from the customer (red pin) to the winning warehouse (green pin) with color-coded markers. |
| **Real-Time Inventory** | Inventory is reserved the exact moment an order is routed — `availableQuantity` decremented, `reservedQuantity` incremented atomically. |
| **Role-Based Access** | JWT-authenticated users with `admin` and `manager` roles see different sidebar items and have different API permissions enforced on the backend. |
| **Configurable Weights** | Admin can tune the four scoring weights (distance, inventory, delivery, cost) via a dedicated settings page with live sliders — weights must always sum to exactly 100. |
| **Auto-Order Cron** | Optional `node-cron` job generates and routes a random order every 30 seconds to simulate live traffic. |
| **Random Order Generator** | One-click button on the Orders page generates and routes a random order with a random Indian customer name, coordinates, product, and quantity (1–5). |
| **Full Audit History** | Every routing decision (all candidate scores, eliminated warehouses, config weights snapshot, AI explanation) is stored and browsable in the Routing History UI. |
| **Premium Dark UI** | Material UI v9 dark theme with glassmorphism cards, backdrop blur, and vibrant purple/cyan accents on a near-black background. |

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 19.x | SPA framework |
| **Build Tool** | Vite | 8.x | Dev server and production bundler |
| **UI Library** | Material UI (MUI) | 9.x | Dark-themed component library |
| **Icons** | Lucide React | 1.18.x | Sidebar and dashboard icons |
| **Routing** | React Router DOM | 7.x | Client-side page routing |
| **HTTP Client** | Axios | 1.18.x | API communication with request/response interceptors |
| **Map** | Leaflet + React-Leaflet | 1.9.x / 5.x | Interactive map with markers and polylines |
| **Backend** | Node.js + Express | 5.x | REST API server |
| **Database** | MongoDB Atlas + Mongoose | 9.x | Document storage and ODM |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | 9.x / 3.x | Token-based auth with password hashing |
| **AI** | Groq SDK (Llama 3.1 8B Instant) | 1.2.x | Natural-language routing explanations |
| **Scheduling** | node-cron | 4.x | Optional auto-order generation |
| **Testing** | mongodb-memory-server | 11.x | In-memory MongoDB for integration tests |

---

## 📂 Project Structure

```
order-routing-engine/
│
├── README.md                       # This file
├── .gitignore                      # Git ignore rules
│
├── client/                         # ────── React Frontend (Vite) ──────
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── public/                     # Static assets (favicon, etc.)
│   └── src/
│       ├── main.jsx                # React DOM render entry
│       ├── App.jsx                 # Root component with all client-side routes
│       ├── App.css                 # Global styles
│       ├── index.css               # CSS reset / base
│       ├── theme.js                # MUI dark theme configuration
│       ├── api/
│       │   └── axios.js            # Axios instance with auth interceptors
│       ├── context/
│       │   └── AuthContext.jsx     # React Context for auth state (persisted in localStorage)
│       ├── components/
│       │   ├── Layout.jsx          # Persistent sidebar (240px) + main content layout
│       │   └── ProtectedRoute.jsx  # Route guard (auth check + optional role check)
│       └── pages/
│           ├── Login.jsx                # Login page (username + password + role)
│           ├── Register.jsx             # User registration page
│           ├── Dashboard.jsx            # Admin dashboard (4 stat cards)
│           ├── WarehouseManagement.jsx  # CRUD for warehouses (Admin only)
│           ├── InventoryManagement.jsx  # View/update inventory with low-stock badges
│           ├── OrderManagement.jsx      # Order list + route order form + random generator
│           ├── RoutingDecision.jsx      # Decision details + Leaflet map + scores table
│           ├── RoutingHistory.jsx       # Historical routing log (all past decisions)
│           ├── WarehouseMap.jsx         # Full-page Leaflet map of all warehouses
│           └── RoutingSettings.jsx      # Configure routing weights with live sliders
│
└── server/                         # ────── Node.js Backend (Express) ──────
    ├── package.json                # Backend dependencies
    ├── server.js                   # Express app entry point + MongoDB connection + cron
    ├── seed.js                     # Database seeding script (clears + repopulates)
    ├── test_routes.js              # Integration test script (uses in-memory MongoDB)
    ├── controllers/
    │   ├── authController.js       # Register & login logic
    │   ├── configController.js     # Get/update routing config (weights)
    │   ├── inventoryController.js  # CRUD inventory
    │   ├── orderController.js      # CRUD orders + random order generation endpoint
    │   ├── productController.js    # CRUD products
    │   ├── routingController.js    # Route order + fetch routing history endpoints
    │   └── warehouseController.js  # CRUD warehouses
    ├── middleware/
    │   └── authMiddleware.js       # JWT verification (verifyToken) + role guard (requireRole)
    ├── models/
    │   ├── Inventory.js            # Inventory schema (warehouseId, productId, qty)
    │   ├── Order.js                # Order schema (customer, product, status, warehouse)
    │   ├── Product.js              # Product schema (name, category, SKU)
    │   ├── RoutingConfig.js        # Singleton routing weights document
    │   ├── RoutingHistory.js       # Decision audit log (all scores, weights, AI text)
    │   ├── User.js                 # User schema with bcrypt pre-save hook
    │   └── Warehouse.js            # Warehouse schema (name, city, lat, lng, capacity)
    ├── routes/
    │   ├── authRoutes.js           # POST /register, /login
    │   ├── configRoutes.js         # GET/PUT /config
    │   ├── inventoryRoutes.js      # POST/GET/PUT /inventory
    │   ├── orderRoutes.js          # POST/GET/PUT /orders, POST /generate-random
    │   ├── productRoutes.js        # POST/GET /products
    │   ├── routingRoutes.js        # POST /route-order, GET /routing-history
    │   └── warehouseRoutes.js      # POST/GET/PUT /warehouses
    └── services/
        ├── routingEngine.js        # Core algorithm: Haversine + Min-Max normalization + weighted scoring
        ├── aiExplanation.js        # Groq/Llama 3.1 prompt builder + API call
        ├── orderService.js         # End-to-end order processing pipeline
        └── orderGenerator.js       # Random order generator for cron and manual trigger
```

---

## 📋 Prerequisites

Before running the project, make sure you have:

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | >= 18.x | Required for both client and server |
| **npm** | >= 9.x | Comes bundled with Node.js |
| **MongoDB Atlas** | — | Free tier (M0) works perfectly. You need a connection URI. |
| **Groq API Key** | — | Free at [console.groq.com](https://console.groq.com). Used for AI explanations. Optional — the app works gracefully without it. |
| **Git** | Any | To clone the repository |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/order-routing-engine.git
cd order-routing-engine
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server/` directory (see the [Environment Variables](#-environment-variables) section below for all keys).

### 5. Seed the Database

```bash
cd server
node seed.js
```

> This populates MongoDB with 2 users, 5 warehouses, 3 products, 15 inventory records, and the default routing config.

### 6. Start the Backend

```bash
cd server
node server.js
```

> The server starts on `http://localhost:5000` by default.

### 7. Start the Frontend

Open a **new terminal**:

```bash
cd client
npm run dev
```

> The Vite dev server starts on `http://localhost:5173` by default.

---

## 🔑 Environment Variables

Create a `.env` file in the **`server/`** directory with the following keys:

```env
# Server port (defaults to 5000 if not set)
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/order_routing

# Groq API key for AI explanations (optional — skipped gracefully if missing)
GROQ_API_KEY=gsk_your_groq_api_key_here

# JWT secret for signing tokens (falls back to 'fallback_secret_if_missing' if not set)
JWT_SECRET=your_jwt_secret_here

# Set to 'true' to enable the auto-order cron job (optional, default: false)
ENABLE_AUTO_ORDERS=false
```

> **Note**: The server connects to MongoDB Atlas with `tls: true` and `tlsAllowInvalidCertificates: true` flags. If you are connecting to a local MongoDB instance without TLS, you may need to remove those flags from `server.js`.

The frontend uses a Vite environment variable to configure the API base URL. It defaults to `http://localhost:5000/api`. To override it, create a `.env` file in the **`client/`** directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌱 Database Seeding

The `seed.js` script wipes and repopulates the database with sample data for immediate testing:

```bash
cd server
node seed.js
```

### What Gets Seeded

| Collection | Count | Data |
|---|---|---|
| **Users** | 2 | `admin` / `admin123` (admin role), `manager` / `manager123` (manager role) |
| **Routing Config** | 1 | Default weights: Distance 35%, Inventory 35%, Delivery 20%, Cost 10% |
| **Warehouses** | 5 | Each with unique logistics attributes (see table below) |
| **Products** | 3 | Laptop (ELEC-LAP-001), Smartphone (ELEC-PHO-002), Headphones (ELEC-HDP-003) |
| **Inventory** | 15 | One entry per warehouse × product. Random quantities (5–50). Some deliberately set low (2, 5, 8) to trigger low-stock badges. |

**Seeded Warehouse Logistics Attributes:**

| Warehouse | Dispatch Time | Cost/km | Shipment Speed |
|---|---|---|---|
| Mumbai Central Hub | 12h | ₹5/km | 220 km/day |
| Delhi NCR Depot | 24h | ₹7/km | 200 km/day |
| Bangalore Tech Park Storage | 36h | ₹6/km | 180 km/day |
| Chennai Coastal Warehouse | 48h | ₹9/km | 160 km/day |
| Hyderabad Logistics Center | 18h | ₹8/km | 190 km/day |

> ⚠️ **Warning**: Running `seed.js` **deletes all existing data** in the following collections before inserting fresh seed data: Warehouses, Products, Inventory, Orders, RoutingHistory, Users, RoutingConfig.

---

## ▶️ Running the Application

### Development Mode (Recommended)

**Terminal 1 — Backend:**

```bash
cd server
node server.js
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

Log in with the seeded credentials:
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`

### Production Build (Frontend Only)

```bash
cd client
npm run build     # Outputs to client/dist/
npm run preview   # Serve the production build locally
```

---

## ⚙️ How the Routing Engine Works

When an order is submitted, it flows through a multi-step pipeline defined in `server/services/routingEngine.js` and orchestrated by `server/services/orderService.js`:

```
1. Order Placed
      ↓
2. Filter: Remove Inactive Warehouses
      ↓
3. Filter: Remove Warehouses with Insufficient Stock
      ↓
4. Calculate Haversine Distance (km) for Each Eligible Warehouse
      ↓
5. Compute 4 Raw Factor Scores per Warehouse
      ↓
6. Apply Min-Max Normalization Across All Candidates
      ↓
7. Compute Weighted Final Score per Warehouse
      ↓
8. Select Warehouse with Highest Final Score
      ↓
9. Reserve Inventory (availableQty--, reservedQty++)
      ↓
10. Generate AI Explanation via Groq (Llama 3.1 8B Instant)
      ↓
11. Persist Order + RoutingHistory documents to MongoDB
```

### Step-by-Step Breakdown

| Step | Description | Code Location |
|---|---|---|
| **1. Receive Order** | API receives `customerLat`, `customerLng`, `productId`, `quantity`, `customerName`. | `routingController.js` → `orderService.js` |
| **2. Query Inventory** | Find all inventory entries for the requested product, populating each entry's `warehouseId`. | `orderService.js` |
| **3. Eliminate Ineligible** | Remove warehouses with `activeStatus !== true` or `availableQuantity < quantity`. Record elimination reasons for audit. | `routingEngine.js` lines 48–62 |
| **4. Haversine Distance** | Calculate the great-circle distance (km) between the customer and each eligible warehouse. Earth radius = 6,371 km. | `routingEngine.js` — `getDistanceFromLatLonInKm()` |
| **5. Raw Scores** | Compute four raw factor values per warehouse (before normalization). | `routingEngine.js` lines 86–113 |
| **6. Min-Max Normalize** | Scale all raw scores to [0, 1] relative to the best and worst candidates. If all warehouses tie on a factor, every warehouse gets a score of 1. | `routingEngine.js` lines 115–148 |
| **7. Weighted Final Score** | Combine normalized scores using the configured weights from `RoutingConfig`. | `routingEngine.js` line 125 |
| **8. Select Best** | Pick the warehouse with the highest `finalScore`. | `routingEngine.js` lines 144–148 |
| **9. Reserve Inventory** | Decrement `availableQuantity` and increment `reservedQuantity` by the order quantity, then save to DB. | `orderService.js` lines 36–38 |
| **10. AI Explanation** | Send a structured prompt to Groq (Llama 3.1 8B Instant) with all metrics and rejected warehouses. Returns a 3-sentence business-friendly explanation. Scores are never mentioned to the user. | `aiExplanation.js` |
| **11. Persist** | Create an `Order` document (status: `assigned`) and a `RoutingHistory` document with full scoring data, eliminated warehouses, weights snapshot, and AI text. | `orderService.js` lines 41–82 |

---

## 🧮 Weighted Scoring Formula

The final routing score for each warehouse is computed in **two passes**:

### Pass 1 — Raw Scores

| Factor | Raw Formula | Description |
|---|---|---|
| **Distance** | `1 / (1 + distance_km)` | Inverse Haversine distance. Closer warehouses produce a higher raw value. |
| **Inventory Health** | `availableQty / (availableQty + reservedQty)` | Ratio of available to total stock. A warehouse with more unreserved stock scores higher. |
| **Delivery Speed** | `1 / delivery_days` | `delivery_days = (distance_km / warehouse.shipmentSpeed) + (warehouse.dispatchTime / 24)`. Combines real transit time with per-warehouse dispatch overhead. Fewer total days = higher score. |
| **Cost** | `1 / (1 + cost)` | `cost = distance_km × warehouse.costPerKm`. Each warehouse has its own ₹/km rate. Lower total cost = higher score. |

### Pass 2 — Min-Max Normalization

Each raw score is scaled relative to all eligible candidates:

```
normalizedScore = (rawScore - minRaw) / (maxRaw - minRaw)
```

If `maxRaw === minRaw` (all candidates produce identical raw scores for a factor), every warehouse receives a normalized score of `1` for that factor.

### Final Composite Score

```
finalScore = (wDist × distScore) + (wInv × invScore) + (wDel × delScore) + (wCost × costScore)
```

Where `wDist`, `wInv`, `wDel`, `wCost` are the configured weights divided by 100.

**Default Weights:**

| Factor | Default Weight |
|---|---|
| Distance | 35% |
| Inventory Health | 35% |
| Delivery Speed | 20% |
| Shipping Cost | 10% |

> **Weights are configurable** via the Routing Settings page (admin only). They must always sum to exactly 100. The configuration is stored as a singleton document in the `RoutingConfig` collection and fetched fresh on every routing call.

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration** — `POST /api/auth/register` creates a user with a bcrypt-hashed password (10 salt rounds via a Mongoose pre-save hook).
2. **Login** — `POST /api/auth/login` validates credentials and returns a signed JWT (8-hour expiry).
3. **Token Attachment** — The frontend Axios request interceptor reads the token from `localStorage` (key: `auth_user`) and attaches it as a `Bearer` token on every outgoing request.
4. **Token Verification** — The `verifyToken` middleware decodes the JWT and injects `req.user` (containing `id`, `username`, `role`) for use by downstream handlers.
5. **Auto-Logout** — The Axios response interceptor catches `401`/`403` errors, clears `localStorage`, and redirects the user to `/login`.

### Middleware

| Middleware | Signature | Purpose |
|---|---|---|
| `verifyToken` | `(req, res, next)` | Validates the JWT from the `Authorization: Bearer <token>` header. Returns `401` for expired or invalid tokens. |
| `requireRole` | `(...roles) => (req, res, next)` | Checks `req.user.role` against the allowed roles array. Returns `403 Forbidden` if the role is not permitted. |

---

## 👥 User Roles & Permissions

| Feature / Page | Admin | Manager |
|---|---|---|
| **Dashboard** (stats overview) | ✅ | ❌ |
| **Warehouse Management** (add/edit warehouses) | ✅ | ❌ |
| **Inventory Management** (view/update stock) | ✅ | ✅ |
| **Order Management** (view orders, mark fulfilled) | ✅ | ✅ |
| **Route an Order** (run routing engine) | ✅ | ❌ |
| **Generate Random Order** | ✅ | ❌ |
| **Routing Decision** (view decision details + map) | ✅ | ✅ |
| **Routing History** (browse past decisions) | ✅ | ✅ |
| **Warehouse Map** (interactive Leaflet map) | ✅ | ✅ |
| **Routing Settings** (configure weights) | ✅ | ❌ |
| **Create Products** | ✅ | ❌ |

### Default Credentials (from Seed)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Most endpoints require a valid JWT token via the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | — | Register a new user |
| `POST` | `/api/auth/login` | ❌ | — | Login and receive a JWT token |

#### `POST /api/auth/register`

```json
// Request Body
{
  "username": "newuser",
  "password": "securepassword",
  "role": "admin"
}

// Response (201 Created)
{
  "success": true,
  "data": { "username": "newuser", "role": "admin" },
  "message": "User registered successfully"
}
```

#### `POST /api/auth/login`

```json
// Request Body
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}

// Response (200 OK)
{
  "success": true,
  "data": { "token": "eyJhbGciOi...", "username": "admin", "role": "admin" },
  "message": "Logged in successfully"
}
```

---

### Warehouses

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/warehouses` | ✅ | Admin | Create a new warehouse |
| `GET` | `/api/warehouses` | ✅ | Any | List all warehouses |
| `GET` | `/api/warehouses/:id` | ✅ | Any | Get a warehouse by ID |
| `PUT` | `/api/warehouses/:id` | ✅ | Admin | Update a warehouse |

#### `POST /api/warehouses`

```json
{
  "warehouseName": "Kolkata Eastern Hub",
  "city": "Kolkata",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "capacity": 7000,
  "activeStatus": true
}
```

---

### Products

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/products` | ✅ | Admin | Create a new product |
| `GET` | `/api/products` | ✅ | Any | List all products |

#### `POST /api/products`

```json
{
  "productName": "Tablet",
  "category": "Electronics",
  "sku": "ELEC-TAB-004"
}
```

---

### Inventory

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/inventory` | ✅ | Admin | Create an inventory record |
| `GET` | `/api/inventory` | ✅ | Any | List all inventory (populated with warehouse & product names) |
| `PUT` | `/api/inventory/:id` | ✅ | Admin, Manager | Update inventory quantities |

#### `PUT /api/inventory/:id`

```json
{
  "availableQuantity": 100,
  "reservedQuantity": 5
}
```

---

### Orders

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/orders` | ✅ | Admin | Create an order manually (without routing) |
| `POST` | `/api/orders/generate-random` | ✅ | Admin | Generate a random order and route it immediately |
| `GET` | `/api/orders` | ✅ | Any | List all orders (populated with product & warehouse) |
| `GET` | `/api/orders/:id` | ✅ | Any | Get a specific order by ID |
| `PUT` | `/api/orders/:id` | ✅ | Admin, Manager | Update an order (e.g., mark as fulfilled) |

---

### Routing

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/routing/route-order` | ✅ | Admin | Run the full routing engine for an order |
| `GET` | `/api/routing/routing-history` | ✅ | Any | Get all routing history (sorted newest first) |
| `GET` | `/api/routing/routing-history/:orderId` | ✅ | Any | Get routing history for a specific order ID |

#### `POST /api/routing/route-order`

```json
// Request Body
{
  "customerLat": 18.5204,
  "customerLng": 73.8567,
  "productId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "quantity": 2,
  "customerName": "Rahul Sharma"
}

// Response (200 OK)
{
  "success": true,
  "message": "Order routed successfully",
  "data": {
    "order": { },
    "selectedWarehouse": { },
    "routingScore": 0.8542,
    "routingReason": "Mumbai Central Hub was selected because it offers the best balance of proximity and inventory availability...",
    "allScores": [
      {
        "warehouseName": "Mumbai Central Hub",
        "distance_km": 123.45,
        "delivery_days": 3,
        "cost": 617.25,
        "distScore": 1.0,
        "invScore": 0.875,
        "delScore": 0.5,
        "costScore": 1.0,
        "distWeighted": 0.35,
        "invWeighted": 0.3063,
        "delWeighted": 0.1,
        "costWeighted": 0.1,
        "finalScore": 0.8563,
        "inventory": 42
      }
    ],
    "eliminatedWarehouses": [
      {
        "warehouseName": "Chennai Coastal Warehouse",
        "availableQuantity": 1,
        "reason": "Insufficient stock"
      }
    ],
    "weights": {
      "distanceWeight": 35,
      "inventoryWeight": 35,
      "deliveryWeight": 20,
      "costWeight": 10
    }
  }
}
```

---

### Routing Configuration

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/config` | ✅ | Any | Get current routing weights |
| `PUT` | `/api/config` | ✅ | Admin | Update routing weights (must sum to exactly 100) |

#### `PUT /api/config`

```json
// Request Body
{
  "distanceWeight": 40,
  "inventoryWeight": 30,
  "deliveryWeight": 20,
  "costWeight": 10
}

// Validation: all four weights must sum to exactly 100
```

---

## 🗄️ Database Models (Schemas)

### User

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | String | ✅ | Unique |
| `password` | String | ✅ | Auto-hashed via bcrypt pre-save hook (10 salt rounds) |
| `role` | String (enum) | ✅ | `"admin"` or `"manager"` |
| `createdAt` | Date | — | Defaults to `Date.now` |

### Warehouse

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `warehouseName` | String | ✅ | — | e.g., `"Mumbai Central Hub"` |
| `city` | String | ✅ | — | e.g., `"Mumbai"` |
| `latitude` | Number | ✅ | — | GPS latitude |
| `longitude` | Number | ✅ | — | GPS longitude |
| `capacity` | Number | ✅ | — | Max storage capacity |
| `activeStatus` | Boolean | — | `true` | Inactive warehouses are excluded from routing. |
| `dispatchTime` | Number | — | `24` | Hours before the warehouse begins shipping an order |
| `costPerKm` | Number | — | `5` | Warehouse-specific shipping rate in ₹ per km |
| `shipmentSpeed` | Number | — | `200` | Speed of the delivery network in km per day |
| `createdAt` | Date | — | `Date.now` | — |

### Product

| Field | Type | Required | Notes |
|---|---|---|---|
| `productName` | String | ✅ | e.g., `"Laptop"` |
| `category` | String | ✅ | e.g., `"Electronics"` |
| `sku` | String | ✅ | Unique SKU identifier (e.g., `"ELEC-LAP-001"`) |
| `createdAt` | Date | — | Defaults to `Date.now` |

### Inventory

| Field | Type | Required | Notes |
|---|---|---|---|
| `warehouseId` | ObjectId → Warehouse | ✅ | Reference to the Warehouse |
| `productId` | ObjectId → Product | ✅ | Reference to the Product |
| `availableQuantity` | Number | ✅ | Available stock (decremented when an order is routed) |
| `reservedQuantity` | Number | ✅ | Reserved stock (incremented when an order is routed) |
| `updatedAt` | Date | — | Defaults to `Date.now` |

### Order

| Field | Type | Required | Notes |
|---|---|---|---|
| `customerName` | String | ✅ | e.g., `"Rahul Sharma"` |
| `customerLatitude` | Number | ✅ | Customer GPS latitude |
| `customerLongitude` | Number | ✅ | Customer GPS longitude |
| `productId` | ObjectId → Product | ✅ | Reference to the Product ordered |
| `quantity` | Number | ✅ | Order quantity |
| `assignedWarehouseId` | ObjectId → Warehouse | — | Set by the routing engine upon successful routing |
| `status` | String (enum) | — | `"pending"`, `"assigned"`, or `"fulfilled"` (default: `"pending"`) |
| `createdAt` | Date | — | Defaults to `Date.now` |

### RoutingConfig (Singleton)

| Field | Type | Required | Notes |
|---|---|---|---|
| `distanceWeight` | Number | ✅ | Default: `35` |
| `inventoryWeight` | Number | ✅ | Default: `35` |
| `deliveryWeight` | Number | ✅ | Default: `20` |
| `costWeight` | Number | ✅ | Default: `10` |
| `updatedBy` | ObjectId → User | — | The admin user who last updated this config |
| `updatedAt` | Date | — | Defaults to `Date.now` |

### RoutingHistory

| Field | Type | Required | Notes |
|---|---|---|---|
| `orderId` | ObjectId → Order | ✅ | The order this decision belongs to |
| `warehouseId` | ObjectId → Warehouse | — | The selected (winning) warehouse |
| `routingScore` | Number | — | Final composite score of the winner |
| `routingReason` | String | — | AI-generated business explanation text |
| `allScores` | Array (Mixed) | — | Full scoring data for all candidate warehouses |
| `eliminatedWarehouses` | Array (Mixed) | — | Warehouses excluded from scoring and their reasons |
| `weights` | Mixed | — | Snapshot of the four routing weights used for this specific decision |
| `createdAt` | Date | — | Defaults to `Date.now` |

---

## 🎨 Frontend Architecture

### Theme

The application uses a **custom MUI dark theme** defined in `client/src/theme.js`:

- **Background**: Near-black (`#0a0a0f`) with translucent paper surfaces
- **Primary color**: Vibrant purple (`#7c3aed`)
- **Secondary color**: Cyan (`#06b6d4`)
- **Cards**: Glassmorphism effect with `backdrop-filter: blur(10px)` and semi-transparent borders
- **Typography**: Inter font family
- **Buttons**: Rounded corners, no text transform

### State Management

- **AuthContext** (`client/src/context/AuthContext.jsx`) — React Context manages authentication state (`user`, `login()`, `logout()`). State is persisted in `localStorage` under the key `auth_user` and rehydrated on page load.

### API Layer

- **Axios instance** (`client/src/api/axios.js`) — Pre-configured with:
  - `baseURL` pointing to `VITE_API_URL` (defaults to `http://localhost:5000/api`)
  - **Request interceptor**: Reads `auth_user` from `localStorage` and attaches `Authorization: Bearer <token>` to every request
  - **Response interceptor**: Catches `401`/`403` responses, clears `localStorage`, and redirects to `/login`

### Route Protection

- **ProtectedRoute** component wraps pages that require authentication. Accepts an optional `allowedRoles` prop (e.g., `['admin']`) to further restrict access by role. Unauthenticated users are redirected to `/login`; unauthorized roles are redirected to `/`.

### Layout

- **Persistent sidebar** (240px wide) with Lucide React icons. Items are filtered at render time based on the logged-in user's role.
- **Active state**: Highlighted with a purple background and a right-border accent on the active route.
- **Logout button** at the bottom of the sidebar.
- **Main content area** renders the `<Outlet />` from React Router.

---

## 📄 Frontend Pages

| Page | Route | Role | Description |
|---|---|---|---|
| **Login** | `/login` | Public | Username + password + role selector. Redirects to `/` on success. |
| **Register** | `/register` | Public | User registration form. |
| **Dashboard** | `/` | Admin | 4 stat cards: Total Warehouses, Total Products, Active Orders (assigned), Fulfilled Orders. |
| **Warehouse Management** | `/warehouses` | Admin | Table of warehouses with Add Warehouse form and edit functionality. Includes active/inactive toggle. |
| **Inventory Management** | `/inventory` | Admin, Manager | Table of inventory per warehouse × product with editable quantities. Low-stock badges appear below threshold. |
| **Order Management** | `/orders` | Admin, Manager | Table of all orders with status chips. Includes the Route Order form and Generate Random Order button (admin only). |
| **Routing Decision** | `/routing-decision` or `/routing-decision/:orderId` | Admin, Manager | Leaflet map with red (customer) / green (winner) markers and a dashed purple polyline. AI explanation card. Scoring table with all candidates sorted by final score (winner highlighted). Eliminated warehouses table with reason chips. |
| **Routing History** | `/routing-history` | Admin, Manager | Historical log of all routing decisions (newest first) with links to the full decision view. |
| **Warehouse Map** | `/map` | Admin, Manager | Full-page Leaflet map showing all warehouse locations with name popups. |
| **Routing Settings** | `/routing-settings` | Admin | Slider controls for each of the four scoring weights. Live total display (green = 100%, red otherwise). Save button disabled until total equals exactly 100%. Shows last-updated metadata. |

---

## ⏰ Auto-Order Generation (Cron)

The server supports **automatic order generation** using `node-cron`. When enabled, a random order is generated and routed every **30 seconds**.

### Enabling

Set the environment variable in `server/.env`:

```env
ENABLE_AUTO_ORDERS=true
```

### How It Works

1. A cron job runs every 30 seconds (`*/30 * * * * *` — 6-field cron expression including seconds).
2. Picks a random customer name from a preset list ("Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Reddy", "Vikram Singh", "Anjali Gupta", "Rohan Mehta", "Kavya Nair") and appends a random 3-digit number.
3. Generates a random latitude/longitude within India (lat: 8.4–37.6, lng: 68.7–97.25).
4. Picks a random product from the database and a random quantity (1–5).
5. Runs the full routing pipeline via `orderService.processAndRouteOrder()` — identical logic to a manual order.
6. Logs the result: `[CRON] Auto-order created: Priya Patel 742 → Mumbai Central Hub (score: 0.8214)`

### Manual Random Order

Trigger a single random order via the API:

```bash
POST /api/orders/generate-random
Authorization: Bearer <admin_token>
```

Or click the **"Generate Random Order"** button on the Orders page in the frontend.

---

## 🧪 Testing

### Integration Tests

The project includes an integration test script at `server/test_routes.js` that uses `mongodb-memory-server` to run tests against an isolated in-memory MongoDB instance.

```bash
cd server
node test_routes.js
```

### What the Tests Cover

1. **Database Setup** — Spins up an in-memory MongoDB instance and connects Mongoose.
2. **Express Test Server** — Starts a separate Express server on port `5001`.
3. **Seed Test Data** — Creates 2 warehouses (Mumbai: 50 units, Delhi: 2 units), 1 product (Laptop), and inventory entries.
4. **`GET /api/warehouses`** — Verifies warehouse listing returns exactly 2 results.
5. **`POST /api/routing/route-order`** — Sends an order from Pune (lat: 18.5204, lng: 73.8567, quantity: 1) and verifies `success: true`, a selected warehouse, and presence of `allScores` and `eliminatedWarehouses` arrays.
6. **Teardown** — Gracefully closes the server, disconnects Mongoose, and stops the in-memory MongoDB instance.

### Manual API Testing

You can test any endpoint using **cURL**, **Postman**, or **Thunder Client**:

```bash
# 1. Login to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'

# 2. Use the token to list warehouses
curl http://localhost:5000/api/warehouses \
  -H "Authorization: Bearer <your_token>"

# 3. Route an order
curl -X POST http://localhost:5000/api/routing/route-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "customerLat": 18.5204,
    "customerLng": 73.8567,
    "productId": "<product_id>",
    "quantity": 1,
    "customerName": "Test User"
  }'
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| **`Failed to connect to MongoDB`** | Verify your `MONGODB_URI` in `server/.env`. Ensure your machine's IP is whitelisted in MongoDB Atlas under Network Access → Add IP Address. |
| **`AI explanation skipped because GROQ_API_KEY is not set`** | Expected if you have not set `GROQ_API_KEY`. The app still works — routing proceeds correctly and AI explanations are simply omitted. |
| **`Token expired` or auto-logout** | JWT tokens expire after 8 hours. Simply log in again. |
| **CORS errors** | The backend uses `cors()` with default settings (allows all origins). If deploying to a custom domain, configure specific allowed origins. |
| **`No eligible warehouses with sufficient stock found`** | The requested quantity exceeds available stock in all active warehouses. Re-run `node seed.js` to restore inventory, or manually update quantities via the Inventory page. |
| **Leaflet map tiles not loading** | Ensure you have internet access. Map tiles are loaded from the OpenStreetMap CDN. |
| **Vite dev server cannot connect to backend** | Ensure the backend is running on port 5000. Check `VITE_API_URL` in `client/.env`. |
| **`MongoServerSelectionError: connection timed out`** | Increase `serverSelectionTimeoutMS` in `server.js`, or check your MongoDB Atlas cluster status and network connectivity. |
| **Delivery days seem arbitrary** | Delivery days are intentionally deterministic and hash-based (`productName + warehouseName`). The same product/warehouse pair always yields the same value (1–7 days), but different combinations will differ. This is by design. |

---

## 📜 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with love using React, Express, MongoDB, and Groq AI
</p>
