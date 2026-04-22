import mongoose from "mongoose";
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI;
const isDevelopment = process.env.NODE_ENV !== 'production';

try {
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (error) {
    if (isDevelopment) {
        console.warn('MongoDB DNS preference setup skipped:', error);
    }
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (!MONGODB_URI) {
        throw new Error("MongoDB URI is missing");
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            family: 4,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    if (isDevelopment) {
        console.log('MongoDB connected');
    }

    return cached.conn;
}
