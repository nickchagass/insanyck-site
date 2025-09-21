import { MongoClient } from "mongodb";

// 1. Garante que a variável está definida
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("⚠️ Defina MONGODB_URI no arquivo .env.local");
}

// 2. Opções padrão (pode customizar depois)
const options = {};

// 3. Tipagem TypeScript para o global
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 4. Inicialização inteligente
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento, cacheia no global para evitar múltiplas conexões com hot-reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    // Nova conexão MongoDB iniciada em desenvolvimento
  } else {
    // Reutilizando conexão MongoDB em desenvolvimento
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // Em produção, sempre cria nova conexão (sem cache global)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 5. Exporta a promise para uso em toda app
export default clientPromise;
