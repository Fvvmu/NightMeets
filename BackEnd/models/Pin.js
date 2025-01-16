import mongoose from 'mongoose';

const PinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Pin', PinSchema);