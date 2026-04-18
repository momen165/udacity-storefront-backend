import express from "express";
import cors from "cors";

import ordersRouter from "./handlers/orders";
import productsRouter from "./handlers/products";
import usersRouter from "./handlers/users";

const app = express();
const address = "0.0.0.0:3000";

app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, function () {
    console.log(`starting app on: ${address}`);
  });
}

export default app;
