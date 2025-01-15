export type UpsertVectorData = {
  chatflowId: string;
  stopNodeId?: string;
  overrideConfig?: Record<string, any>;
  files?: Buffer[];
  modelName?: string | null;
};

export type UpsertVectorResponse = {
  numAdded?: number;
  numDeleted?: number;
  numUpdated?: number;
  numSkipped?: number;
  addedDocs?: Document[];
};

export interface VectorUpsertApi {
  upsertVector(data: UpsertVectorData): Promise<UpsertVectorResponse>;
}
