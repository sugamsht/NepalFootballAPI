// filepath: /d:/apps/Nepscore/NepalFootballAPI/app/models/user.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// User schema
const UserSchema = new Schema({
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  salt: { type: String, default: '' }
});

// Methods and Statics can be added here

// Register
export default mongoose.model('User', UserSchema);