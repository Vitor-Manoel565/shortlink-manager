import mongoose from 'mongoose';

const ShortLinkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortedLink: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expire: { type: Date, default: null },
});

export default ShortLinkSchema;
