import { Router, Request, Response } from "express";

import verifyAuth from "../middleware/verifyAuth";
import { ProductStore } from "../models/product";

const productStore = new ProductStore();

interface ProductRouteParams {
  id: string;
}

interface CreateProductBody {
  name: string;
  price: number;
  category: string;
}

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

productsRouter.get(
  "/:id",
  async (request: Request<ProductRouteParams>, response: Response) => {
    const id = Number(request.params.id);

    if (Number.isNaN(id)) {
      return response.status(400).json({ error: "Invalid product id" });
    }

    const product = await productStore.show(id);

    if (!product) {
      return response.status(404).json({ error: "Product not found" });
    }

    response.json(product);
  },
);

productsRouter.post(
  "/",
  verifyAuth,
  async (
    request: Request<Record<string, never>, unknown, CreateProductBody>,
    response: Response,
  ) => {
    const product = await productStore.create({
      name: request.body.name,
      price: request.body.price,
      category: request.body.category,
    });
    response.status(201).json(product);
  },
);

export default productsRouter;
