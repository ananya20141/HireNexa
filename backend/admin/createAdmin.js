import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

// Determine directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env regardless of where the script is executed from
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const createAdmin = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("❌ Error: MONGO_URI is not defined in backend/.env");
        process.exit(1);
    }

    // Configurable credentials with standard defaults
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@careermatch.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminName = process.env.ADMIN_NAME || "System Administrator";
    const adminPhone = Number(process.env.ADMIN_PHONE) || 9876543210;

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB connected successfully.");

        // Idempotency check: verify if an account with this email already exists
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            console.log(
                `ℹ️  An account with email "${adminEmail}" already exists (Role: ${existingUser.role}). No duplicate admin created.`
            );
            return;
        }

        // Hash password using bcryptjs with 10 salt rounds (identical to user.controller.js)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create the admin user using the existing User model schema
        const adminUser = await User.create({
            fullname: adminName,
            email: adminEmail,
            phoneNumber: adminPhone,
            password: hashedPassword,
            role: "admin",
            profile: {
                bio: "System Administrator for HireNexa portal",
                skills: ["Administration", "Platform Governance"],
                experienceYears: 5,
                education: []
            }
        });

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 Admin user created successfully!");
        console.log(`   ID:       ${adminUser._id}`);
        console.log(`   Name:     ${adminUser.fullname}`);
        console.log(`   Email:    ${adminUser.email}`);
        console.log(`   Role:     ${adminUser.role}`);
        console.log(`   Password: ${adminPassword}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message || error);
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

createAdmin();
