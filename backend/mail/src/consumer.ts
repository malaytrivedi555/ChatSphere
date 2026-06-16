import amqplib from 'amqplib';

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

        const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
});
console.log("About to verify SMTP");

await transporter.verify();

console.log("SMTP verified");

console.log("About to send mail to:", to);

await transporter.sendMail({
  from: "malaytrivedi555@gmail.com",
  to,
  subject: "Your OTP",
  text: `Your OTP is ${otp}. It is valid for 5 minutes`,
});

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