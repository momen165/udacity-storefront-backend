# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These notes describe the endpoints the API supplies and the data shapes agreed between the frontend and backend.

## API Routes

### Products

| Verb | Route             | Auth | Description                               |
| ---- | ----------------- | ---- | ----------------------------------------- |
| GET  | /products         | No   | Return all products                       |
| GET  | /products/:id     | No   | Return one product by id                  |
| POST | /products         | Yes  | Create a new product                      |
| GET  | /products/popular | No   | Return the top five most ordered products |

### Users

| Verb | Route               | Auth | Description                            |
| ---- | ------------------- | ---- | -------------------------------------- |
| GET  | /users              | Yes  | Return all users                       |
| GET  | /users/:id          | Yes  | Return one user by id                  |
| POST | /users              | No   | Create a new user and return a token   |
| POST | /users/authenticate | No   | Authenticate a user and return a token |

### Orders

| Verb  | Route                | Auth | Description                                |
| ----- | -------------------- | ---- | ------------------------------------------ |
| POST  | /orders              | Yes  | Create an active order for a user          |
| PATCH | /orders/:id          | Yes  | Update an order status                     |
| GET   | /orders/:user_id     | Yes  | Return the current active order for a user |
| POST  | /orders/:id/products | Yes  | Add a product to an order                  |

## Database Schema

### users

| Column          | Type               | Notes                  |
| --------------- | ------------------ | ---------------------- |
| id              | SERIAL PRIMARY KEY | Unique user id         |
| first_name      | VARCHAR(100)       | User first name        |
| last_name       | VARCHAR(100)       | User last name         |
| hashed_password | VARCHAR            | Bcrypt-hashed password |

### products

| Column   | Type               | Notes                     |
| -------- | ------------------ | ------------------------- |
| id       | SERIAL PRIMARY KEY | Unique product id         |
| name     | VARCHAR(64)        | Product name              |
| price    | INTEGER            | Product price             |
| category | VARCHAR(64)        | Optional product category |

### orders

| Column  | Type                         | Notes                                   |
| ------- | ---------------------------- | --------------------------------------- |
| id      | SERIAL PRIMARY KEY           | Unique order id                         |
| user_id | INTEGER REFERENCES users(id) | Owner of the order                      |
| status  | VARCHAR(64)                  | Order state, usually active or complete |

### order_products

| Column     | Type                            | Notes                                |
| ---------- | ------------------------------- | ------------------------------------ |
| id         | SERIAL PRIMARY KEY              | Unique join-table id                 |
| quantity   | INTEGER                         | Quantity of the product in the order |
| order_id   | INTEGER REFERENCES orders(id)   | Related order                        |
| product_id | INTEGER REFERENCES products(id) | Related product                      |

## Data Shapes

### Product

- id
- name
- price
- category

### User

- id
- first_name
- last_name
- password

### Order

- id
- user_id
- status

### Order Product

- id
- order_id
- product_id
- quantity
