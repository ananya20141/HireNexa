import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";

// Fix Windows DNS SRV query ECONNREFUSED with Atlas clusters
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seedTestJobs() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("❌ Error: MONGO_URI is not defined in backend/.env");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        } catch (firstConnectErr) {
            if (firstConnectErr.message && firstConnectErr.message.includes("querySrv ECONNREFUSED") && mongoUri.startsWith("mongodb+srv://")) {
                console.log("⚠️ SRV DNS lookup failed on Windows. Attempting direct shard connection fallback...");
                const directUri = mongoUri
                    .replace("mongodb+srv://", "mongodb://")
                    .replace("cluster0.byxcert.mongodb.net", "ac-ipmxsap-shard-00-00.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-01.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-02.byxcert.mongodb.net:27017") + "&ssl=true&authSource=admin";
                await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 });
            } else {
                throw firstConnectErr;
            }
        }
        console.log("✅ MongoDB connected successfully.");

        // Find existing recruiter to associate the companies and job postings with
        let recruiter = await User.findOne({ email: "rohan.recruiter@hixenexa.local" });
        if (!recruiter) {
            recruiter = await User.findOne({ role: "recruiter" });
        }
        if (!recruiter) {
            recruiter = await User.findOne({ role: "admin" });
        }
        if (!recruiter) {
            throw new Error("No existing recruiter or admin user found to assign as job creator.");
        }
        console.log(`Using existing recruiter: ${recruiter.fullname} (${recruiter.email}, ID: ${recruiter._id})`);

        // 1. Company: DesignHaus Studio
        let company1 = await Company.findOne({ name: { $regex: /^DesignHaus Studio$/i } });
        if (!company1) {
            company1 = await Company.create({
                name: "DesignHaus Studio",
                location: "Delhi",
                website: "https://designhaus.example.com",
                description: "Interior design and architectural visualization studio based in Delhi.",
                logo: "",
                userId: recruiter._id
            });
            console.log(`🎉 Created Company: "${company1.name}" (ID: ${company1._id})`);
        } else {
            console.log(`ℹ️ Company already exists: "${company1.name}" (ID: ${company1._id})`);
        }

        // 2. Company: UrbanForm Architects
        let company2 = await Company.findOne({ name: { $regex: /^UrbanForm Architects$/i } });
        if (!company2) {
            company2 = await Company.create({
                name: "UrbanForm Architects",
                location: "Noida",
                website: "https://urbanform.example.com",
                description: "Contemporary architecture and urban planning consultancy in Noida.",
                logo: "",
                userId: recruiter._id
            });
            console.log(`🎉 Created Company: "${company2.name}" (ID: ${company2._id})`);
        } else {
            console.log(`ℹ️ Company already exists: "${company2.name}" (ID: ${company2._id})`);
        }

        const results = [];

        // JOB 1: Interior Designer
        const job1Data = {
            title: "Interior Designer",
            company: company1._id,
            location: "Delhi",
            jobType: "Full Time",
            experienceLevel: 1, // 1-2 years
            salary: 8, // 6-9 LPA
            position: 2,
            category: "Design",
            requirements: [
                "AutoCAD",
                "SketchUp",
                "3D Max",
                "Interior Design",
                "Space Planning",
                "Material Selection",
                "Adobe Photoshop",
                "V-Ray"
            ],
            description: "Design residential and commercial interior spaces, prepare layouts and 3D visualizations, select materials, and coordinate with clients and contractors.",
            status: "approved",
            isActive: true,
            isFlagged: false,
            created_by: recruiter._id
        };

        let job1 = await Job.findOne({ title: job1Data.title, company: company1._id });
        let job1AlreadyPresent = false;
        if (job1) {
            job1AlreadyPresent = true;
            // Ensure approved and active
            job1.status = "approved";
            job1.isActive = true;
            await job1.save();
            console.log(`ℹ️ Job 1 already present: "${job1.title}" (ID: ${job1._id})`);
        } else {
            job1 = await Job.create(job1Data);
            console.log(`🎉 Job 1 created: "${job1.title}" (ID: ${job1._id})`);
        }
        results.push({
            title: job1.title,
            id: job1._id.toString(),
            company: company1.name,
            location: job1.location,
            salary: `${job1.salary} LPA`,
            experience: `${job1.experienceLevel} yrs`,
            status: job1.status,
            isActive: job1.isActive,
            alreadyPresent: job1AlreadyPresent
        });

        // JOB 2: Junior Architect
        const job2Data = {
            title: "Junior Architect",
            company: company2._id,
            location: "Noida",
            jobType: "Full Time",
            experienceLevel: 1, // 1-2 years
            salary: 6, // 5-8 LPA
            position: 2,
            category: "Architecture",
            requirements: [
                "AutoCAD",
                "Revit",
                "Architectural Design",
                "BIM",
                "3D Modeling",
                "Building Codes",
                "SketchUp",
                "Technical Drawing"
            ],
            description: "Assist architects with architectural drawings, BIM models, 3D designs, documentation, and coordination of building projects.",
            status: "approved",
            isActive: true,
            isFlagged: false,
            created_by: recruiter._id
        };

        let job2 = await Job.findOne({ title: job2Data.title, company: company2._id });
        let job2AlreadyPresent = false;
        if (job2) {
            job2AlreadyPresent = true;
            // Ensure approved and active
            job2.status = "approved";
            job2.isActive = true;
            await job2.save();
            console.log(`ℹ️ Job 2 already present: "${job2.title}" (ID: ${job2._id})`);
        } else {
            job2 = await Job.create(job2Data);
            console.log(`🎉 Job 2 created: "${job2.title}" (ID: ${job2._id})`);
        }
        results.push({
            title: job2.title,
            id: job2._id.toString(),
            company: company2.name,
            location: job2.location,
            salary: `${job2.salary} LPA`,
            experience: `${job2.experienceLevel} yrs`,
            status: job2.status,
            isActive: job2.isActive,
            alreadyPresent: job2AlreadyPresent
        });

        console.log("\n=== SUMMARY OF TEST JOBS ===");
        console.log(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error("❌ Error in seedTestJobs:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("🔌 MongoDB disconnected.");
    }
}

seedTestJobs();
