import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
  ip_address: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  image_url: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Photo', PhotoSchema);