# Storefront Backend Project

A TypeScript, Express, and PostgreSQL API for a storefront application. The API supports browsing products, managing users, creating orders, and adding products to orders.

## Requirements

- Node.js 18+ recommended
- Yarn
- PostgreSQL 16+
- Docker and Docker Compose optional, but supported

## Environment Variables

Create a `.env` file in the project root with these values:

```bash
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=storefront_dev
POSTGRES_USER=storefront_user
POSTGRES_PASSWORD=storefront_password
TOKEN_SECRET=your_secret_here
ENV=dev
```

## Setup

1. Install dependencies.

   ```bash
   yarn
   ```

2. Start PostgreSQL.

   The database listens on port `5432`.

   You can start the bundled database with Docker Compose:

   ```bash
   docker compose up -d postgres
   ```

   Or connect the app to an existing PostgreSQL instance by updating the values in `.env`.

3. Run the database migrations.

   ```bash
   npx db-migrate up
   ```

## Running the App

Start the API in development mode with:

```bash
yarn watch
```

The API runs on port `3000`.

To compile the TypeScript sources without starting the server, run:

```bash
yarn build
```

To run the compiled server directly after building:

```bash
yarn start
```

## Testing

Run the TypeScript compile step and the Jasmine test suite with:

```bash
yarn test
```

If you only want the type-check:

```bash
yarn tsc
```

### Postman Collection

This repository includes a Postman collection and environment in the `postman/` folder:

- `postman/Storefront API.postman_collection.json`
- `postman/Storefront API.postman_environment.json`

Import both files into Postman to exercise the API endpoints manually.

## Database Configuration

The app reads its database connection from environment variables and `database.json`.

- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `TOKEN_SECRET`

## API Endpoints

### Products

- `GET /products` - list all products
- `GET /products/:id` - fetch a single product
- `POST /products` - create a product, requires a JWT
- `GET /products/popular` - returns the five most commonly ordered products

### Users

- `GET /users` - list all users, requires a JWT
- `GET /users/:id` - fetch a single user, requires a JWT
- `POST /users` - create a user
- `POST /users/authenticate` - authenticate a user and receive a JWT

### Orders

- `POST /orders` - create an active order for a user, requires a JWT
- `PATCH /orders/:id` - mark an order complete, requires a JWT
- `GET /orders/:user_id` - fetch the current active order for a user, requires a JWT
- `POST /orders/:id/products` - add a product to an order, requires a JWT

## Notes

- CORS is enabled for all routes.
- Authentication is handled with JWTs in the `Authorization: Bearer <token>` header.
- Passwords are stored as hashed values with bcrypt.
