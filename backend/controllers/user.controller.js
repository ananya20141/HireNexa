import { User } from "../models/user.model.js";
import { Activity } from "../models/activity.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Safe cloudinary upload helper with development fallback
const uploadToCloudinary = async (file, folder = "careermatch") => {
    try {
        if (!file || !file.buffer) return null;
        const fileUri = getDataUri(file);
        if (!fileUri || !fileUri.content) return null;

        // Check if real Cloudinary credentials are configured
        const hasValidCloudinary = 
            process.env.CLOUD_NAME && 
            !process.env.CLOUD_NAME.includes("<") &&
            process.env.API_KEY && 
            !process.env.API_KEY.includes("<") &&
            process.env.API_SECRET && 
            !process.env.API_SECRET.includes("<");

        if (hasValidCloudinary) {
            try {
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    folder,
                    resource_type: "auto"
                });
                if (cloudResponse && cloudResponse.secure_url) {
                    return cloudResponse;
                }
            } catch (cloudErr) {
                console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr?.message || cloudErr);
            }
        }

        // Development fallback: preserve document as self-contained base64 DataURI
        return {
            secure_url: fileUri.content,
            url: fileUri.content,
            public_id: file.originalname
        };
    } catch (uploadError) {
        console.error("Upload helper error:", uploadError?.message || uploadError);
        return null;
    }
};


export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        const normalizedRole = role.toLowerCase().trim();
        const allowedRoles = ['student', 'recruiter', 'admin'];
        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(400).json({
                message: `Invalid role selected. Must be one of [${allowedRoles.join(', ')}].`,
                success: false
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                message: 'An account already exists with this email address.',
                success: false,
            });
        }

        // Profile photo is strictly OPTIONAL
        let profilePhoto = "";
        if (req.file) {
            const cloudResponse = await uploadToCloudinary(req.file, "careermatch/profiles");
            if (cloudResponse) {
                profilePhoto = cloudResponse.secure_url;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname: fullname.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber: Number(phoneNumber) || phoneNumber,
            password: hashedPassword,
            role: normalizedRole,
            profile: {
                profilePhoto,
                skills: [],
                experienceYears: 0,
                education: []
            }
        });

        // Record activity log
        try {
            await Activity.create({
                user: newUser._id,
                actionType: 'USER_REGISTERED',
                description: `New user ${newUser.fullname} registered with role ${newUser.role}.`,
                metadata: { email: newUser.email, role: newUser.role }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(201).json({
            message: "Account created successfully. Please login.",
            success: true
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: error?.message || "Internal server error during registration.",
            success: false
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password, and role are required.",
                success: false
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been suspended. Contact system administrator.",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        // Validate role matches
        const normalizedInputRole = role.toLowerCase().trim();
        if (normalizedInputRole !== user.role) {
            return res.status(400).json({
                message: `Account role mismatch. You are registered as ${user.role}.`,
                success: false
            });
        }

        const tokenData = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isBlocked: user.isBlocked,
            savedJobs: user.savedJobs || [],
            profile: user.profile
        };

        // Log login activity
        try {
            await Activity.create({
                user: user._id,
                actionType: 'USER_LOGIN',
                description: `${user.fullname} logged in as ${user.role}.`
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
            .json({
                message: `Welcome back, ${user.fullname}`,
                user: safeUser,
                token,
                success: true
            });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: error?.message || "Internal server error during login.",
            success: false
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("token", "", { maxAge: 0, httpOnly: true })
            .json({
                message: "Logged out successfully.",
                success: true
            });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "Internal server error during logout.",
            success: false
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate({
            path: 'savedJobs',
            populate: { path: 'company' }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({
            message: "Failed to fetch user data.",
            success: false
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { 
            fullname, name, email, phoneNumber, number, phone, 
            bio, skills, experienceYears, experience, experienceLevel, 
            education, firstJobMode, githubUrl, projects, certifications 
        } = req.body;
        const userId = req.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (!user.profile) {
            user.profile = {
                skills: [],
                experienceYears: 0,
                education: [],
                projects: [],
                certifications: [],
                firstJobMode: false,
                githubUrl: ""
            };
        }

        // Basic details (with name & number alias support)
        const nameVal = fullname || name;
        if (nameVal && typeof nameVal === 'string') user.fullname = nameVal.trim();

        if (email && typeof email === 'string') user.email = email.toLowerCase().trim();

        const phoneVal = phoneNumber !== undefined ? phoneNumber : (number !== undefined ? number : phone);
        if (phoneVal !== undefined && phoneVal !== '') {
            const parsedPhone = Number(phoneVal);
            if (!isNaN(parsedPhone)) {
                user.phoneNumber = parsedPhone;
            }
        }

        if (bio !== undefined) user.profile.bio = bio;

        // First Job Mode toggle
        if (firstJobMode !== undefined) {
            user.profile.firstJobMode = firstJobMode === true || firstJobMode === 'true';
        }

        // GitHub Profile URL
        if (githubUrl !== undefined) {
            user.profile.githubUrl = String(githubUrl).trim();
        }

        // Projects
        if (projects !== undefined) {
            try {
                user.profile.projects = typeof projects === 'string' ? JSON.parse(projects) : projects;
            } catch (pErr) {
                console.warn("Projects JSON parse warning:", pErr.message);
            }
        }

        // Certifications
        if (certifications !== undefined) {
            try {
                user.profile.certifications = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
            } catch (cErr) {
                console.warn("Certifications JSON parse warning:", cErr.message);
            }
        }

        // Skills parsing & normalization
        if (skills !== undefined) {
            if (Array.isArray(skills)) {
                user.profile.skills = skills.map(s => String(s).trim()).filter(Boolean);
            } else if (typeof skills === 'string') {
                user.profile.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        // Experience (supports experienceYears, experience, and experienceLevel)
        const expVal = experienceYears !== undefined ? experienceYears : (experience !== undefined ? experience : experienceLevel);
        if (expVal !== undefined && expVal !== '') {
            user.profile.experienceYears = Number(expVal) || 0;
        }

        // Education
        if (education !== undefined) {
            try {
                if (typeof education === 'string') {
                    user.profile.education = JSON.parse(education);
                } else if (Array.isArray(education)) {
                    user.profile.education = education;
                }
            } catch (parseErr) {
                console.warn("Education JSON parse warning:", parseErr.message);
            }
        }


        // Optional file upload (Resume PDF/DOC or Profile Photo)
        if (req.file) {
            const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname?.endsWith('.pdf');
            const isWord = req.file.mimetype.includes('word') || req.file.originalname?.endsWith('.docx');
            
            if (isPdf || isWord) {
                const cloudResponse = await uploadToCloudinary(req.file, "careermatch/resumes");
                if (cloudResponse) {
                    user.profile.resume = cloudResponse.secure_url;
                    user.profile.resumeOriginalName = req.file.originalname;
                }
            } else {
                // Image file: update profile photo
                const cloudResponse = await uploadToCloudinary(req.file, "careermatch/profiles");
                if (cloudResponse) {
                    user.profile.profilePhoto = cloudResponse.secure_url;
                }
            }
        }

        await user.save();

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isBlocked: user.isBlocked,
            savedJobs: user.savedJobs || [],
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: safeUser,
            success: true
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to update profile.",
            success: false
        });
    }
};

export const deleteResume = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        user.profile.resume = "";
        user.profile.resumeOriginalName = "";
        await user.save();

        return res.status(200).json({
            message: "Resume removed successfully.",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                savedJobs: user.savedJobs,
                profile: user.profile
            },
            success: true
        });
    } catch (error) {
        console.error("Delete Resume Error:", error);
        return res.status(500).json({
            message: "Failed to remove resume.",
            success: false
        });
    }
};

export const toggleSaveJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (!user.savedJobs) {
            user.savedJobs = [];
        }

        const isSaved = user.savedJobs.some(id => id.toString() === jobId);
        if (isSaved) {
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        } else {
            user.savedJobs.push(jobId);
        }

        await user.save();

        return res.status(200).json({
            message: isSaved ? "Job removed from saved jobs." : "Job saved successfully.",
            isSaved: !isSaved,
            savedJobs: user.savedJobs,
            success: true
        });
    } catch (error) {
        console.error("Toggle Save Job Error:", error);
        return res.status(500).json({
            message: "Failed to toggle save job.",
            success: false
        });
    }
};

export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: {
                path: 'company'
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        return res.status(200).json({
            savedJobs: user.savedJobs || [],
            success: true
        });
    } catch (error) {
        console.error("Get Saved Jobs Error:", error);
        return res.status(500).json({
            message: "Failed to fetch saved jobs.",
            success: false
        });
    }
};

export const toggleFirstJobMode = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }
        if (!user.profile) {
            user.profile = {};
        }
        user.profile.firstJobMode = !user.profile.firstJobMode;
        await user.save();

        return res.status(200).json({
            message: user.profile.firstJobMode 
                ? "🌱 First Job Mode enabled! Your profile now highlights potential and projects." 
                : "Standard mode restored.",
            firstJobMode: user.profile.firstJobMode,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile
            },
            success: true
        });
    } catch (error) {
        console.error("Toggle First Job Mode Error:", error);
        return res.status(500).json({
            message: "Failed to toggle First Job Mode.",
            success: false
        });
    }
};

// Candidate toggles completion of a specific roadmap phase (1-4) for a target job
export const toggleRoadmapPhase = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId, phaseNumber } = req.body;

        if (!jobId || typeof phaseNumber !== 'number' || phaseNumber < 1 || phaseNumber > 4) {
            return res.status(400).json({
                message: "Target jobId and a valid phaseNumber (1-4) are required.",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (!user.profile) {
            user.profile = {};
        }
        if (!Array.isArray(user.profile.roadmapProgress)) {
            user.profile.roadmapProgress = [];
        }

        let jobProgress = user.profile.roadmapProgress.find(
            p => p.jobId && p.jobId.toString() === jobId.toString()
        );

        let isCompletedNow = false;

        if (!jobProgress) {
            jobProgress = {
                jobId,
                completedPhases: [phaseNumber]
            };
            user.profile.roadmapProgress.push(jobProgress);
            isCompletedNow = true;
        } else {
            if (!Array.isArray(jobProgress.completedPhases)) {
                jobProgress.completedPhases = [];
            }
            const phaseIndex = jobProgress.completedPhases.indexOf(phaseNumber);
            if (phaseIndex > -1) {
                jobProgress.completedPhases.splice(phaseIndex, 1);
                isCompletedNow = false;
            } else {
                jobProgress.completedPhases.push(phaseNumber);
                jobProgress.completedPhases.sort((a, b) => a - b);
                isCompletedNow = true;
            }
        }

        user.markModified('profile.roadmapProgress');
        await user.save();

        const safeUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isBlocked: user.isBlocked,
            savedJobs: user.savedJobs || [],
            profile: user.profile
        };

        return res.status(200).json({
            message: isCompletedNow 
                ? `Phase ${phaseNumber} marked as completed!` 
                : `Phase ${phaseNumber} marked as incomplete.`,
            isCompleted: isCompletedNow,
            completedPhases: jobProgress.completedPhases,
            roadmapProgress: user.profile.roadmapProgress,
            user: safeUser,
            success: true
        });
    } catch (error) {
        console.error("Toggle Roadmap Phase Error:", error);
        return res.status(500).json({
            message: "Failed to update roadmap phase completion.",
            success: false
        });
    }
};

// Candidate retrieves roadmap progress for a specific target job
export const getRoadmapProgress = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const user = await User.findById(userId).select("profile.roadmapProgress");
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const jobProgress = user.profile?.roadmapProgress?.find(
            p => p.jobId && p.jobId.toString() === jobId.toString()
        );

        return res.status(200).json({
            completedPhases: jobProgress?.completedPhases || [],
            success: true
        });
    } catch (error) {
        console.error("Get Roadmap Progress Error:", error);
        return res.status(500).json({
            message: "Failed to fetch roadmap progress.",
            success: false
        });
    }
};