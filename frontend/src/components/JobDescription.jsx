import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { toggleSavedJobInState } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
    Briefcase, 
    MapPin, 
    IndianRupee, 
    Calendar, 
    Users, 
    Bookmark, 
    Loader2, 
    CheckCircle, 
    Building2, 
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import MatchBreakdown from './MatchBreakdown';
import { calculateJobMatch } from '@/utils/matchUtils';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user, savedJobs } = useSelector(store => store.auth);
    const [loadingJob, setLoadingJob] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check application status safely
    const isApplied = Boolean(Array.isArray(singleJob?.applications) && singleJob.applications.some(app => {
        const appUserId = app?.applicant?._id || app?.applicant || app;
        return appUserId?.toString() === user?._id?.toString();
    }));

    // Check bookmark status
    const isSaved = Boolean(Array.isArray(savedJobs) && savedJobs.some(id => (id?._id || id)?.toString() === jobId?.toString()));

    // Calculate match score
    let matchResult = null;
    if (user && user.role === 'student' && singleJob) {
        matchResult = calculateJobMatch(user, singleJob);
    }

    const fetchSingleJob = async () => {
        try {
            setLoadingJob(true);
            const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setSingleJob(res.data.job));
            }
        } catch (error) {
            console.error("Fetch Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load job details.");
        } finally {
            setLoadingJob(false);
        }
    };

    useEffect(() => {
        fetchSingleJob();
    }, [jobId]);

    const applyJobHandler = async () => {
        if (!user) {
            toast.error("Please login to submit your application.");
            navigate("/login");
            return;
        }

        if (user.role !== 'student') {
            toast.error("Only candidate accounts can apply to jobs.");
            return;
        }

        try {
            setApplying(true);
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                const updatedApplications = [...(singleJob?.applications || []), { applicant: user._id }];
                dispatch(setSingleJob({ ...singleJob, applications: updatedApplications }));
            }
        } catch (error) {
            console.error("Apply Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to apply.");
        } finally {
            setApplying(false);
        }
    };

    const saveJobHandler = async () => {
        if (!user) {
            toast.error("Please log in to save jobs.");
            navigate("/login");
            return;
        }

        try {
            setSaving(true);
            const res = await axios.post(`${USER_API_END_POINT}/save-job/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(toggleSavedJobInState(jobId));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Save Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to toggle save job.");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Recently";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Recently";
            return date.toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "Recently";
        }
    };

    const getCompanyInitials = (name) => {
        if (!name) return "CO";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Back button */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to job listings</span>
                    </button>

                    {loadingJob ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-text-secondary">Loading comprehensive job details...</p>
                        </div>
                    ) : !singleJob ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <p className="text-base font-bold text-text-primary">Job Not Found</p>
                            <p className="text-xs text-text-secondary mt-1">This posting may have been closed or removed by the recruiter.</p>
                            <Link to="/jobs" className="mt-4 inline-block">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white rounded-xl shadow-warm-sm">Browse Active Jobs</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header Card */}
                            <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 shadow-warm-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
                                    <div className="flex items-start sm:items-center gap-4">
                                        <Avatar className="h-14 w-14 rounded-2xl border border-surface-border shadow-warm-sm shrink-0">
                                            <AvatarImage src={singleJob?.company?.logo} alt={singleJob?.company?.name} />
                                            <AvatarFallback className="bg-muted text-accent font-bold text-base rounded-2xl">
                                                {getCompanyInitials(singleJob?.company?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                                                {singleJob?.title}
                                            </h1>
                                            <p className="text-sm font-medium text-text-secondary mt-0.5">
                                                {singleJob?.company?.name} · {singleJob?.location}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            onClick={saveJobHandler}
                                            disabled={saving}
                                            className={`rounded-xl border-surface-border flex items-center gap-1.5 ${
                                                isSaved ? 'text-accent bg-accent/10 border-accent/30' : 'text-text-primary hover:bg-muted'
                                            }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-accent' : ''}`} />
                                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                                        </Button>

                                        {user?.role !== 'recruiter' && (
                                            <Button
                                                onClick={applyJobHandler}
                                                disabled={isApplied || applying}
                                                className={`rounded-xl px-6 font-semibold shadow-warm-sm flex items-center gap-2 ${
                                                    isApplied 
                                                        ? 'bg-success hover:bg-success text-white cursor-default' 
                                                        : 'bg-accent hover:bg-accent-hover text-white'
                                                }`}
                                            >
                                                {applying ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Submitting...</span>
                                                    </>
                                                ) : isApplied ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Already Applied</span>
                                                    </>
                                                ) : (
                                                    <span>Apply Now</span>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Key Tags Bar */}
                                <div className="flex flex-wrap gap-2.5 pt-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-warning/10 text-warning border border-warning/30 text-xs font-semibold">
                                        <Briefcase className="w-3.5 h-3.5 text-warning" />
                                        <span>{singleJob?.jobType}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-success/10 text-success border border-success/30 text-xs font-bold">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        <span>{singleJob?.salary} LPA</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg text-text-secondary border border-surface-border text-xs font-semibold">
                                        <span>Experience: {singleJob?.experienceLevel ?? 0} yrs</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg text-text-secondary border border-surface-border text-xs font-semibold">
                                        <Users className="w-3.5 h-3.5 text-text-secondary/60" />
                                        <span>{singleJob?.position} {singleJob?.position === 1 ? 'Opening' : 'Openings'}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg text-text-secondary border border-surface-border text-xs font-semibold">
                                        <Calendar className="w-3.5 h-3.5 text-text-secondary/60" />
                                        <span>Posted {formatDate(singleJob?.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deterministic Resume-Job Match Breakdown */}
                            {user && user.role === 'student' && matchResult && (
                                <MatchBreakdown matchResult={matchResult} candidateName={user.fullname} compact={false} jobId={jobId} />
                            )}

                            {/* Job Description & Requirements */}
                            <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 shadow-warm-sm space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary border-b border-surface-border pb-3">
                                        Job Description
                                    </h2>
                                    <div className="mt-4 text-sm text-text-primary leading-relaxed whitespace-pre-line">
                                        {singleJob?.description}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                                        <h2 className="text-lg font-bold text-text-primary">
                                            Key Technical Requirements & Skills
                                        </h2>
                                        {user && user.role === 'student' && (
                                            <Link 
                                                to={`/skill-gap-analyzer?jobId=${jobId}`} 
                                                className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 hover:underline"
                                            >
                                                <span>Skill Gap Analyzer</span>
                                                <Sparkles className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {Array.isArray(singleJob?.requirements) && singleJob.requirements.length > 0 ? (
                                             singleJob.requirements.map((req, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1 rounded-lg text-xs font-medium bg-bg text-text-primary border border-surface-border"
                                                >
                                                    {req}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-text-secondary/60">No specific requirements listed.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Company details footer */}
                                {singleJob?.company && (
                                    <div className="pt-4 border-t border-surface-border">
                                        <h2 className="text-sm font-bold text-text-primary mb-2">About the Company</h2>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {singleJob?.company?.description || `${singleJob?.company?.name} is actively hiring on HireNexa.`}
                                        </p>
                                        {singleJob?.company?.website && (
                                            <a 
                                                href={singleJob.company.website.startsWith('http') ? singleJob.company.website : `https://${singleJob.company.website}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-block mt-2 text-xs font-semibold text-accent hover:underline"
                                            >
                                                Visit Company Website →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default JobDescription;
