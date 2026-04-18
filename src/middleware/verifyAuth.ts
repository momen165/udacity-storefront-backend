import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyAuth = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    return response
      .status(401)
      .json({ error: "Authorization header is required" });
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ error: "Invalid authorization token" });
  }

  try {
    jwt.verify(token, process.env.TOKEN_SECRET as string);
    return next();
  } catch (_error) {
    return response.status(401).json({ error: "Invalid or expired token" });
  }
};

export default verifyAuth;
