import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  paymentId: string; // ID платежа в ЮKassa
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'canceled' | 'failed';
  description: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "RUB",
  },
  status: {
    type: String,
    enum: ['succeeded', 'pending', 'canceled', 'failed'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Индексы для быстрого поиска
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export default mongoose.model<IPayment>("Payment", paymentSchema);
