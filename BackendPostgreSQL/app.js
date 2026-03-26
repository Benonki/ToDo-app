const express = require("express");
const app = express();
const prisma = require("./lib/prismaClient");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "hello world!" });
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("successfully connected to the database");
  } catch (error) {
    console.error("failed to connect to the database", erorr);
  }
}

app.listen(PORT, async () => {
  console.log(`server running on port: ${PORT}`);
  await testConnection();
});
