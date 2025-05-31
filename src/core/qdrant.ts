import { QdrantClient } from "@qdrant/js-client-rest";

export interface QdrantBaseInterface {
  apiUrl: string;
  apiKey: string;
}

export abstract class QdrantBase {
  protected client: QdrantClient;

  constructor(parameters: QdrantBaseInterface) {
    this.client = new QdrantClient({
      url: parameters.apiUrl,
      apiKey: parameters.apiKey,
    });
  }

  async getCollections() {
    const collections = await this.client.getCollections();
    return collections;
  }

  async checkCollectionExist(collectionName: string) {
    const collections = await this.client.getCollections();
    const collectionExists = collections.collections.some(
      (collection) => collection.name === collectionName
    );
    return collectionExists;
  }
}
