# Pasco Foods MERN Stack Application

A premium, modern web application for **Pasco Foods Limited** showcasing their product catalogue and heritage. Built using the **MERN Stack** (MongoDB, Express, React, Node.js) with a focus on rich aesthetics, interactive UX, and seamless zero-setup testing.

## Key Features

1. **Floating Sticky Navigation Bar**: Transparent header that transitions into a translucent blurred glass effect upon scroll.
2. **Cinematic Hero Showcase**: Captivating high-fidelity food photography overlayed with responsive typography, highlighting brand messages.
3. **Heritage Carousel Section**: Interactive panel detailing Pasco Foods' natural ingredients philosophy since 1990.
4. **Interactive Product Catalogue Grid**:
   - Filter by **Range** (Retail vs Foodservice).
   - Filter by **Category/Pill Slider** (Cooking Sauces, Cooking Pastes, Pickles & Chutneys, Condiments, Pasta Roma Range, Al Rifai Range, Yellow River Range, NYC Range).
   - Filter by **Spiciness/Heat Level** (No Heat, Mild, Medium, Hot, Very Hot).
   - Filter by **Dietary Badges** (Vegetarian, Vegan, Gluten Free).
   - Instant **Fuzzy Search** bar.
5. **Product Detail Modal**: Click on any product to reveal barcodes (Unit & Case), packing specs, and product code details.
6. **Taste Matcher / Spice Finder Wizard**: Interactive multi-step wizard helping users select their preferred heat level, cuisine style, and protein/vegetable to discover recommended products.
7. **Validated Inquiry Form**: A fully responsive contact panel connected to the Express backend to save customer messages in MongoDB or a local backup file.
8. **Double-Safe Database Layer**: Gracefully connects to a local MongoDB instance. If no server is running, it automatically slides into **Local JSON Fallback Mode**, ensuring all features work instantly with zero configuration.

---

## Technical Stack & Architecture

### Backend (`/backend`)
- **Express & Node.js**: Modular routers, controllers, and error boundaries.
- **Mongoose & MongoDB**: Collection models for products and contact inquiries.
- **Db Fallback Logic**: Connects to MongoDB via Mongoose. If connection fails, falls back to in-memory JSON array parsing (`/backend/data/products.json`) and writes inquiries to (`/backend/data/inquiries.json`).
- **Helmet & CORS**: Hardens server headers and configures access control list.

### Frontend (`/frontend`)
- **Vite & React (ES6+)**: Fast build cycles and interactive component updates.
- **Lucide Icons**: High-fidelity modern SVG indicators.
- **Vanilla CSS3 Variable Styling**: Clean, customized color palette (Curry Yellow, Tumeric Ochre, Deep Crimson, Sand Cream) featuring modern fonts (Outfit, Plus Jakarta Sans, Playfair Display) and responsive glassmorphism containers.

---

## Getting Started

Follow these steps to run the client and server concurrently on your local machine:

### 1. Installation
Install root, frontend, and backend packages using the pre-configured script from the workspace root:
```bash
npm run install-all
```

### 2. Seed Database (Optional)
If you have MongoDB running locally (default: `mongodb://127.0.0.1:27017/pasco-foods`), seed the database:
```bash
npm run seed
```
*Note: If MongoDB is not active, the system automatically uses the local JSON dataset, so you can skip this step!*

### 3. Launch Development Mode
Run both the React frontend (Vite) and Express backend concurrently:
```bash
npm run dev
```

Your browser will launch or you can open:
- Frontend Client: [http://localhost:5173](http://localhost:5173)
- Backend API Status: [http://localhost:5000/api/status](http://localhost:5000/api/status)

---

## Project Structure
```
pasco/
├── backend/
│   ├── config/
│   │   └── db.js            # DB connection & fallback switch
│   ├── controllers/
│   │   ├── inquiryController.js
│   │   └── productController.js
│   ├── data/
│   │   ├── inquiries.json   # Local inquiry storage backup
│   │   └── products.json    # Complete catalog seed source
│   ├── models/
│   │   ├── Inquiry.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── inquiryRoutes.js
│   │   └── productRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js              # Database populator
│   └── server.js            # Node API Entry
├── frontend/
│   ├── public/
│   │   └── assets/          # Custom visual food backdrops
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css          # Section layouts & responsiveness
│   │   ├── App.jsx          # Main UI view & logic
│   │   ├── index.css        # Typography tokens & color tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Forward proxy setup for CORS
├── .gitignore
├── package.json             # Root coordination script
└── README.md
```
