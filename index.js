const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./lib/mongo");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");

// Import routes
const productRoutes = require("./routes/products");
const inventoryRoutes = require("./routes/inventory");
const orderRoutes = require("./routes/orders");
const customerRoutes = require("./routes/customers");
const supplierRoutes = require("./routes/suppliers");

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Base route
app.get("/", authMiddleware, (req, res) => {
  res.send("Inventory Management System API");
});

// Apply routes
app.use("/api/auth", authRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/inventory", authMiddleware, inventoryRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/suppliers", authMiddleware, supplierRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to database
connectDB();

// Start servers
server.listen(3000, () => {
  console.log("Socket.io server is listening on port 3000");
});

app.listen(PORT, () => {
  console.log(`REST API server is running on port ${PORT}`);
});
