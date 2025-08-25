import mongoose, { Schema, Document } from "mongoose";

export interface IBalance extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  updatedAt: Date;
}

const balanceSchema = new Schema<IBalance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: "RUB",
  },
}, {
  timestamps: true,
});

export default mongoose.model<IBalance>("Balance", balanceSchema);
