import express from "express";
import { readdir } from "fs/promises";

const app = express();

// Enabling CORS
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, filename");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200).json({ message: "OK" }); //res.sendStatus(200) sends the response immediately and returns the response object, but it ends the response.
  }
  next();
});

// Serving File
app.use((req, res, next) => {
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  const serveStatic = express.static("storage"); //middleware to serve static files
  serveStatic(req, res, next); //manual call to the middleware
});

// Serving Dir Content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  console.log(filesList);
  res.json(filesList);
});

app.listen(4000, () => {
  console.log(`Server started on http://localhost:4000`);
});
