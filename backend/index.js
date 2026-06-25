const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");
require("dotenv").config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // อนุญาตให้เฉพาะพอร์ต 3000 ของเรายิงมาได้
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // เผื่อกรณีในอนาคตมีการใช้ Cookie/Session
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use("/api", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
