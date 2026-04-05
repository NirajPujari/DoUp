import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false, // Don't return password by default
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  age: {
    type: Number,
  },
  bio: {
    type: String,
  },
  avatarColor: {
    type: String,
    default: "primary",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
