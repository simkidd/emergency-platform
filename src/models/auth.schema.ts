import mongoose, { Schema } from "mongoose";
import { IAuth } from "../interfaces/auth.interface";

const authSchema = new Schema<IAuth>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
authSchema.index({ userId: 1, type: 1 });

const Auth = mongoose.model<IAuth>("Auth", authSchema);

export default Auth;
