const express = require("express");
require("dotenv").config({ path: "./.env" });
const cors = require("cors");
const connectDb = require("./db");
const uploadRoute = require("./controllers/postContollers");

connectDb();
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

app.get("/", (req, res) => {
  res.send("Welcome to Wamuini App");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
