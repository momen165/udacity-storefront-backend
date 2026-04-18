import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

import verifyAuth from "../middleware/verifyAuth";
import { User, UserStore } from "../models/user";

const userStore = new UserStore();

const signToken = (user: Omit<User, "password">) => {
  return jwt.sign(user, process.env.TOKEN_SECRET as string);
};

const usersRouter = Router();

usersRouter.get(
  "/",
  verifyAuth,
  async (_request: Request, response: Response) => {
    const users = await userStore.index();
    response.json(users);
  },
);

usersRouter.get(
  "/:id",
  verifyAuth,
  async (request: Request, response: Response) => {
    const id = Number(request.params.id);

    if (Number.isNaN(id)) {
      return response.status(400).json({ error: "Invalid user id" });
    }

    const user = await userStore.show(id);

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    response.json(user);
  },
);

usersRouter.post("/", async (request: Request, response: Response) => {
  const user = await userStore.create(request.body as User);
  const token = signToken(user);

  response.status(201).json({ ...user, token });
});

usersRouter.post(
  "/authenticate",
  async (request: Request, response: Response) => {
    const username = request.body.username ?? request.body.first_name;

    const user = await userStore.authenticate(username, request.body.password);

    if (!user) {
      return response
        .status(401)
        .json({ error: "The username and password do not match" });
    }

    const token = signToken(user);

    response.json({ ...user, token });
  },
);

export default usersRouter;
