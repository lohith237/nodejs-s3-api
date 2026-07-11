import mongoose, { Connection } from "mongoose";

let masterConnection: Connection;

const connectMasterDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI as string);
        masterConnection = connect.connection;
        console.log(`MongoDB Connected: ${masterConnection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const getMasterDB = (): Connection => {
    return masterConnection;
};

export { connectMasterDB, getMasterDB };