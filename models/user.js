import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encrypted
  semester: { type: Number, required: true }, // Embedded document for semesters
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
