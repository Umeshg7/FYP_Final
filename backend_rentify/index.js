const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Ensure you load environment variables
const crypto = require("crypto");

const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 6001;

// Middleware 
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@rentifyhub.6poib.mongodb.net/rentifyhub-umesh-db?retryWrites=true&w=majority&appName=rentifyhub`;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if DB connection fails
  });

  //console.log("code is" + crypto.randomBytes(64).toString("hex"));
  //jwt authentication
  app.post('/jwt', async(req, res) =>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1hr'
    })
    res.send({token})
  })


//importing routes here
const rentRoutes = require('./api/routes/RentRoutes')
const userRoutes = require("./api/routes/userRoutes")
app.use('/rent', rentRoutes)
app.use('/users', userRoutes)

// Root Route
app.get("/", (req, res) => {
  res.send("Hello RentifyHub!");
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${port} is already in use.`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
  }
});
