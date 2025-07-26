import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import UserModel from '../models/user.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/b2b';

async function main() {
  await mongoose.connect(MONGO_URI);
  const users = await UserModel.find({ username: { $exists: true, $ne: null } }, { username: 1, name: 1, email: 1 });
  users.forEach(u => {
    console.log({ username: u.username, name: u.name, email: u.email });
  });
  await mongoose.disconnect();
}

main().catch(console.error);