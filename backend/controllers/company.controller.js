import { Company } from "../models/company.model.js";
import { Activity } from "../models/activity.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Safe cloudinary upload helper with DataURI fallback
const uploadToCloudinary = async (file, folder = "careermatch/companies") => {
    try {
        if (!file || !file.buffer) return null;
        const fileUri = getDataUri(file);
        if (!fileUri || !fileUri.content) return null;

        // Try Cloudinary upload if valid credentials exist
        const hasCloudinary = process.env.CLOUD_NAME && 
                             !process.env.CLOUD_NAME.includes("<your-") && 
                             process.env.API_KEY && 
                             !process.env.API_KEY.includes("<your-");

        if (hasCloudinary) {
            try {
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    folder,
                    resource_type: "image"
                });
                if (cloudResponse?.secure_url) {
                    return cloudResponse.secure_url;
                }
            } catch (cloudErr) {
                console.warn("Cloudinary company logo upload failed, using DataURI fallback:", cloudErr?.message);
            }
        }

        // Safe fallback to data URI if Cloudinary is unconfigured or upload fails
        return fileUri.content;
    } catch (uploadError) {
        console.error("Company logo upload error:", uploadError?.message || uploadError);
        return null;
    }
};

export const registerCompany = async (req, res) => {
    try {
        const { companyName, name, description, website, location } = req.body;
        const targetName = companyName || name;
        if (!targetName || !targetName.trim()) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        const existingCompany = await Company.findOne({ name: { $regex: new RegExp(`^${targetName.trim()}$`, "i") } });
        if (existingCompany) {
            return res.status(400).json({
                message: "A company with this name is already registered.",
                success: false
            });
        }

        let logo = "";
        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    message: "Only image files (PNG, JPG, JPEG, WebP, SVG) are allowed for company logo.",
                    success: false
                });
            }
            const logoUrl = await uploadToCloudinary(req.file);
            if (logoUrl) {
                logo = logoUrl;
            }
        }


        const company = await Company.create({
            name: targetName.trim(),
            description: description || "",
            website: website || "",
            location: location || "",
            logo,
            userId: req.id
        });


        // Activity log
        try {
            await Activity.create({
                user: req.id,
                actionType: 'COMPANY_CREATED',
                description: `Company "${company.name}" registered.`,
                metadata: { companyId: company._id }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });
    } catch (error) {
        console.error("Register Company Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to register company.",
            success: false
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            companies: companies || [],
            success: true
        });
    } catch (error) {
        console.error("Get Company Error:", error);
        return res.status(500).json({
            message: "Failed to fetch companies.",
            success: false
        });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        return res.status(200).json({
            company,
            success: true
        });
    } catch (error) {
        console.error("Get Company By Id Error:", error);
        return res.status(500).json({
            message: "Failed to retrieve company details.",
            success: false
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const companyId = req.params.id;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        // Ownership verification (IDOR protection)
        if (company.userId.toString() !== req.id && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to update this company.",
                success: false
            });
        }

        const updateData = {};
        const nameVal = name || req.body.companyName;
        if (nameVal && typeof nameVal === 'string') updateData.name = nameVal.trim();
        if (description !== undefined) updateData.description = description;
        if (website !== undefined) updateData.website = website;
        if (location !== undefined) updateData.location = location;


        // Logo upload is completely OPTIONAL
        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    message: "Only image files (PNG, JPG, JPEG, WebP, SVG) are allowed for company logo.",
                    success: false
                });
            }
            const logoUrl = await uploadToCloudinary(req.file);
            if (logoUrl) {
                updateData.logo = logoUrl;
            }
        }

        const updatedCompany = await Company.findByIdAndUpdate(companyId, updateData, { new: true });

        return res.status(200).json({
            message: "Company information updated successfully.",
            company: updatedCompany,
            success: true
        });
    } catch (error) {
        console.error("Update Company Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to update company information.",
            success: false
        });
    }
};