import mongoose from 'mongoose';

// Connection string will be read from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

// Database connection options
const MONGODB_MAX_POOL_SIZE = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10);
const MONGODB_MIN_POOL_SIZE = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10);
const MONGODB_CONNECTION_TIMEOUT_MS = parseInt(process.env.MONGODB_CONNECTION_TIMEOUT_MS || '30000', 10);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the mongoose global cache type
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
  isConnecting: boolean;
}

// Declare global mongoose cache
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
    isConnecting: boolean;
  } | undefined;
}

let cached = global.mongoose || { conn: null, promise: null, isConnecting: false };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null, isConnecting: false };
  cached = global.mongoose;
}

// Log MongoDB events for debugging connection issues
function setupConnectionLogging(connection: mongoose.Connection) {
  // Only setup logging once per connection
  if (process.env.NODE_ENV !== 'production') {
    connection.on('connected', () => {
      console.log('MongoDB connected');
    });
    
    connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  }
}

async function connectToDatabase(): Promise<mongoose.Connection> {
  // If we already have an active connection, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If we're already in the process of connecting, wait for the promise
  if (cached.isConnecting && cached.promise) {
    try {
      const mongoose = await cached.promise;
      return mongoose.connection;
    } catch (error) {
      console.error('Error waiting for database connection:', error);
      // Reset connecting state
      cached.isConnecting = false;
      cached.promise = null;
      // Continue with new connection attempt
    }
  }

  // Set connecting flag to prevent multiple simultaneous connection attempts
  cached.isConnecting = true;

  // Configure connection options with performance optimizations
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false, // Disable command buffering
    connectTimeoutMS: MONGODB_CONNECTION_TIMEOUT_MS,
    maxPoolSize: MONGODB_MAX_POOL_SIZE, // Control maximum number of connections
    minPoolSize: MONGODB_MIN_POOL_SIZE, // Maintain minimum connections for faster response
    socketTimeoutMS: 45000, // Socket timeout
    serverSelectionTimeoutMS: 30000, // Server selection timeout
    heartbeatFrequencyMS: 10000, // How often to check connection
    retryWrites: true, // Auto-retry writes
    retryReads: true, // Auto-retry reads
  };

  try {
    // Create connection promise if it doesn't exist
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    // Wait for connection
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    
    // Setup logging (only in non-production)
    setupConnectionLogging(cached.conn);
    
    // Reset connecting flag
    cached.isConnecting = false;
    
    return cached.conn;
  } catch (error) {
    // Reset connection state on error
    cached.promise = null;
    cached.isConnecting = false;
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export default connectToDatabase; 