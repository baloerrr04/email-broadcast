import { createServer } from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      await disconnectDB();
      process.exit();
    });

  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
