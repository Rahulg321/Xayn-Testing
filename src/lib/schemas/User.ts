// models/User.ts
import mongoose, { Schema } from "mongoose";

// Define the User schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create the model
const User = mongoose.model("User", UserSchema);

export default User;
