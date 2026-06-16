import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRoutes from './routes/chat.js'
import { app, server} from "./config/socket.js";

dotenv.config();

connectDb();



app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://chat-sphere-ecru-ten.vercel.app/",
    ],
    credentials: true,
  })
);


app.use(express.json());



app.use("/api/v1", chatRoutes)

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});