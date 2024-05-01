import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect
        // eslint-disable-next-line
        (process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error:${error.message}`);
        //eslint-disable-next-line
        process.exit(1);
    }
}

export default connectDB;