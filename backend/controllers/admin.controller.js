import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { Activity } from "../models/activity.model.js";

// System KPI Dashboard metrics
export const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCandidates,
            totalRecruiters,
            totalJobs,
            pendingJobs,
            approvedJobs,
            rejectedJobs,
            flaggedJobs,
            totalApplications,
            recentActivity
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'recruiter' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'pending' }),
            Job.countDocuments({ status: 'approved' }),
            Job.countDocuments({ status: 'rejected' }),
            Job.countDocuments({ isFlagged: true }),
            Application.countDocuments(),
            Activity.find().sort({ createdAt: -1 }).limit(10).populate('user', 'fullname email role')
        ]);

        return res.status(200).json({
            stats: {
                totalUsers,
                totalCandidates,
                totalRecruiters,
                totalJobs,
                pendingJobs,
                approvedJobs,
                rejectedJobs,
                flaggedJobs,
                totalApplications
            },
            recentActivity: recentActivity || [],
            success: true
        });
    } catch (error) {
        console.error("Get Admin Stats Error:", error);
        return res.status(500).json({
            message: "Failed to retrieve administrator statistics.",
            success: false
        });
    }
};

// Admin views all jobs across the system with status filters
export const getAllJobsForAdmin = async (req, res) => {
    try {
        const { status, isFlagged, keyword } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }
        if (isFlagged === 'true') {
            filter.isFlagged = true;
        }
        if (keyword && keyword.trim()) {
            filter.$or = [
                { title: { $regex: keyword.trim(), $options: 'i' } },
                { description: { $regex: keyword.trim(), $options: 'i' } }
            ];
        }

        const jobs = await Job.find(filter)
            .populate('company', 'name logo location')
            .populate('created_by', 'fullname email phoneNumber')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            total: jobs.length,
            success: true
        });
    } catch (error) {
        console.error("Get Admin Jobs Error:", error);
        return res.status(500).json({
            message: "Failed to fetch platform job listings.",
            success: false
        });
    }
};

// Admin approves, rejects, or updates status of a job
export const updateJobStatus = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { status, flagReason } = req.body;

        const job = await Job.findById(jobId).populate('company');
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        const allowedStatuses = ['pending', 'approved', 'rejected'];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: [${allowedStatuses.join(', ')}].`,
                success: false
            });
        }

        if (status) job.status = status;
        if (flagReason !== undefined) {
            job.flagReason = flagReason;
            job.isFlagged = Boolean(flagReason);
        }

        await job.save();

        // Activity log
        try {
            await Activity.create({
                user: req.id,
                actionType: status === 'approved' ? 'JOB_APPROVED' : 'JOB_REJECTED',
                description: `Admin updated job "${job.title}" status to "${job.status}".`,
                metadata: { jobId: job._id, status: job.status }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: `Job status successfully updated to ${job.status}.`,
            job,
            success: true
        });
    } catch (error) {
        console.error("Update Job Status Error:", error);
        return res.status(500).json({
            message: "Failed to update job status.",
            success: false
        });
    }
};

// Admin flags or unflags a job for moderation
export const flagJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { isFlagged, flagReason } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        job.isFlagged = isFlagged !== undefined ? Boolean(isFlagged) : !job.isFlagged;
        job.flagReason = flagReason || (job.isFlagged ? "Flagged by administrator for review." : "");
        await job.save();

        try {
            await Activity.create({
                user: req.id,
                actionType: 'JOB_FLAGGED',
                description: `Job "${job.title}" was ${job.isFlagged ? 'flagged' : 'unflagged'} by admin. Reason: ${job.flagReason}`,
                metadata: { jobId: job._id, isFlagged: job.isFlagged }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: job.isFlagged ? "Job flagged for review." : "Job unflagged successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Flag Job Error:", error);
        return res.status(500).json({
            message: "Failed to update job flag status.",
            success: false
        });
    }
};

// Admin deletes a job listing completely
export const deleteJobByAdmin = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Also clean up application references
        await Application.deleteMany({ job: jobId });

        try {
            await Activity.create({
                user: req.id,
                actionType: 'JOB_DELETED',
                description: `Admin deleted job listing: "${job.title}".`,
                metadata: { jobId }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: "Job listing and related applications removed successfully.",
            success: true
        });
    } catch (error) {
        console.error("Delete Job By Admin Error:", error);
        return res.status(500).json({
            message: "Failed to delete job.",
            success: false
        });
    }
};

// Admin views list of recruiters and their companies
export const getRecruiters = async (req, res) => {
    try {
        const recruiters = await User.find({ role: 'recruiter' })
            .select('-password')
            .sort({ createdAt: -1 });

        // Enrich with company and posted job count
        const enrichedRecruiters = await Promise.all(recruiters.map(async (recruiter) => {
            const [companies, jobCount] = await Promise.all([
                Company.find({ userId: recruiter._id }),
                Job.countDocuments({ created_by: recruiter._id })
            ]);
            const recObj = recruiter.toObject();
            recObj.companies = companies || [];
            recObj.jobCount = jobCount || 0;
            return recObj;
        }));

        return res.status(200).json({
            recruiters: enrichedRecruiters,
            success: true
        });
    } catch (error) {
        console.error("Get Recruiters Error:", error);
        return res.status(500).json({
            message: "Failed to fetch recruiters list.",
            success: false
        });
    }
};

// Admin views list of candidates
export const getCandidates = async (req, res) => {
    try {
        const candidates = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        const enrichedCandidates = await Promise.all(candidates.map(async (cand) => {
            const appCount = await Application.countDocuments({ applicant: cand._id, withdrawn: false });
            const candObj = cand.toObject();
            candObj.applicationCount = appCount;
            candObj.hasResume = !!cand.profile?.resume;
            return candObj;
        }));

        return res.status(200).json({
            candidates: enrichedCandidates,
            success: true
        });
    } catch (error) {
        console.error("Get Candidates Error:", error);
        return res.status(500).json({
            message: "Failed to fetch candidates list.",
            success: false
        });
    }
};

// Admin blocks or unblocks any user
export const toggleUserBlock = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const user = await User.findById(targetUserId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                message: "Cannot suspend administrator accounts.",
                success: false
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        try {
            await Activity.create({
                user: req.id,
                actionType: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
                description: `Admin ${user.isBlocked ? 'blocked' : 'unblocked'} user ${user.fullname} (${user.email}).`,
                metadata: { targetUserId: user._id, isBlocked: user.isBlocked }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: user.isBlocked ? `User ${user.fullname} has been blocked.` : `User ${user.fullname} has been unblocked.`,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked
            },
            success: true
        });
    } catch (error) {
        console.error("Toggle User Block Error:", error);
        return res.status(500).json({
            message: "Failed to update user block status.",
            success: false
        });
    }
};

// Admin views system activity logs
export const getActivityFeed = async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('user', 'fullname email role');

        return res.status(200).json({
            activities: activities || [],
            success: true
        });
    } catch (error) {
        console.error("Get Activity Feed Error:", error);
        return res.status(500).json({
            message: "Failed to fetch activity logs.",
            success: false
        });
    }
};

// Admin views all candidate applications platform-wide
export const getAllApplicationsForAdmin = async (req, res) => {
    try {
        const { status, keyword } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        let applications = await Application.find(filter)
            .populate('applicant', 'fullname email phoneNumber profile')
            .populate({
                path: 'job',
                select: 'title location company created_by',
                populate: [
                    { path: 'company', select: 'name logo location' },
                    { path: 'created_by', select: 'fullname email phoneNumber' }
                ]
            })
            .sort({ createdAt: -1 });

        // If search keyword is provided, filter across candidate name/email or job title/company name
        if (keyword && keyword.trim()) {
            const term = keyword.trim().toLowerCase();
            applications = applications.filter(app => {
                const candidateName = app.applicant?.fullname?.toLowerCase() || '';
                const candidateEmail = app.applicant?.email?.toLowerCase() || '';
                const jobTitle = app.job?.title?.toLowerCase() || '';
                const companyName = app.job?.company?.name?.toLowerCase() || '';
                const recruiterName = app.job?.created_by?.fullname?.toLowerCase() || '';
                return candidateName.includes(term) ||
                       candidateEmail.includes(term) ||
                       jobTitle.includes(term) ||
                       companyName.includes(term) ||
                       recruiterName.includes(term);
            });
        }

        return res.status(200).json({
            applications: applications || [],
            total: applications.length,
            success: true
        });
    } catch (error) {
        console.error("Get Admin Applications Error:", error);
        return res.status(500).json({
            message: "Failed to fetch platform candidate applications.",
            success: false
        });
    }
};
