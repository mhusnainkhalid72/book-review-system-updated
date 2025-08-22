import mongoose from 'mongoose';

export const connectMongo = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error', err);
    process.exit(1);
  }
};

export default mongoose;
