import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
  if (!mongoUri || typeof mongoUri !== 'string') {
    throw new Error('MONGO_URI is missing or invalid. Check backend/.env');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri);
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected: ${host}/${name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
