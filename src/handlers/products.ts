import { Router, Request, Response } from "express";

import verifyAuth from "../middleware/verifyAuth";
import { Product, ProductStore } from "../models/product";

const productStore = new ProductStore();

const productsRouter = Router();

productsRouter.get("/", async (_request: Request, response: Response) => {
  const products = await productStore.index();
  response.json(products);
});

productsRouter.get(
  "/popular",
  async (_request: Request, response: Response) => {
    const products = await productStore.popular();
    response.json(products);
  },
);

productsRouter.get("/:id", async (request: Request, response: Response) => {
  const id = Number(request.params.id);

  if (Number.isNaN(id)) {
    return response.status(400).json({ error: "Invalid product id" });
  }

  const product = await productStore.show(id);

  if (!product) {
    return response.status(404).json({ error: "Product not found" });
  }

  response.json(product);
});

productsRouter.post(
  "/",
  verifyAuth,
  async (request: Request, response: Response) => {
    const product = await productStore.create(request.body as Product);
    response.status(201).json(product);
  },
);

export default productsRouter;
