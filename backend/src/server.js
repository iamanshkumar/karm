import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import listRouter from "./routes/listRoutes.js";
import cardRouter from "./routes/cardRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

connectDB();

// ✅ Secure, Safari-compatible CORS config
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : "http://localhost:5173",
  credentials: true, // ✅ Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ FlowBoard API is running fine");
});

// ✅ API routes
app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/lists", listRouter);
app.use("/api/cards", cardRouter);
app.use("/api/user", userRouter);

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});
