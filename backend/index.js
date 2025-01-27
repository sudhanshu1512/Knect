import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import favoriteRoute from "./routes/favorite.route.js";
import bookmarkRoute from "./routes/bookmark.route.js";
import notificationSystemRoute from "./routes/notificationSystem.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: process.env.URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// yha pr apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/favorite", favoriteRoute);
app.use("/api/v1/bookmark", bookmarkRoute);
app.use("/api/v1/notification-system", notificationSystemRoute);

app.use(express.static(path.join(__dirname, "/front/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "front", "dist" , "index.html"));
});

server.listen(PORT, () => {
  connectDB();
  console.log(`Server listen at port ${PORT}`);
});
