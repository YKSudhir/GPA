import mongoose from "mongoose";

// Define the Course schema
const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  credits: { type: Number, required: true },
  grade: { type: String, required: true },
  gradePoints: { type: Number, required: false },
});

// Define the Semester schema
const CurrentSemesterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  semesters: [
    {
      semesterName: { type: String, required: true },
      courses: [CourseSchema], // Embedding the Course schema inside the Semester schema
    },
  ],
});

// Prevent overwriting the model if it already exists
const CurrentSem =
  mongoose.models.CurrentSem || mongoose.model("CurrentSem", CurrentSemesterSchema);

export default CurrentSem;
