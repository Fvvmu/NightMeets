import mongoose from 'mongoose';

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ForumPost', ForumPostSchema);