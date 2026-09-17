import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Activity } from "../models/activity.model.js";
import { calculateJobMatch } from "../utils/matchEngine.js";

// Recruiter creates a job posting
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            experienceLevel,
            position,
            companyId,
            category
        } = req.body;
        const userId = req.id;

        const expValue = experienceLevel !== undefined ? experienceLevel : experience;

        if (!title || !description || !requirements || salary === undefined || !location || !jobType || expValue === undefined || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required to post a job.",
                success: false
            });
        }

        // Verify company exists and belongs to recruiter (or admin)
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Selected company does not exist.",
                success: false
            });
        }

        if (company.userId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You can only post jobs for companies you created.",
                success: false
            });
        }

        // Parse requirements array
        let reqArray = [];
        if (Array.isArray(requirements)) {
            reqArray = requirements.map(r => r.trim()).filter(Boolean);
        } else if (typeof requirements === 'string') {
            reqArray = requirements.split(',').map(r => r.trim()).filter(Boolean);
        }

        // Auto-approve if created by admin, otherwise pending approval
        const initialStatus = req.user?.role === 'admin' ? 'approved' : 'pending';

        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            requirements: reqArray,
            salary: Number(salary) || 0,
            location: location.trim(),
            jobType: jobType.trim(),
            experienceLevel: Number(expValue) || 0,
            position: Number(position) || 1,
            company: companyId,
            created_by: userId,
            category: category || 'Engineering',
            status: initialStatus,
            isActive: true
        });

        // Activity log
        try {
            await Activity.create({
                user: userId,
                actionType: 'JOB_POSTED',
                description: `Job "${job.title}" posted for ${company.name} (Status: ${job.status}).`,
                metadata: { jobId: job._id, companyId: company._id, status: job.status }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(201).json({
            message: initialStatus === 'approved' 
                ? "Job posted and approved successfully." 
                : "Job posted successfully. It is pending admin approval.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Post Job Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to post new job.",
            success: false
        });
    }
};

// Recruiter updates an existing job
export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Ownership verification (IDOR protection)
        if (job.created_by.toString() !== req.id && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to edit this job.",
                success: false
            });
        }

        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            experienceLevel,
            position,
            category,
            isActive
        } = req.body;

        if (title) job.title = title.trim();
        if (description) job.description = description.trim();
        if (location) job.location = location.trim();
        if (jobType) job.jobType = jobType.trim();
        if (salary !== undefined) job.salary = Number(salary) || job.salary;
        if (position !== undefined) job.position = Number(position) || job.position;
        if (category) job.category = category;
        if (isActive !== undefined) job.isActive = Boolean(isActive);

        const expValue = experienceLevel !== undefined ? experienceLevel : experience;
        if (expValue !== undefined) job.experienceLevel = Number(expValue) || job.experienceLevel;

        if (requirements !== undefined) {
            if (Array.isArray(requirements)) {
                job.requirements = requirements.map(r => r.trim()).filter(Boolean);
            } else if (typeof requirements === 'string') {
                job.requirements = requirements.split(',').map(r => r.trim()).filter(Boolean);
            }
        }

        await job.save();

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Update Job Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to update job details.",
            success: false
        });
    }
};

// Recruiter or Admin toggles job active state or closes job
export const toggleJobActive = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        if (job.created_by.toString() !== req.id && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to modify this job.",
                success: false
            });
        }

        job.isActive = !job.isActive;
        await job.save();

        return res.status(200).json({
            message: job.isActive ? "Job reopened successfully." : "Job closed successfully.",
            isActive: job.isActive,
            success: true
        });
    } catch (error) {
        console.error("Toggle Job Active Error:", error);
        return res.status(500).json({
            message: "Failed to update job status.",
            success: false
        });
    }
};

// Candidate / Public job discovery with multi-criteria filtering
export const getAllJobs = async (req, res) => {
    try {
        const {
            keyword,
            location,
            jobType,
            experienceLevel,
            minSalary,
            maxSalary,
            category,
            sort
        } = req.query;

        // Base criteria: only approved and active jobs are publicly visible
        const query = {
            status: 'approved',
            isActive: true
        };

        // Keyword search across title, description, and requirements
        if (keyword && keyword.trim()) {
            const cleanKeyword = keyword.trim();
            query.$or = [
                { title: { $regex: cleanKeyword, $options: "i" } },
                { description: { $regex: cleanKeyword, $options: "i" } },
                { requirements: { $elemMatch: { $regex: cleanKeyword, $options: "i" } } }
            ];
        }

        // Location filter (handles 'Remote' and city names)
        if (location && location.trim() && location.trim().toLowerCase() !== 'all') {
            query.location = { $regex: location.trim(), $options: "i" };
        }

        // Job type filter
        if (jobType && jobType.trim() && jobType.trim().toLowerCase() !== 'all') {
            query.jobType = { $regex: jobType.trim(), $options: "i" };
        }

        // Experience filter (supports experienceLevel and experience)
        const expParam = experienceLevel !== undefined && experienceLevel !== '' 
            ? experienceLevel 
            : (req.query.experience !== undefined && req.query.experience !== '' ? req.query.experience : undefined);

        if (expParam !== undefined) {
            const expNum = Number(expParam);
            if (!isNaN(expNum)) {
                if (expNum === 0) {
                    query.experienceLevel = { $lte: 1 };
                } else if (expNum === 3) {
                    query.experienceLevel = { $gte: 1, $lte: 3 };
                } else if (expNum === 5) {
                    query.experienceLevel = { $gte: 3, $lte: 5 };
                } else {
                    query.experienceLevel = { $gte: expNum };
                }
            }
        }

        // Salary range filter (LPA)
        if ((minSalary !== undefined && minSalary !== '') || (maxSalary !== undefined && maxSalary !== '')) {
            const salaryFilter = {};
            if (minSalary !== undefined && minSalary !== '') {
                const minNum = Number(minSalary);
                if (!isNaN(minNum)) salaryFilter.$gte = minNum;
            }
            if (maxSalary !== undefined && maxSalary !== '') {
                const maxNum = Number(maxSalary);
                if (!isNaN(maxNum)) salaryFilter.$lte = maxNum;
            }
            if (Object.keys(salaryFilter).length > 0) {
                query.salary = salaryFilter;
            }
        }


        // Category filter
        if (category && category.trim() && category.trim().toLowerCase() !== 'all') {
            query.category = { $regex: category.trim(), $options: "i" };
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === 'salary_high') {
            sortOption = { salary: -1 };
        } else if (sort === 'salary_low') {
            sortOption = { salary: 1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const jobs = await Job.find(query)
            .populate({
                path: "company",
                select: "name logo location website description"
            })
            .sort(sortOption);

        // If candidate is logged in, attach deterministic match details to each job
        let jobsWithMatch = jobs;
        if (req.user && req.user.role === 'student') {
            jobsWithMatch = jobs.map(j => {
                const jobObj = j.toObject();
                const matchResult = calculateJobMatch(req.user, jobObj);
                jobObj.matchScore = matchResult.score;
                jobObj.matchLevel = matchResult.matchLevel;
                jobObj.matchedSkills = matchResult.matchedSkills;
                jobObj.missingSkills = matchResult.missingSkills;
                return jobObj;
            });

            // If sorted by match
            if (sort === 'match') {
                jobsWithMatch.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            }
        }

        return res.status(200).json({
            jobs: jobsWithMatch,
            totalJobs: jobsWithMatch.length,
            success: true
        });
    } catch (error) {
        console.error("Get All Jobs Error:", error);
        return res.status(500).json({
            message: "Failed to retrieve jobs.",
            success: false
        });
    }
};

// Candidate / Guest views specific job details
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({
                path: "company"
            })
            .populate({
                path: "applications"
            });

        if (!job) {
            return res.status(404).json({
                message: "Job listing not found.",
                success: false
            });
        }

        const jobObj = job.toObject();

        // Calculate personalized match score if logged in candidate
        if (req.user && req.user.role === 'student') {
            const matchResult = calculateJobMatch(req.user, jobObj);
            jobObj.matchScore = matchResult.score;
            jobObj.matchLevel = matchResult.matchLevel;
            jobObj.matchedSkills = matchResult.matchedSkills;
            jobObj.missingSkills = matchResult.missingSkills;
            jobObj.matchDetails = matchResult.details;
            jobObj.hasSufficientData = matchResult.hasSufficientData;
            jobObj.matchMessage = matchResult.message;
        }

        return res.status(200).json({
            job: jobObj,
            success: true
        });
    } catch (error) {
        console.error("Get Job By Id Error:", error);
        return res.status(500).json({
            message: "Failed to retrieve job details.",
            success: false
        });
    }
};

// Recruiter views all jobs they have posted
export const getAdminJobs = async (req, res) => {
    try {
        const recruiterId = req.id;
        const jobs = await Job.find({ created_by: recruiterId })
            .populate({
                path: 'company'
            })
            .populate({
                path: 'applications',
                match: { withdrawn: false },
                select: 'status createdAt applicant'
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.error("Get Recruiter Jobs Error:", error);
        return res.status(500).json({
            message: "Failed to fetch recruiter jobs.",
            success: false
        });
    }
};
