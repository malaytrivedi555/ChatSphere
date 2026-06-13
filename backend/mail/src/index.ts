import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";
import { createClient } from "redis";

dotenv.config();
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

redisClient.on("connect", () => {
  console.log("Mail service connected to Redis");
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

startSendOtpConsumer();

const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});