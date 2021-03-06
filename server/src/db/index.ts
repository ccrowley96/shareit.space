import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Export db models
export { default as User } from './models/user';
export { default as Community } from './models/community';
export { default as Post } from './models/post';
export { default as Room } from './models/room';

export const connectDB = async () => {
    try {
        let conn = null;
        if (process.env.NODE_ENV === 'dev') {
            // Connect to DEV DB
            conn = await mongoose.connect(`mongodb://mongodb_container:27017`, {
                user: process.env.DB_USER,
                pass: process.env.DB_PASSWORD,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
        } else {
            // Connect to PROD DB
            conn = await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
        }
        // Check connection
        console.log(`MongoDB Connected ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
