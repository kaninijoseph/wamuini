const express = require("express");
require("dotenv").config({ path: "./.env" });
const cors = require("cors");
const connectDb = require("./db");
const http = require("http");
const socketIo = require("socket.io");
const uploadRoute = require("./controllers/postContollers");
const { head } = require("./routes/postRoutes");
const path = require("path");

connectDb();
const app = express();
app.use(cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));

app.get("/", (req, res) => {
  res.send("Welcome to Wamuini App");
});

// Create an HTTP server
const server = http.createServer(app); // Don't pass the port here

// Set up socket.io with the server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins or restrict to specific ones
    methods: ["GET", "POST"],
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A client connected");

  // Listen for messages from the client
  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });

  // Broadcast message to all clients
  socket.on("broadcast", (data) => {
    io.emit("broadcast", data);
  });

  // Listen for disconnect event
  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Start the server and ensure it listens on port 8080
server.listen(3000, () => {
  console.log(`Server running on port 3000`);
});

module.exports = { server, io };
