import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

// Fix Windows SRV query ECONNREFUSED with Atlas clusters
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
    // Ignore if not supported in environment
}


// Determine directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env regardless of where the script is executed from
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedTestData = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("❌ Error: MONGO_URI is not defined in backend/.env");
        process.exit(1);
    }

    // Command-line flag to optionally seed an existing application
    const withApplication = process.argv.includes("--with-application");

    // Standardized development test credentials
    const studentData = {
        fullname: "Aanya Sharma",
        email: "aanya.test@hixenexa.local",
        password: "Test@12345",
        phoneNumber: 9876543211,
        role: "student",
        profile: {
            bio: "Aspiring Frontend and Full Stack developer with hands-on experience building modern React and JavaScript web applications.",
            skills: ["React", "JavaScript", "HTML", "CSS", "Git", "Node.js", "Express", "MongoDB"],
            experienceYears: 1,
            education: [
                {
                    degree: "B.Tech Computer Science",
                    institution: "Tech Institute of India",
                    year: "2024"
                }
            ]
        }
    };

    const recruiterData = {
        fullname: "Rohan Mehta",
        email: "rohan.recruiter@hixenexa.local",
        password: "Test@12345",
        phoneNumber: 9876543212,
        role: "recruiter",
        profile: {
            bio: "Technical Recruiter at NovaTech Solutions specializing in hiring frontend, backend, and full-stack software engineers.",
            skills: ["Talent Acquisition", "Technical Recruiting", "Candidate Sourcing"],
            experienceYears: 5,
            education: []
        }
    };

    const companyData = {
        name: "NovaTech Solutions",
        location: "Noida, India",
        website: "https://example.com",
        description: "A technology company building modern web applications and digital products."
    };

    const jobsData = [
        {
            title: "Frontend Developer",
            location: "Noida, India",
            description: "Build responsive and accessible web applications using React and modern JavaScript. Work with designers and backend engineers to deliver production-quality features.",
            requirements: ["React", "JavaScript", "HTML", "CSS", "Git"],
            experienceLevel: 1,
            salary: 6,
            position: 2,
            jobType: "Full Time",
            category: "Frontend",
            status: "approved",
            isActive: true
        },
        {
            title: "Full Stack Developer",
            location: "Noida, India",
            description: "Develop full-stack web applications using React, Node.js, Express, and MongoDB. Design RESTful APIs and integrate modern frontends.",
            requirements: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "Git"],
            experienceLevel: 2,
            salary: 10,
            position: 1,
            jobType: "Full Time",
            category: "FullStack",
            status: "approved",
            isActive: true
        }
    ];

    try {
        console.log("Connecting to MongoDB...");
        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        } catch (firstConnectErr) {
            // Check if SRV lookup failed on Windows
            if (firstConnectErr.message && firstConnectErr.message.includes("querySrv ECONNREFUSED") && mongoUri.startsWith("mongodb+srv://")) {
                console.log("⚠️  SRV DNS lookup failed on Windows. Attempting direct shard connection fallback...");
                // Standard direct replica set hosts for cluster0.byxcert.mongodb.net
                const directUri = mongoUri
                    .replace("mongodb+srv://", "mongodb://")
                    .replace("cluster0.byxcert.mongodb.net", "ac-ipmxsap-shard-00-00.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-01.byxcert.mongodb.net:27017,ac-ipmxsap-shard-00-02.byxcert.mongodb.net:27017") + "&ssl=true&authSource=admin";
                await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 });
            } else {
                throw firstConnectErr;
            }
        }
        console.log("✅ MongoDB connected successfully.");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // 1. Seed Student Account
        let studentUser = await User.findOne({ email: studentData.email.toLowerCase().trim() });
        if (studentUser) {
            console.log(`ℹ️  Student account already exists: ${studentUser.email} (ID: ${studentUser._id})`);
        } else {
            const hashedStudentPassword = await bcrypt.hash(studentData.password, 10);
            studentUser = await User.create({
                fullname: studentData.fullname,
                email: studentData.email.toLowerCase().trim(),
                phoneNumber: studentData.phoneNumber,
                password: hashedStudentPassword,
                role: studentData.role,
                profile: studentData.profile
            });
            console.log(`🎉 Created Student Account: ${studentUser.email} (ID: ${studentUser._id})`);
        }

        // 2. Seed Recruiter Account
        let recruiterUser = await User.findOne({ email: recruiterData.email.toLowerCase().trim() });
        if (recruiterUser) {
            console.log(`ℹ️  Recruiter account already exists: ${recruiterUser.email} (ID: ${recruiterUser._id})`);
        } else {
            const hashedRecruiterPassword = await bcrypt.hash(recruiterData.password, 10);
            recruiterUser = await User.create({
                fullname: recruiterData.fullname,
                email: recruiterData.email.toLowerCase().trim(),
                phoneNumber: recruiterData.phoneNumber,
                password: hashedRecruiterPassword,
                role: recruiterData.role,
                profile: recruiterData.profile
            });
            console.log(`🎉 Created Recruiter Account: ${recruiterUser.email} (ID: ${recruiterUser._id})`);
        }

        // 3. Seed Company for Recruiter
        let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyData.name}$`, "i") } });
        if (company) {
            console.log(`ℹ️  Company already exists: "${company.name}" (ID: ${company._id})`);
            // Ensure userId is linked to recruiter if needed
            if (!company.userId) {
                company.userId = recruiterUser._id;
                await company.save();
            }
        } else {
            company = await Company.create({
                name: companyData.name,
                location: companyData.location,
                website: companyData.website,
                description: companyData.description,
                logo: "",
                userId: recruiterUser._id
            });
            console.log(`🎉 Created Company: "${company.name}" (ID: ${company._id})`);
        }

        // Update recruiter's profile company reference
        if (!recruiterUser.profile.company) {
            recruiterUser.profile.company = company._id;
            await recruiterUser.save();
        }

        // 4. Seed Jobs
        const seededJobs = [];
        for (const jobItem of jobsData) {
            let job = await Job.findOne({
                title: jobItem.title,
                company: company._id
            });

            if (job) {
                console.log(`ℹ️  Job already exists: "${job.title}" at "${company.name}" (ID: ${job._id})`);
                seededJobs.push(job);
            } else {
                job = await Job.create({
                    ...jobItem,
                    company: company._id,
                    created_by: recruiterUser._id,
                    applications: []
                });
                console.log(`🎉 Created Job: "${job.title}" (${job.salary} LPA, ${job.position} Openings)`);
                seededJobs.push(job);
            }
        }

        // 5. Optional Pre-seeded Application (if --with-application flag is passed)
        if (withApplication && seededJobs.length > 0) {
            const firstJob = seededJobs[0];
            let existingApplication = await Application.findOne({
                job: firstJob._id,
                applicant: studentUser._id,
                withdrawn: false
            });

            if (existingApplication) {
                console.log(`ℹ️  Application already exists for ${studentUser.fullname} on "${firstJob.title}".`);
            } else {
                const newApp = await Application.create({
                    job: firstJob._id,
                    applicant: studentUser._id,
                    status: "applied"
                });

                if (!firstJob.applications.includes(newApp._id)) {
                    firstJob.applications.push(newApp._id);
                    await firstJob.save();
                }
                console.log(`🎉 Created Test Application: ${studentUser.fullname} applied for "${firstJob.title}".`);
            }
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🚀 HIXENEXA DEVELOPMENT TEST DATA READY!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👤 CANDIDATE / STUDENT CREDENTIALS:");
        console.log(`   Email:    ${studentData.email}`);
        console.log(`   Password: ${studentData.password}`);
        console.log(`   Role:     student`);
        console.log("");
        console.log("👔 RECRUITER CREDENTIALS:");
        console.log(`   Email:    ${recruiterData.email}`);
        console.log(`   Password: ${recruiterData.password}`);
        console.log(`   Role:     recruiter`);
        console.log(`   Company:  ${company.name}`);
        console.log("");
        console.log("📋 AVAILABLE TEST JOBS (Pre-approved):");
        seededJobs.forEach((j, idx) => {
            console.log(`   ${idx + 1}. ${j.title} (${j.location}, ${j.salary} LPA) - ID: ${j._id}`);
        });
        console.log("");
        console.log("🧪 SUGGESTED WORKFLOW TO TEST:");
        console.log("   1. Sign in as Student (Aanya) -> Explore Jobs -> View & Apply to 'Frontend Developer'");
        console.log("   2. Log out -> Sign in as Recruiter (Rohan) -> Go to Recruiter Dashboard -> Jobs");
        console.log("   3. View Applicants -> Check live Match Score -> Update status (Shortlisted / Interview)");
        console.log("   4. Log back in as Student -> Go to Profile / Applied Jobs -> Verify updated status");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    } catch (error) {
        console.error("❌ Error seeding test data:", error.message || error);
        if (error.message && (error.message.includes("alert number 80") || error.message.includes("ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR"))) {
            console.log("\n💡 MONGODB ATLAS TROUBLESHOOTING:");
            console.log("   Atlas terminated the TLS connection (SSL Alert 80).");
            console.log("   This usually means your current public IP address is NOT whitelisted in MongoDB Atlas Network Access.");
            console.log("   To fix this:");
            console.log("   1. Go to cloud.mongodb.com and log into your MongoDB Atlas account.");
            console.log("   2. Navigate to 'Network Access' (under Security in the left sidebar).");
            console.log("   3. Click 'Add IP Address' -> Click 'Add Current IP Address' (or allow access from anywhere '0.0.0.0/0' for local dev).");
            console.log("   4. Once the status says 'Active', run this command again: npm run seed\n");
        }
        process.exitCode = 1;
    } finally {
        try {
            await mongoose.disconnect();
            console.log("🔌 Database connection closed cleanly.");
        } catch (disconnectError) {
            console.error("Error disconnecting MongoDB:", disconnectError.message);
        }
    }
};

seedTestData();
