import { Router, Request, Response } from "express";

import verifyAuth from "../middleware/verifyAuth";
import { OrderStore } from "../models/order";
import { OrderProductStore } from "../models/orderProduct";

const orderStore = new OrderStore();
const orderProductStore = new OrderProductStore();

interface CreateOrderBody {
  userId?: number | string;
  user_id?: number | string;
}

interface UpdateOrderBody {
  status?: string;
}

interface AddOrderProductBody {
  quantity: number | string;
  productId?: number | string;
  product_id?: number | string;
}

const ordersRouter = Router();

ordersRouter.post(
  "/",
  verifyAuth,
  async (
    request: Request<Record<string, never>, unknown, CreateOrderBody>,
    response: Response,
  ) => {
    const userId = Number(request.body.userId ?? request.body.user_id);

    if (Number.isNaN(userId)) {
      return response
        .status(400)
        .json({ error: "userId must be a valid number" });
    }

    try {
      const order = await orderStore.create(userId);
      response.status(201).json(order);
    } catch (error) {
      response.status(500).json({ error: "Unable to create order" });
    }
  },
);

ordersRouter.patch(
  "/:id",
  verifyAuth,
  async (
    request: Request<Record<string, string>, unknown, UpdateOrderBody>,
    response: Response,
  ) => {
    const orderId = Number(request.params.id);
    const status = String(request.body.status ?? "complete");

    if (Number.isNaN(orderId)) {
      return response.status(400).json({ error: "Invalid order id" });
    }

    try {
      const order = await orderStore.updateStatus(orderId, status);

      if (!order) {
        return response.status(404).json({ error: "Order not found" });
      }

      response.json(order);
    } catch (error) {
      response.status(500).json({ error: "Unable to update order" });
    }
  },
);

ordersRouter.get(
  "/:user_id",
  verifyAuth,
  async (request: Request<Record<string, string>>, response: Response) => {
    try {
      const currentOrder = await orderStore.getCurrentByUserId(
        request.params.user_id,
      );

      if (!currentOrder) {
        return response.status(404).json({ error: "Active order not found" });
      }

      response.json(currentOrder);
    } catch (error) {
      response.status(500).json({ error: "Unable to retrieve current order" });
    }
  },
);

ordersRouter.post(
  "/:id/products",
  verifyAuth,
  async (
    request: Request<Record<string, string>, unknown, AddOrderProductBody>,
    response: Response,
  ) => {
    const quantity = Number(request.body.quantity);
    const rawProductId = request.body.productId ?? request.body.product_id;
    const orderId = Number(request.params.id);
    const productId = Number(rawProductId);

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(orderId) ||
      Number.isNaN(productId)
    ) {
      return response.status(400).json({
        error: "quantity, orderId, and productId must be valid numbers",
      });
    }

    try {
      const addedProduct = await orderProductStore.create(
        quantity,
        orderId,
        productId,
      );

      response.status(201).json(addedProduct);
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return response.status(404).json({ error: "Order not found" });
      }

      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return response.status(404).json({ error: "Product not found" });
      }

      response.status(500).json({ error: "Unable to add product to order" });
    }
  },
);

export default ordersRouter;
