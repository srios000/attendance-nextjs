import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

type GlobalWithMongoose = typeof globalThis & {
  mongoose: Cached;
};

const globalWithMongoose = global as GlobalWithMongoose;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface Cached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      mongoose: Cached;
    }
  }
}

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    // console.log('Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // useNewUrlParser: true, // Typically you'd want this to be true to use the new URL string parser
      // useUnifiedTopology: true, // You'd typically want this true as well for the new server discovery and monitoring engine
    };

    console.log('Establishing new database connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('Database connection established');
      return mongoose.connection;
    }).catch((err) => {
      console.error('Database connection error:', err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
