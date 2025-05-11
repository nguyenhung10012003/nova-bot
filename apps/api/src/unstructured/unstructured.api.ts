import { UnstructuredClient } from 'unstructured-client';
import { PartitionParameters } from 'unstructured-client/sdk/models/shared';

export const extractDocument = async (options: PartitionParameters) => {
  const client = new UnstructuredClient({
    serverURL: process.env.UNSTRUCTURED_API_URL,
    security: {
      apiKeyAuth: process.env.UNSTRUCTURED_API_KEY,
    },
  });

  const response = await client.general.partition({
    partitionParameters: options,
  });

  return response;
};
