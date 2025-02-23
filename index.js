// server.js
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import schema from "./schema/schema.js";
import resolvers from "./resolvers/resolvers.js";
import dbConnect from "./DB/connection.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: resolvers,
  context: async ({ req }) => {
    console.log("Context function called");
    const { authorization } = req.headers;
    console.log("Authorization header:", authorization);

    if (!authorization) {
      console.log("No authorization header provided");
      return { userId: null, role: null };
    }

    try {
      const decoded = jwt.verify(authorization, process.env.SECRET_KEY);
      console.log("Decoded token:", decoded);
      return {
        authorization,
        userId: decoded.userId,
        role: decoded.role || "user",
      };
    } catch (err) {
      console.error("Token verification error:", err.message);
      return { userId: null, role: null };
    }
  },
});

dbConnect();

const port = 4200;

startStandaloneServer(server, {
  listen: { port },
})
  .then(({ url }) => {
    console.log(`Server listened at ${url}`);
  })
  .catch((err) => {
    console.log(`Error in server: ${err}`);
  });
