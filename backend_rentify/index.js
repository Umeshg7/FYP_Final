const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const http = require("http");
const socketio = require("socket.io");

// Initialize Express app
const app = express();
const port = process.env.PORT || 6001;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// 🛠️ Validate Required Environment Variables
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.ACCESS_TOKEN_SECRET) {
    console.error("❌ Missing environment variables. Check your .env file.");
    process.exit(1);
}

// 🛠️ Middleware
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// 🛠️ MongoDB Configuration
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@rentifyhub.6poib.mongodb.net/rentifyhub-umesh-db?retryWrites=true&w=majority&appName=rentifyhub`;

mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((error) => {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

// 🛠️ Configure Socket.io
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a user-specific room when authenticated
    socket.on("joinUser", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Make io accessible to routes
app.set("io", io);

// 🛠️ JWT Token Generation
app.post("/jwt", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required for token generation" });

        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        console.log("🔑 JWT Token Generated:", token);
        res.json({ token });
    } catch (error) {
        console.error("❌ JWT Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 🛠️ Import Routes
const rentRoutes = require("./api/routes/RentRoutes");
const userRoutes = require("./api/routes/userRoutes");
const kycRoutes = require("./api/routes/KYCRoutes");
const bookingRoutes = require("./api/routes/bookingRoutes");
const messageRoutes = require("./api/routes/messageRoutes");

// 🛠️ Use Routes
app.use("/rent", rentRoutes);
app.use("/users", userRoutes);
app.use("/kyc", kycRoutes);
app.use("/bookings", bookingRoutes);
app.use("/messages", messageRoutes);

// 🛠️ Root Route
app.get("/", (req, res) => res.send("🚀 RentifyHub Backend is Running!"));

// 🛠️ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.message || err);
    res.status(500).json({ error: "Internal server error" });
});

// 🛠️ Start Server
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use.`);
        process.exit(1);
    } else {
        console.error("❌ Server error:", err);
    }
});