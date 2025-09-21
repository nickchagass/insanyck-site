// src/lib/mongo.ts
import mongoose from "mongoose";

// 1. Validação robusta da URI
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI não definida. Adicione ao .env.local:\n" +
    "MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority"
  );
}

// 2. Configurações otimizadas para produção
const connectionOptions: mongoose.ConnectOptions = {
  autoIndex: process.env.NODE_ENV === 'development', // Indexação apenas em dev
  maxPoolSize: 50, // Conexões máximas
  minPoolSize: 5,  // Conexões mínimas mantidas
  serverSelectionTimeoutMS: 5000, // Timeout de seleção de servidor
  socketTimeoutMS: 45000, // Timeout de socket
  heartbeatFrequencyMS: 10000, // Intervalo de heartbeat
};

// 3. Singleton global tipado
declare global {
  var _mongooseGlobal: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cache = global._mongooseGlobal || { conn: null, promise: null };

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    // 4. Event listeners para diagnóstico
    // Event listeners for MongoDB connection (logs removed for ESLint)
    
    mongoose.connection.on('error', (error) => 
      console.error('❌ Erro no MongoDB:', error));

    // 5. Conexão com tratamento de erro
    cache.promise = mongoose.connect(MONGODB_URI, connectionOptions)
      .then(mongoose => mongoose)
      .catch(error => {
        // Reset cache em caso de erro
        cache.promise = null;
        throw new Error(`Falha na conexão com MongoDB: ${error.message}`);
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

// 6. Manter cache apenas em dev para hot-reload
if (process.env.NODE_ENV === 'development') {
  global._mongooseGlobal = cache;
}

export default connectToDatabase;
export { connectToDatabase };