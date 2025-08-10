// src/types/global.d.ts

import { MongoClient } from "mongodb";

// Permite adicionar propriedades customizadas ao globalThis no TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export {};
