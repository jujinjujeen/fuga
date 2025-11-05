import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3ClientInt, TMP_BUCKET } from '@f/be/lib/s3';
import { TIME_MS } from '@f/be/constants';

/**
 * Lists all objects in the temporary bucket
 * @returns Array of object keys with their last modified dates
 */
export const listTempObjects = async (): Promise<
  Array<{ key: string; lastModified: Date }>
> => {
  const objects: Array<{ key: string; lastModified: Date }> = [];
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: TMP_BUCKET,
        ContinuationToken: continuationToken,
      });

      const response = await s3ClientInt.send(command);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.LastModified) {
            objects.push({
              key: object.Key,
              lastModified: object.LastModified,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  } catch (error) {
    console.error('Failed to list objects in temp bucket:', error);
    throw new Error('Failed to list temporary objects');
  }
};

/**
 * Deletes a single object from the temporary bucket
 * @param key - The S3 object key to delete
 */
const deleteObject = async (key: string): Promise<void> => {
  try {
    await s3ClientInt.send(
      new DeleteObjectCommand({
        Bucket: TMP_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error(`Failed to delete object ${key}:`, error);
    throw new Error(`Failed to delete object: ${key}`);
  }
};

/**
 * Cleans up old files from temporary bucket
 * Deletes files older than the presigned URL TTL (5 minutes)
 * @returns Object with deleted count and any errors
 */
export const cleanupTempStorage = async (): Promise<{
  deletedCount: number;
  errors: string[];
}> => {
  const ttlMs = TIME_MS.FIVE_MINUTES;
  const now = Date.now();
  const errors: string[] = [];
  let deletedCount = 0;

  console.log('Starting temp storage cleanup...');

  try {
    const objects = await listTempObjects();
    console.log(`Found ${objects.length} objects in temp bucket`);

    const oldObjects = objects.filter((obj) => {
      const age = now - obj.lastModified.getTime();
      return age > ttlMs;
    });

    console.log(
      `${oldObjects.length} objects are older than ${TIME_MS.FIVE_MINUTES} miliseconds`
    );

    for (const obj of oldObjects) {
      try {
        await deleteObject(obj.key);
        deletedCount++;
        console.log(`Deleted old temp file: ${obj.key}`);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${obj.key}: ${errorMsg}`);
      }
    }

    console.log(
      `Temp storage cleanup completed. Deleted: ${deletedCount}, Errors: ${errors.length}`
    );

    return { deletedCount, errors };
  } catch (error) {
    console.error('Temp storage cleanup failed:', error);
    throw error;
  }
};

/**
 * Service interface for cleanup operations
 */
export const cleanupService = {
  listTempObjects,
  cleanupTempStorage,
};
