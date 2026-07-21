import Typesense from "typesense";

let client = null;

export function getTypesenseClient() {
  if (client) {
    return client;
  }

  if (!process.env.TYPESENSE_ADMIN_API_KEY) {
    throw new Error("TYPESENSE_ADMIN_API_KEY is not defined");
  }

  client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST || "localhost",
        port: Number(process.env.TYPESENSE_PORT || 8108),
        protocol: process.env.TYPESENSE_PROTOCOL || "http",
      },
    ],
    apiKey: process.env.TYPESENSE_ADMIN_API_KEY,
    connectionTimeoutSeconds: 5,
  });

  return client;
}

export function isTypesenseConfigured() {
  return !!process.env.TYPESENSE_ADMIN_API_KEY;
}
