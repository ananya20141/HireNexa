import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bookmark, MapPin, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toggleSavedJobInState } from '@/redux/authSlice';
import { toast } from 'sonner';
import MatchBadge from './MatchBadge';
import { calculateJobMatch } from '@/utils/matchUtils';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, savedJobs } = useSelector(store => store.auth);
    const [saving, setSaving] = useState(false);

    // Calculate match score if user is logged in candidate
    let matchResult = null;
    if (user && user.role === 'student') {
        matchResult = calculateJobMatch(user, job);
    }

    // Check if saved
    const isSaved = savedJobs?.some(id => (id?._id || id)?.toString() === job?._id?.toString());

    const daysAgoFunction = (mongodbTime) => {
        if (!mongodbTime) return "Recently";
        try {
            const createdAt = new Date(mongodbTime);
            const currentTime = new Date();
            const timeDifference = currentTime - createdAt;
            const days = Math.floor(timeDifference / (1000 * 24 * 60 * 60));
            if (days <= 0) return "Today";
            if (days === 1) return "Yesterday";
            return `${days} days ago`;
        } catch {
            return "Recently";
        }
    };

    const saveJobHandler = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please log in to save jobs.");
            navigate("/login");
            return;
        }

        try {
            setSaving(true);
            const res = await axios.post(`${USER_API_END_POINT}/save-job/${job._id}`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(toggleSavedJobInState(job._id));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Save Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to save job.");
        } finally {
            setSaving(false);
        }
    };

    const getCompanyInitials = (name) => {
        if (!name) return "CO";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div 
            onClick={() => navigate(`/description/${job?._id}`)}
            className="group p-5 rounded-2xl bg-surface border border-surface-border shadow-warm-sm hover:border-accent/60 hover:shadow-warm-md transition-all cursor-pointer flex flex-col justify-between h-full"
        >
            <div>
                {/* Header: Date + Bookmark */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-normal text-text-secondary">
                        {daysAgoFunction(job?.createdAt)}
                    </span>
                    <button
                        onClick={saveJobHandler}
                        disabled={saving}
                        className={`p-1.5 rounded-xl border transition-colors ${
                            isSaved 
                                ? 'bg-accent/10 border-accent/30 text-accent' 
                                : 'bg-transparent border-surface-border text-text-secondary/60 hover:text-accent hover:border-accent/30'
                        }`}
                        title={isSaved ? "Remove from saved jobs" : "Save for later"}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-accent' : ''}`} />
                    </button>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-3 my-2">
                    <Avatar className="h-10 w-10 rounded-xl border border-surface-border shadow-warm-sm shrink-0">
                        <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
                        <AvatarFallback className="bg-muted text-accent font-bold text-xs rounded-xl">
                            {getCompanyInitials(job?.company?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <h2 className="font-semibold text-sm text-text-primary truncate">
                            {job?.company?.name || "Company"}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                            <MapPin className="w-3 h-3 text-text-secondary/60 shrink-0" />
                            <span className="truncate">{job?.location || "India"}</span>
                        </div>
                    </div>
                </div>

                {/* Job Title & Snippet */}
                <div className="my-3">
                    <h3 className="font-bold text-base text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                        {job?.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {job?.description}
                    </p>
                </div>

                {/* Match Score Bar */}
                {matchResult && matchResult.hasSufficientData ? (
                    <div className="mb-3 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1.5">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                <span className="text-success font-bold">{matchResult.score}% Match</span>
                                <span className="text-text-secondary/70">• {matchResult.matchLevel}</span>
                            </span>
                            {matchResult.isFirstJobMode && (
                                <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/30">
                                    First Job
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-success h-1.5 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${matchResult.score}%` }}
                            />
                        </div>
                    </div>
                ) : matchResult && (
                    <div className="mb-3">
                        <MatchBadge 
                            score={matchResult.score} 
                            matchLevel={matchResult.matchLevel} 
                            size="sm" 
                            hasSufficientData={matchResult.hasSufficientData}
                            isFirstJobMode={matchResult.isFirstJobMode}
                        />
                    </div>
                )}

                {/* Badges / Metrics */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="bg-bg text-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-lg border border-surface-border">
                        {job?.position || 1} {job?.position === 1 ? 'Opening' : 'Openings'}
                    </span>
                    <span className="bg-warning/10 text-warning text-[11px] font-medium px-2 py-0.5 rounded-lg border border-warning/30">
                        {job?.jobType || 'Full Time'}
                    </span>
                    <span className="bg-success/10 text-success text-[11px] font-bold px-2 py-0.5 rounded-lg border border-success/30">
                        {job?.salary} LPA
                    </span>
                    <span className="bg-bg text-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-lg border border-surface-border">
                        {job?.experienceLevel || 0} yrs exp
                    </span>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-surface-border">
                <span className="text-xs font-bold text-accent group-hover:text-accent-hover flex items-center gap-1">
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={saveJobHandler}
                    className="text-xs h-8 px-3 rounded-xl border-surface-border hover:bg-muted text-text-primary font-medium"
                >
                    {isSaved ? 'Saved' : 'Save'}
                </Button>
            </div>
        </div>
    );
};

export default Job;