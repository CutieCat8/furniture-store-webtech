# Furni Store (Full-Stack E-commerce)

## Overview
Furni is a full-stack e-commerce project built with a static frontend and a Node.js/Express backend. The API uses a Controller-Route-Service pattern, with repositories for data access and SQLite for order storage.

## Architecture
- Frontend: HTML/CSS/JS (static pages) served by Live Server
- Backend: Node.js + Express (REST API)
- Data store: SQLite for orders, JSON files for products and users

### Backend Layers
- Routes: HTTP endpoints and routing
- Controllers: request/response handling
- Services: business logic and validation
- Repositories: data access (SQLite or JSON)

## Project Structure
```
.
├─ about.html
├─ blog.html
├─ cart.html
├─ checkout.html
├─ contact.html
├─ index.html
├─ login.html
├─ order-history.html
├─ register.html
├─ shop.html
├─ thankyou.html
├─ css/
├─ images/
├─ js/
├─ data/
│  └─ json/
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ controllers/
│  ├─ routes/
│  ├─ services/
│  └─ repositories/
└─ store.db
```

## Environment Variables
Create a `.env` file in the project root:

```
PORT=3000
JWT_SECRET=replace-with-strong-secret
USER_SERVICE_URL=http://localhost:3000/mock/user-service/verify
```

Notes:
- `JWT_SECRET` is used for login tokens.
- `USER_SERVICE_URL` is a simulated microservice endpoint used by login.

## Setup
1. Install dependencies
   ```
   npm install
   ```
2. Start the API server
   ```
   npm run dev
   ```
3. Run the frontend with Live Server
   - Open `index.html` or `shop.html` with Live Server

## API Endpoints (Core)
- `POST /api/login` - Login (JWT)
- `POST /api/register` - Register user
- `GET /api/products` - Product list
- `POST /api/checkout` - Checkout and save order
- `GET /api/orders?email=...` - Order history
- `DELETE /api/orders?email=...` - Delete all orders for email
- `DELETE /api/orders/selected` - Delete selected orders

## Why This Architecture
- Clear separation of concerns for maintainability
- Easy to swap data stores or scale services later
- Testable service logic with mock repositories

## Future Improvements
- Replace JSON user storage with a real database
- Add authentication middleware for protected routes
- Move services into independent microservices as needed
