import amqplib from 'amqplib';

import nodemailer from 'nodemailer';

import dotenv from "dotenv";
import { redisClient } from './index.js';


dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqplib.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

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
            host: "smtp.gmail.com",
            port: 465,
            secure: true, //for aws
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          });

          await transporter.sendMail({
            from: "ChatSphere",
            to,
            subject: "Your OTP",
            text: `Your OTP is ${otp}. It is valid for 5 minutes`,
          });

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send otp", error);
        }
      }
    });
  } catch (error) {
    console.log("Failed to start rabbitmq consumer", error);
  }
};