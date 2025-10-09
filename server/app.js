import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import checkAuth from "./auth.js";

const app = express();

app.use(cookieParser());

app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
  }));

app.use("/directory",checkAuth, directoryRoutes);
app.use("/file", checkAuth,fileRoutes);
app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: "Something went wrong!" });
});

app.listen(4000, () => {
  console.log(`Server Started`);
});
