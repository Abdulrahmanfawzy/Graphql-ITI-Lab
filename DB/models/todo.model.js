import { model, Schema, Types } from "mongoose";


const todoSchema = Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  user: { type: Types.ObjectId, ref: "user", required: true },
});
const todoModel = model("todo", todoSchema);

export default todoModel;