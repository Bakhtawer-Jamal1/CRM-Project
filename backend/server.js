require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || process.env.Server_PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/deals", require("./routes/dealRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));

app.get("/", (req, res) => {
  res.send("CRM server aur MongoDB chal rahe hain");
});

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI .env mein missing hai");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET .env mein missing hai");
    process.exit(1);
  }

  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server http://localhost:${PORT} par chal raha hai`);
    });
  } catch (error) {
    console.error("Server start nahi hua:", error.message);
    process.exit(1);
  }
}

startServer();