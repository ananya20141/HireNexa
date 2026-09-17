import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";

try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function verify() {
    const mongoUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    } catch (err) {
        if (err.message && err.message.includes("querySrv ECONNREFUSED") && mongoUri.startsWith("mongodb+srv://")) {
            const directUri = mongoUri
                .replace("mongodb+srv://", "mongodb://")
                .replace("cluster0.byxcert.mongodb.net", "ac-ipmxsap-shard-00-00.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-01.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-02.byxcert.mongodb.net:27017") + "&ssl=true&authSource=admin";
            await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 });
        } else {
            throw err;
        }
    }

    const jobs = await Job.find({ 
        title: { $in: ["Interior Designer", "Junior Architect"] } 
    }).populate("company", "name location");

    console.log(`Verified ${jobs.length} test jobs in MongoDB:`);
    jobs.forEach(j => {
        console.log(JSON.stringify({
            id: j._id,
            title: j.title,
            company: j.company?.name,
            location: j.location,
            jobType: j.jobType,
            salary: `${j.salary} LPA`,
            experienceLevel: `${j.experienceLevel} yrs`,
            status: j.status,
            isActive: j.isActive,
            requirementsCount: j.requirements.length,
            requirements: j.requirements,
            description: j.description
        }, null, 2));
    });

    await mongoose.disconnect();
}

verify().catch(e => {
    console.error("Verification error:", e);
    process.exit(1);
});
