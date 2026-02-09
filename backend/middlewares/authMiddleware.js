import { ObjectId } from "mongodb";
import { secret } from "../controllers/userController.js";
import User from "../models/UserSchema.js";
import crypto from "node:crypto"

export default async function checkAuth(req, res, next) {
  const { token } = req.cookies;
  const [payload , signature] = token.split(".")

  const jsonPayload = Buffer.from(payload , "base64url").toString();
  const parsedPayload = JSON.parse(jsonPayload);

  const uid = parsedPayload.id;
  if (!token) {
    return res.status(401).json({ error: "Not logged!" });
  }
 
  const newSignature = crypto
  .createHash("sha256")
  .update(secret)
  .update(jsonPayload)
  .update(secret)
  .digest("base64url");


  if(signature !== newSignature){
    res.clearCookie("token");
    console.log("Invalid signature");
    res.status(401).json({error : "Not logged in"})
  }

  const user = await User.findOne({ _id: uid });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}


