import amqplib from 'amqplib';
import axios from "axios";

import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");


import dotenv from "dotenv";
import { redisClient } from './index.js';


dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqplib.connect(
  process.env.RABBITMQ_URL as string
);

    const channel = await connection.createChannel();

    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Mail Service consumer started, listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, otp } = JSON.parse(msg.content.toString());

          const latestOtp = await redisClient.get(`otp:${to}`);

      if (latestOtp !== otp) {
          console.log(`Skipping stale OTP for ${to}`);
          channel.ack(msg);
          return;
        }

        


console.log("About to send mail to:", to);


await axios.post(
  "https://api.brevo.com/v3/smtp/email",
  {
    sender: {
      name: "ChatSphere",
      email: "malaytrivedi555@gmail.com",
    },
    to: [
      {
        email: to,
      },
    ],
    subject: "Your OTP",
    textContent: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  },
  {
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
  }
);

console.log(`OTP mail sent to ${to}`);
channel.ack(msg);

console.log(`OTP mail sent to ${to}`);

channel.ack(msg);  

        } catch (error) {
  console.error("Failed to send otp:", error);

  if (msg) {
    channel.nack(msg, false, false);
  }
}
      }
    });
  } catch (error) {
    console.log("Failed to start rabbitmq consumer", error);
  }
};