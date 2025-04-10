import colors from 'colors';
import mongoose from "mongoose";
import User, { IUser } from '../models/User';

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        const url2 = `${connection.connection.host}:${connection.connection.port}`;
        console.log(colors.green.bold.italic(`MongoDB Connected: ${url2}`));
    } catch (error) {
        console.log(colors.red.bold.italic(`Error: ${error.message}`));
        process.exit(1);
    }
}