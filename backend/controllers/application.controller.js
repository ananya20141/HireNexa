import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Activity } from "../models/activity.model.js";
import { calculateJobMatch } from "../utils/matchEngine.js";

// Candidate applies for a job
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Verify candidate role
        if (req.user?.role !== 'student' && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "Only candidates can apply to jobs.",
                success: false
            });
        }

        // Check if job exists, is active and approved
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job listing not found.",
                success: false
            });
        }

        if (!job.isActive || job.status !== 'approved') {
            return res.status(400).json({
                message: "This job listing is currently not accepting applications.",
                success: false
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId,
            withdrawn: false
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already submitted an application for this position.",
                success: false
            });
        }

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            status: 'applied'
        });

        job.applications.push(newApplication._id);
        await job.save();

        // Activity log
        try {
            await Activity.create({
                user: userId,
                actionType: 'APPLICATION_SUBMITTED',
                description: `Candidate applied for job: "${job.title}".`,
                metadata: { jobId: job._id, applicationId: newApplication._id }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(201).json({
            message: "Application submitted successfully.",
            application: newApplication,
            success: true
        });
    } catch (error) {
        console.error("Apply Job Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to submit application.",
            success: false
        });
    }
};

// Candidate withdraws their own application
export const withdrawApplication = async (req, res) => {
    try {
        const userId = req.id;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        if (application.applicant.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to withdraw this application.",
                success: false
            });
        }

        if (application.status === 'hired' || application.status === 'accepted') {
            return res.status(400).json({
                message: "Cannot withdraw an accepted or hired application.",
                success: false
            });
        }

        application.withdrawn = true;
        application.status = 'rejected';
        await application.save();

        // Activity log
        try {
            await Activity.create({
                user: userId,
                actionType: 'APPLICATION_WITHDRAWN',
                description: `Application ${application._id} was withdrawn by the candidate.`
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: "Application withdrawn successfully.",
            success: true
        });
    } catch (error) {
        console.error("Withdraw Application Error:", error);
        return res.status(500).json({
            message: "Failed to withdraw application.",
            success: false
        });
    }
};

// Candidate views their submitted applications
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId, withdrawn: false })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name logo location'
                }
            });

        return res.status(200).json({
            application: applications || [],
            success: true
        });
    } catch (error) {
        console.error("Get Applied Jobs Error:", error);
        return res.status(500).json({
            message: "Failed to retrieve applied jobs.",
            success: false
        });
    }
};

// Recruiter views applicants for a job (with IDOR protection and live Match Scores)
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({
                path: 'company',
                select: 'name logo'
            })
            .populate({
                path: 'applications',
                match: { withdrawn: false },
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'applicant',
                    select: 'fullname email phoneNumber profile createdAt'
                }
            });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // IDOR ownership check: recruiter must own the job or be admin
        if (job.created_by.toString() !== req.id && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to view applicants for this job posting.",
                success: false
            });
        }

        // Attach deterministic match score to each applicant
        const jobObj = job.toObject();
        if (jobObj.applications && jobObj.applications.length > 0) {
            jobObj.applications = jobObj.applications.map(app => {
                if (app.applicant) {
                    const match = calculateJobMatch(app.applicant, jobObj);
                    app.matchScore = match.score;
                    app.matchLevel = match.matchLevel;
                    app.matchedSkills = match.matchedSkills;
                    app.missingSkills = match.missingSkills;
                }
                return app;
            });
        }

        return res.status(200).json({
            job: jobObj,
            success: true
        });
    } catch (error) {
        console.error("Get Applicants Error:", error);
        return res.status(500).json({
            message: "Failed to fetch applicants.",
            success: false
        });
    }
};

// Recruiter updates an applicant's status
export const updateStatus = async (req, res) => {
    try {
        const { status, interviewDate, assessmentDate, reminderNote } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: "Status value is required.",
                success: false
            });
        }

        const normalizedStatus = status.toLowerCase().trim().replace(" ", "_");
        const allowedStatuses = [
            'applied', 'pending', 'under_review', 'shortlisted', 
            'assessment', 'interview', 'accepted', 'selected', 'rejected', 'hired'
        ];

        if (!allowedStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: [${allowedStatuses.join(', ')}].`,
                success: false
            });
        }

        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({
                message: "Application record not found.",
                success: false
            });
        }

        // Ownership check: logged in user must own the job or be admin
        if (application.job?.created_by?.toString() !== req.id && req.user?.role !== 'admin') {
            return res.status(403).json({
                message: "You are not authorized to update applications for this job.",
                success: false
            });
        }

        application.status = normalizedStatus;

        // Maintain status progression history
        if (!Array.isArray(application.statusHistory)) {
            application.statusHistory = [];
        }
        application.statusHistory.push({
            status: normalizedStatus,
            updatedAt: new Date()
        });

        // Optional dates and notes for assessment / interview stages
        if (interviewDate !== undefined) {
            application.interviewDate = interviewDate ? new Date(interviewDate) : null;
        }
        if (assessmentDate !== undefined) {
            application.assessmentDate = assessmentDate ? new Date(assessmentDate) : null;
        }
        if (reminderNote !== undefined) {
            application.reminderNote = String(reminderNote).trim();
        }

        await application.save();

        // Activity log
        try {
            await Activity.create({
                user: req.id,
                actionType: 'APPLICATION_STATUS_UPDATED',
                description: `Application status updated to "${normalizedStatus}" for ${application.job?.title}.`,
                metadata: { applicationId: application._id, newStatus: normalizedStatus }
            });
        } catch (logErr) {
            console.error("Activity log error:", logErr?.message);
        }

        return res.status(200).json({
            message: `Application status updated to ${normalizedStatus}.`,
            application,
            success: true
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({
            message: error?.message || "Failed to update application status.",
            success: false
        });
    }
};