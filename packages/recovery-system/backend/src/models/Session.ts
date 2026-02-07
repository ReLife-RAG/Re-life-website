import mongoose, { Schema, Document } from "mongoose";

// BetterAuth-compatible Session Interface
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "users",
      required: true,
      index: true // Added index for faster queries
    },
    token: { 
      type: String, 
      required: true,
      unique: true // Ensure token uniqueness
    },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>("sessions", SessionSchema);