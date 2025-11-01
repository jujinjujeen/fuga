import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import { createApp } from './app';
import prisma from '@f/prismaInstance';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const bootstrap = async () => {
  try {
    const app = createApp();

    await prisma.$connect();
    console.log('Connected to DB');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

bootstrap();
