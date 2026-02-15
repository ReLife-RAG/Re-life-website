import mongoose, { Schema, Document } from "mongoose";

export interface IAvailableSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface IReview {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ICounselor extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string[];
  qualifaicaton: string[];
  bio: string;
  pricePersession: number;
  availableSlots: IAvailableSlot[];
  reviews: IReview[];
  avergageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const availableSlotsSchema = new Schema<IAvailableSlot>({
  dayOfWeek: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ]
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const counselorSchema = new Schema<ICounselor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    specialization: [{ type: String, required: true }],
    qualifaicaton: [{ type: String, required: true }],
    bio: {
      type: String,
      required: true,
      maxlength: 1000
    },
    pricePersession: {
      type: Number,
      required: true,
      min: 0
    },
    availableSlots: [availableSlotsSchema],
    reviews: [reviewSchema],
    avergageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

counselorSchema.index({ userId: 1 });
counselorSchema.index({ specialization: 1 });
counselorSchema.index({ avergageRating: -1 });

export default mongoose.model<ICounselor>(
  "Counselor",
  counselorSchema
);
