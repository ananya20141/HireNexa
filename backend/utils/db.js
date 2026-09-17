import mongoose from "mongoose";
import dns from "dns";

// Fix Windows SRV query ECONNREFUSED with Atlas clusters
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
    // Ignore if not supported in environment
}

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("MONGO_URI not defined in environment");
            return;
        }

        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        } catch (firstErr) {
            if (firstErr.message && firstErr.message.includes("querySrv ECONNREFUSED") && mongoUri.startsWith("mongodb+srv://")) {
                console.log("⚠️ SRV DNS lookup failed on Windows. Attempting direct shard connection fallback...");
                const directUri = mongoUri
                    .replace("mongodb+srv://", "mongodb://")
                    .replace("cluster0.byxcert.mongodb.net", "ac-ipmxsap-shard-00-00.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-01.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-02.byxcert.mongodb.net:27017") + "&ssl=true&authSource=admin";
                await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 });
            } else {
                throw firstErr;
            }
        }
        console.log('mongodb connected successfully');
    } catch (error) {
        console.error("MongoDB connection error:", error.message || error);
    }
}
export default connectDB;