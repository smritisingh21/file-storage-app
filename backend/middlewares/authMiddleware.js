import { ObjectId } from "mongodb";
import User from "../models/UserSchema.js";

export default async function checkAuth(req, res, next) {
  const { token } = req.signedCookies;
  const parsedPayload = JSON.parse(Buffer.from(token , "base64url").toString())
  const uid = parsedPayload.id;
  if (!token) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: uid });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}


