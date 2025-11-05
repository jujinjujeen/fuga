import cron from 'node-cron';
import { cleanupTempStorage } from '@f/be/services/cleanup.service';

/**
 * Cron job to clean up temporary storage
 * Runs every 2 hours to delete files older than presigned URL TTL
 */
export const setupCleanupCron = (): void => {
  // Run every 2 hours: 0 */2 * * *
  // Format: minute hour day month weekday
  const schedule = '0 */2 * * *';

  console.log('Setting up temp storage cleanup cron job (every 2 hours)...');

  cron.schedule(schedule, async () => {
    console.log('Running scheduled temp storage cleanup...');
    try {
      await cleanupTempStorage();
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  });

  console.log('Temp storage cleanup cron job registered');
};
