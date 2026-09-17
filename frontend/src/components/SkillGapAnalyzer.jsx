import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setAllJobs } from '@/redux/jobSlice';
import { updateRoadmapProgressInState, setUser } from '@/redux/authSlice';
import { isSkillMatch } from '@/utils/matchUtils';
import { generateSkillRoadmap } from '@/utils/roadmapGenerator';
import { toast } from 'sonner';
import { 
    Sparkles, 
    Target, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Compass, 
    BookOpen, 
    Layers, 
    Briefcase, 
    ChevronRight, 
    Calendar,
    Building2,
    Code,
    Cpu,
    ExternalLink,
    Check,
    Circle
} from 'lucide-react';

const SkillGapAnalyzer = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryJobId = searchParams.get('jobId');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector(store => store.auth);
    const { allJobs } = useSelector(store => store.job);

    const [availableJobs, setAvailableJobs] = useState(allJobs || []);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(queryJobId || '');
    const [completedPhases, setCompletedPhases] = useState([]);
    const [updatingPhase, setUpdatingPhase] = useState(null);

    // Fetch all approved jobs for Skill Gap Analyzer on mount to ensure all approved jobs are available
    useEffect(() => {
        const fetchApprovedJobs = async () => {
            try {
                setLoadingJobs(true);
                const res = await axios.get(`${JOB_API_END_POINT}/get`, { withCredentials: true });
                if (res.data?.success) {
                    const jobsList = res.data.jobs || [];
                    setAvailableJobs(jobsList);
                    dispatch(setAllJobs(jobsList));
                }
            } catch (err) {
                console.error("Failed to load jobs for Skill Gap Analyzer:", err);
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchApprovedJobs();
    }, [dispatch]);

    const targetJobs = availableJobs.length > 0 ? availableJobs : (allJobs || []);

    // Update selected job if URL param changes or default to first job
    useEffect(() => {
        if (queryJobId) {
            setSelectedJobId(queryJobId);
        } else if (targetJobs && targetJobs.length > 0 && (!selectedJobId || !targetJobs.some(j => j._id === selectedJobId))) {
            setSelectedJobId(targetJobs[0]._id);
        }
    }, [queryJobId, targetJobs, selectedJobId]);

    const activeJob = targetJobs.find(j => j._id === selectedJobId) || targetJobs[0] || null;

    // Synchronize completed roadmap phases for the selected target job from Redux user state
    useEffect(() => {
        if (activeJob?._id && user?.profile?.roadmapProgress) {
            const jobEntry = user.profile.roadmapProgress.find(
                item => (item.jobId?._id || item.jobId)?.toString() === activeJob._id.toString()
            );
            setCompletedPhases(jobEntry?.completedPhases || []);
        } else {
            setCompletedPhases([]);
        }
    }, [activeJob?._id, user?.profile?.roadmapProgress]);

    // Fetch fresh roadmap progress from backend on mount or job change if user is logged in
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user || !activeJob?._id) return;
            try {
                const res = await axios.get(`${USER_API_END_POINT}/roadmap/progress/${activeJob._id}`, { withCredentials: true });
                if (res.data.success && Array.isArray(res.data.completedPhases)) {
                    setCompletedPhases(res.data.completedPhases);
                    dispatch(updateRoadmapProgressInState({
                        jobId: activeJob._id,
                        completedPhases: res.data.completedPhases
                    }));
                }
            } catch (err) {
                // Non-critical, fallback to Redux state
            }
        };
        fetchProgress();
    }, [activeJob?._id, user?._id, dispatch]);

    // Toggle completion of a roadmap phase with optimistic UI and MongoDB persistence
    const handleTogglePhase = async (phaseNumber) => {
        if (!user) {
            toast.info("Please log in as a candidate to save your roadmap progress.");
            return;
        }
        if (!activeJob?._id) return;

        const isCurrentlyCompleted = completedPhases.includes(phaseNumber);
        const updatedPhases = isCurrentlyCompleted
            ? completedPhases.filter(p => p !== phaseNumber)
            : [...completedPhases, phaseNumber].sort((a, b) => a - b);

        // Immediate optimistic UI update
        setCompletedPhases(updatedPhases);
        dispatch(updateRoadmapProgressInState({
            jobId: activeJob._id,
            completedPhases: updatedPhases
        }));

        try {
            setUpdatingPhase(phaseNumber);
            const res = await axios.post(
                `${USER_API_END_POINT}/roadmap/toggle-phase`,
                { jobId: activeJob._id, phaseNumber },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                if (res.data.user) {
                    dispatch(setUser(res.data.user));
                }
            }
        } catch (err) {
            console.error("Toggle Roadmap Phase Error:", err);
            toast.error(err?.response?.data?.message || "Failed to update phase completion.");
            // Revert on error
            setCompletedPhases(completedPhases);
            dispatch(updateRoadmapProgressInState({
                jobId: activeJob._id,
                completedPhases
            }));
        } finally {
            setUpdatingPhase(null);
        }
    };

    // Handle dropdown selection
    const handleJobChange = (e) => {
        const newJobId = e.target.value;
        setSelectedJobId(newJobId);
        setSearchParams({ jobId: newJobId });
    };

    // Candidate profile skills
    const candidateSkills = Array.isArray(user?.profile?.skills) ? user.profile.skills : [];

    // Job requirements
    const jobRequirements = Array.isArray(activeJob?.requirements)
        ? activeJob.requirements
        : typeof activeJob?.requirements === 'string'
            ? activeJob.requirements.split(',').map(s => s.trim())
            : [];

    // Compute comparative skill match
    const matchedSkills = [];
    const missingSkills = [];

    jobRequirements.forEach(req => {
        const isMatched = candidateSkills.some(candSkill => isSkillMatch(candSkill, req));
        if (isMatched) {
            matchedSkills.push(req);
        } else {
            missingSkills.push(req);
        }
    });

    // Roadmap calculation
    const roadmap = generateSkillRoadmap(missingSkills, activeJob, candidateSkills);

    const matchPercentage = jobRequirements.length > 0
        ? Math.round((matchedSkills.length / jobRequirements.length) * 100)
        : (candidateSkills.length > 0 ? 100 : 0);

    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Hero Banner */}
                <div className="bg-[#2E2824] rounded-2xl p-6 sm:p-10 text-white shadow-warm-md mb-8 relative overflow-hidden border border-[#3A3530]">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#C1592F]/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#FAF7F3] text-xs font-semibold mb-3 border border-white/15">
                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                            <span>Student Career Accelerator</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#FAF7F3]">
                            Skill Gap Analyzer & Learning Roadmap
                        </h1>
                        <p className="mt-2 text-[#E9E1D6]/90 text-sm sm:text-base leading-relaxed">
                            Discover exactly what skills you have, where you fall short for your dream job, and follow a practical 4-stage roadmap to bridge the gap.
                        </p>
                    </div>

                    {/* Job Selector Dropdown Card */}
                    <div className="mt-6 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center gap-4">
                        <label htmlFor="job-selector" className="text-xs font-semibold uppercase tracking-wider text-[#E9E1D6] shrink-0 flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-accent" />
                            <span>Select Target Job:</span>
                        </label>
                        <div className="relative flex-1 max-w-md">
                            <select
                                id="job-selector"
                                value={selectedJobId}
                                onChange={handleJobChange}
                                className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-[#231E1B] transition-all cursor-pointer"
                            >
                                {targetJobs && targetJobs.length > 0 ? (
                                    targetJobs.map(job => (
                                        <option key={job._id} value={job._id} className="bg-[#2E2824] text-white">
                                            {job.title} — {job.company?.name || 'Company'} ({job.salary} LPA)
                                        </option>
                                    ))
                                ) : (
                                    <option value="" className="bg-[#2E2824] text-white">
                                        {loadingJobs ? 'Loading jobs...' : 'No approved jobs found'}
                                    </option>
                                )}
                            </select>
                        </div>
                        {activeJob && (
                            <Link 
                                to={`/description/${activeJob._id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E9E1D6] hover:text-white hover:underline transition-colors ml-auto"
                            >
                                <span>View Full Posting</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Candidate warning if no profile skills are set */}
                {candidateSkills.length === 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-warning/10 border border-warning/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-text-primary text-sm">
                        <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-warning/20 text-warning font-bold text-xs">TIP</span>
                            <p className="text-xs sm:text-sm">
                                You haven't added any skills to your HireNexa profile yet. Add your skills to get accurate gap analysis!
                            </p>
                        </div>
                        <Link to="/profile">
                            <Button size="sm" className="bg-accent hover:bg-accent-hover text-white text-xs shrink-0 rounded-xl">
                                Add Skills in Profile
                            </Button>
                        </Link>
                    </div>
                )}

                {activeJob ? (
                    <div className="space-y-8">
                        {/* Target Job Overview Card */}
                        <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 rounded-2xl border border-surface-border shadow-warm-sm shrink-0">
                                    <AvatarImage src={activeJob.company?.logo} alt={activeJob.company?.name} />
                                    <AvatarFallback className="bg-bg text-accent font-bold text-base rounded-2xl border border-surface-border">
                                        {activeJob.company?.name ? activeJob.company.name.slice(0, 2).toUpperCase() : 'CO'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-text-primary">{activeJob.title}</h2>
                                        <Badge variant="secondary" className="bg-bg text-accent border border-surface-border text-xs">
                                            {activeJob.jobType || 'Full Time'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-0.5">
                                        {activeJob.company?.name} · {activeJob.location} · {activeJob.salary} LPA
                                    </p>
                                </div>
                            </div>

                            {/* Match Progress Ring / Bar */}
                            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-surface-border pt-4 md:pt-0 md:pl-6">
                                <div className="text-right">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                        Requirement Coverage
                                    </div>
                                    <div className="text-2xl font-black text-text-primary">
                                        {matchPercentage}%
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        {matchedSkills.length} of {jobRequirements.length} skills matched
                                    </div>
                                </div>
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg border-2 shadow-warm-sm shrink-0 transition-all bg-accent/10 text-accent border-accent/30">
                                    {matchPercentage}%
                                </div>
                            </div>
                        </div>

                        {/* 3-Column Comparative View */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-accent" />
                                    <span>Comparative Skills Evaluation</span>
                                </h3>
                                <span className="text-xs text-text-secondary">
                                    Comparing your verified profile vs. role requirements
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Candidate Skills */}
                                <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-warm-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                                                <h4 className="font-bold text-sm text-text-primary">Your Skills ({candidateSkills.length})</h4>
                                            </div>
                                            <span className="text-xs text-text-secondary font-medium">Verified Profile</span>
                                        </div>
                                        {candidateSkills.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {candidateSkills.map((s, idx) => {
                                                    const isUsedInJob = jobRequirements.some(req => isSkillMatch(s, req));
                                                    return (
                                                        <span 
                                                            key={idx} 
                                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border ${
                                                                isUsedInJob 
                                                                    ? 'bg-success/10 text-success border-success/30' 
                                                                    : 'bg-bg text-text-secondary border-surface-border'
                                                            }`}
                                                        >
                                                            {isUsedInJob ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : null}
                                                            <span>{s}</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-text-secondary text-xs">
                                                No skills added yet. Update your profile to populate this column.
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-surface-border mt-4 text-[11px] text-text-secondary">
                                        Green pills indicate direct matches to this job.
                                    </div>
                                </div>

                                {/* Column 2: Job Required Skills */}
                                <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-warm-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                                <h4 className="font-bold text-sm text-text-primary">Required Skills ({jobRequirements.length})</h4>
                                            </div>
                                            <span className="text-xs text-text-secondary font-medium">Job Posting</span>
                                        </div>
                                        {jobRequirements.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {jobRequirements.map((s, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                                                    >
                                                        <Code className="w-3.5 h-3.5 text-accent" />
                                                        <span>{s}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-text-secondary text-xs">
                                                No specific skills declared for this job.
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-surface-border mt-4 text-[11px] text-text-secondary">
                                        Required prerequisites extracted from job requirements.
                                    </div>
                                </div>

                                {/* Column 3: Skill Gaps */}
                                <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-warm-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                                                <h4 className="font-bold text-sm text-text-primary">Identified Gaps ({missingSkills.length})</h4>
                                            </div>
                                            <span className="text-xs text-warning font-medium">Action Needed</span>
                                        </div>
                                        {missingSkills.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {missingSkills.map((s, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-warning/10 text-text-primary border border-warning/30"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 text-warning" />
                                                        <span>{s}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-success font-medium text-xs flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-8 h-8 text-success" />
                                                <span>Zero Skill Gaps Detected!</span>
                                                <span className="text-text-secondary text-[11px]">You meet all listed technical requirements for this role.</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-surface-border mt-4 text-[11px] text-text-secondary">
                                        Skills to learn or document in your resume/portfolio.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Next Skills */}
                        {roadmap.recommendedNextSkills.length > 0 && (
                            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-warm-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider mb-1">
                                            <Compass className="w-4 h-4 text-accent" />
                                            <span>Recommended Next Skills to Learn</span>
                                        </div>
                                        <p className="text-xs text-text-secondary">
                                            Highest-impact skills to unlock interviews for <strong>{activeJob.title}</strong>:
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {roadmap.recommendedNextSkills.map((skill, i) => (
                                            <span 
                                                key={i} 
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bg border border-surface-border text-text-primary font-bold text-xs shadow-warm-sm"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <span>{skill}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Practical 4-Stage Learning Roadmap */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-accent" />
                                        <span>Personalized 4-Stage Learning Roadmap</span>
                                    </h3>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        Step-by-step preparation plan tailored to bridge your skill gap for {activeJob.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-surface-border shadow-warm-xs text-xs font-semibold self-start sm:self-auto">
                                    <span className="text-text-secondary">Progress:</span>
                                    <span className="text-accent font-bold">{completedPhases.length} of 4 Completed</span>
                                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                                        {Math.round((completedPhases.length / 4) * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {roadmap.stages.map((stage) => {
                                    const isCompleted = completedPhases.includes(stage.stageNumber);
                                    return (
                                        <div 
                                            key={stage.stageNumber} 
                                            className={`bg-surface rounded-2xl border p-6 shadow-warm-sm transition-all ${
                                                isCompleted 
                                                    ? 'border-success/40 bg-success/[0.015]' 
                                                    : 'border-surface-border hover:border-accent/40'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-warm-sm transition-colors ${
                                                        isCompleted ? 'bg-success text-white' : 'bg-accent text-white'
                                                    }`}>
                                                        {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : stage.stageNumber}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-base text-text-primary">
                                                                {stage.title}
                                                            </h4>
                                                            {isCompleted ? (
                                                                <Badge variant="secondary" className="bg-success/10 text-success border border-success/20 text-[11px] font-semibold flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Completed</span>
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-bg text-text-secondary border border-surface-border text-[11px]">
                                                                    {stage.badge}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-secondary mt-0.5">
                                                            {stage.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg text-text-secondary border border-surface-border text-xs font-semibold shrink-0 self-start sm:self-auto">
                                                    <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                                                    <span>{stage.timeframe}</span>
                                                </div>
                                            </div>

                                            {/* Key Topics & Milestone */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                                <div>
                                                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-2">
                                                        Key Topics & Learning Objectives
                                                    </span>
                                                    <ul className="space-y-1.5">
                                                        {stage.topics.map((t, tidx) => (
                                                            <li key={tidx} className="flex items-start gap-2 text-xs text-text-secondary">
                                                                <span className="text-accent font-bold mt-0.5">•</span>
                                                                <span className="leading-relaxed">{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-bg rounded-xl p-3.5 border border-surface-border flex flex-col justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                                                            Stage Milestone Goal
                                                        </span>
                                                        <p className="text-xs text-text-secondary leading-relaxed">
                                                            {stage.milestone}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePhase(stage.stageNumber)}
                                                        disabled={updatingPhase === stage.stageNumber}
                                                        className={`mt-3 w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                                            isCompleted 
                                                                ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' 
                                                                : 'bg-surface text-text-secondary border-surface-border hover:border-accent hover:text-accent hover:bg-accent/5'
                                                        }`}
                                                        title={`Click to mark Phase ${stage.stageNumber} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                                        aria-label={`Mark Phase ${stage.stageNumber} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-text-secondary/50 shrink-0" />
                                                            )}
                                                            <span className={isCompleted ? "font-bold text-success" : "text-text-primary"}>
                                                                Phase {stage.stageNumber} of 4
                                                            </span>
                                                        </span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                                            isCompleted ? 'bg-success/20 text-success' : 'bg-bg text-text-secondary border border-surface-border'
                                                        }`}>
                                                            {isCompleted ? 'Completed ✓' : 'Mark Done'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm-sm">
                            <div>
                                <h4 className="font-bold text-sm text-text-primary">Ready to showcase your progress?</h4>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Update your profile with new skills or projects to boost your match score immediately.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link to="/profile" className="flex-1 sm:flex-none">
                                    <Button variant="outline" className="w-full text-xs rounded-xl border-surface-border hover:bg-bg">
                                        Update Profile Skills
                                    </Button>
                                </Link>
                                <Link to={`/description/${activeJob._id}`} className="flex-1 sm:flex-none">
                                    <Button className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl">
                                        <span>View Job & Apply</span>
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                        <Target className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" />
                        <h3 className="font-bold text-base text-text-primary">No Job Selected</h3>
                        <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                            Please select an active job posting above to analyze your skill gaps and generate a personalized roadmap.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SkillGapAnalyzer;
