import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Calendar, 
    Loader2, 
    Briefcase, 
    Users, 
    ChevronDown, 
    UserCheck, 
    Video, 
    ClipboardCheck, 
    PartyPopper, 
    XCircle,
    ExternalLink 
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { updateApplicantStatus } from '@/redux/applicationSlice';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import MatchBadge from '../MatchBadge';
import { Badge } from '../ui/badge';

const ApplicantsTable = ({ onStatusChange, isMultiJob, loading = false }) => {
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = searchParams.get('status') || 'all';

    // Schedule modal state
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [pendingStatus, setPendingStatus] = useState("");
    const [scheduledDateTime, setScheduledDateTime] = useState("");
    const [reminderNote, setReminderNote] = useState("");
    const [savingStatus, setSavingStatus] = useState(false);
    const [activeActionId, setActiveActionId] = useState(null);

    const openScheduleDialog = (app, status) => {
        setSelectedApplication(app);
        setPendingStatus(status);
        const existingDate = status === 'interview' ? app.interviewDate : app.assessmentDate;
        setScheduledDateTime(existingDate ? new Date(existingDate).toISOString().slice(0, 16) : "");
        setReminderNote(app.reminderNote || "");
        setScheduleDialogOpen(true);
    };

    const statusHandler = async (status, applicationId, customPayload = {}) => {
        try {
            setSavingStatus(true);
            setActiveActionId(applicationId);
            const payload = { status, ...customPayload };
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${applicationId}/update`, payload, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(updateApplicantStatus({ applicationId, ...payload }));
                toast.success(res.data.message || `Application status updated to ${status.replace('_', ' ')}.`);
                if (onStatusChange) onStatusChange();
            }
        } catch (error) {
            console.error("Update Status Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update application status.");
        } finally {
            setSavingStatus(false);
            setActiveActionId(null);
            setScheduleDialogOpen(false);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedApplication) return;

        const customPayload = {
            reminderNote
        };

        if (pendingStatus === 'interview') {
            customPayload.interviewDate = scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null;
        } else if (pendingStatus === 'assessment') {
            customPayload.assessmentDate = scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null;
        }

        await statusHandler(pendingStatus, selectedApplication._id, customPayload);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "N/A";
        }
    };

    const formatStatusBadge = (status) => {
        switch (status) {
            case 'hired':
            case 'accepted':
            case 'selected':
                return <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[11px] font-semibold">Selected / Hired</Badge>;
            case 'interview':
                return <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[11px] font-semibold">Interview</Badge>;
            case 'assessment':
                return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border border-warning/20 text-[11px] font-semibold">Assessment</Badge>;
            case 'shortlisted':
                return <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[11px] font-semibold">Shortlisted</Badge>;
            case 'under_review':
                return <Badge className="bg-bg text-text-secondary hover:bg-bg border border-surface-border text-[11px] font-semibold">Under Review</Badge>;
            case 'rejected':
                return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[11px] font-semibold">Rejected</Badge>;
            case 'applied':
            default:
                return <Badge className="bg-bg text-text-secondary hover:bg-bg border border-surface-border text-[11px] font-semibold">Applied</Badge>;
        }
    };

    const filterTabs = [
        { label: "All", value: "all" },
        { label: "Shortlisted", value: "shortlisted" },
        { label: "Interviews", value: "interview" },
        { label: "Offers / Hired", value: "hired" },
        { label: "Under Review", value: "under_review" },
        { label: "Rejected", value: "rejected" }
    ];

    const applications = applicants?.applications || [];

    const getCount = (val) => {
        if (val === 'all') return applications.length;
        if (val === 'shortlisted') return applications.filter(a => a?.status === 'shortlisted').length;
        if (val === 'interview') return applications.filter(a => a?.status === 'interview' || a?.status === 'assessment').length;
        if (val === 'hired') return applications.filter(a => ['accepted', 'selected', 'hired'].includes(a?.status)).length;
        if (val === 'under_review') return applications.filter(a => ['under_review', 'applied', 'pending'].includes(a?.status)).length;
        if (val === 'rejected') return applications.filter(a => ['rejected', 'withdrawn'].includes(a?.status)).length;
        return 0;
    };

    const filteredApplications = applications.filter((item) => {
        if (!item) return false;
        if (statusParam === 'all') return true;
        if (statusParam === 'shortlisted') return item.status === 'shortlisted';
        if (statusParam === 'interview') return item.status === 'interview' || item.status === 'assessment';
        if (statusParam === 'hired') return ['accepted', 'selected', 'hired'].includes(item.status);
        if (statusParam === 'under_review') return ['under_review', 'applied', 'pending'].includes(item.status);
        if (statusParam === 'rejected') return ['rejected', 'withdrawn'].includes(item.status);
        return item.status === statusParam;
    });

    return (
        <>
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {filterTabs.map(tab => {
                    const count = getCount(tab.value);
                    const isActive = statusParam === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                if (tab.value === 'all') {
                                    newParams.delete('status');
                                } else {
                                    newParams.set('status', tab.value);
                                }
                                setSearchParams(newParams);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isActive 
                                    ? 'bg-accent text-white shadow-warm-sm' 
                                    : 'bg-surface border border-surface-border text-text-secondary hover:bg-bg hover:text-text-primary'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-bg text-text-secondary'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                <Table>
                    <TableCaption className="pb-3 text-xs text-text-secondary">
                        Candidate applications with deterministic Resume–Job match scores and stage management controls.
                    </TableCaption>
                    <TableHeader className="bg-bg">
                        <TableRow>
                            <TableHead className="text-xs font-bold text-text-primary">Candidate</TableHead>
                            <TableHead className="text-xs font-bold text-text-primary">Contact</TableHead>
                            <TableHead className="text-xs font-bold text-text-primary">Match Score</TableHead>
                            <TableHead className="text-xs font-bold text-text-primary">Resume / Profile</TableHead>
                            <TableHead className="text-xs font-bold text-text-primary">Applied Date</TableHead>
                            <TableHead className="text-xs font-bold text-text-primary">Status</TableHead>
                            <TableHead className="text-right text-xs font-bold text-text-primary">Update Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-16">
                                    <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                                    <span className="text-xs text-text-secondary">Loading candidate applications...</span>
                                </TableCell>
                            </TableRow>
                        ) : filteredApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-xs text-text-secondary">
                                    {statusParam !== 'all' ? (
                                        <div className="space-y-2">
                                            <p>No candidates found matching the "{statusParam.replace('_', ' ')}" status filter.</p>
                                            <button
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('status');
                                                    setSearchParams(newParams);
                                                }}
                                                className="text-xs text-accent font-semibold hover:underline"
                                            >
                                                Show all candidates ({applications.length})
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 py-6">
                                            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent mx-auto flex items-center justify-center">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <p className="font-bold text-text-primary text-sm">No applications submitted yet</p>
                                            <p className="text-text-secondary max-w-sm mx-auto">
                                                Candidates will appear here once they discover and apply for this job opening.
                                            </p>
                                            <Link to="/recruiter/jobs">
                                                <Button variant="outline" size="sm" className="rounded-xl border-surface-border hover:bg-bg text-text-primary text-xs mt-2">
                                                    Back to Posted Jobs
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApplications.map((item) => {
                                const applicant = item.applicant || {};
                                const isUpdatingThis = savingStatus && activeActionId === item._id;
                                const displayJobTitle = item.jobTitle || applicants?.title;

                                return (
                                    <TableRow key={item._id} className="hover:bg-bg/60 transition-colors">
                                        {/* Candidate Details */}
                                        <TableCell className="text-xs font-bold text-text-primary">
                                            <div>{applicant.fullname || "Applicant"}</div>
                                            {displayJobTitle && (
                                                <div className="text-[11px] font-medium text-text-secondary flex items-center gap-1 mt-0.5">
                                                    <Briefcase className="w-3 h-3 text-accent shrink-0" />
                                                    <span className="truncate max-w-[180px]">{displayJobTitle}</span>
                                                </div>
                                            )}
                                            {applicant.profile?.experienceYears !== undefined && applicant.profile?.experienceYears > 0 && (
                                                <span className="inline-block text-[10px] font-semibold text-text-secondary mt-0.5">
                                                    {applicant.profile.experienceYears} yrs exp
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Contact Info */}
                                        <TableCell className="text-xs text-text-secondary">
                                            <div className="text-text-primary font-medium">{applicant.email || "—"}</div>
                                            <div className="text-[11px] text-text-secondary">{applicant.phoneNumber || "—"}</div>
                                        </TableCell>

                                        {/* Match Score */}
                                        <TableCell>
                                            <MatchBadge 
                                                score={item.matchScore} 
                                                matchLevel={item.matchLevel} 
                                                size="sm"
                                                hasSufficientData={item.matchScore !== undefined}
                                                isFirstJobMode={applicant?.profile?.firstJobMode}
                                            />
                                        </TableCell>

                                        {/* Resume / Profile links */}
                                        <TableCell>
                                            {applicant?.profile?.resume ? (
                                                <div className="flex flex-col gap-1">
                                                    <a 
                                                        href={applicant.profile.resume}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                                                        <span className="truncate max-w-[120px]" title={applicant.profile.resumeOriginalName || "Resume"}>
                                                            {applicant.profile.resumeOriginalName || "View Resume"}
                                                        </span>
                                                    </a>
                                                    {applicant.profile.githubUrl && (
                                                        <a
                                                            href={applicant.profile.githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-accent hover:underline"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            <span>GitHub</span>
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-secondary">No Resume</span>
                                            )}
                                        </TableCell>

                                        {/* Applied Date */}
                                        <TableCell className="text-xs text-text-secondary">
                                            {formatDate(item.createdAt)}
                                        </TableCell>

                                        {/* Current Status */}
                                        <TableCell>
                                            <div>
                                                {formatStatusBadge(item.status)}
                                                {item.interviewDate && item.status === 'interview' && (
                                                    <div className="text-[10px] text-accent mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(item.interviewDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {item.assessmentDate && item.status === 'assessment' && (
                                                    <div className="text-[10px] text-warning mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(item.assessmentDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Update Status Dropdown Menu */}
                                        <TableCell className="text-right">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isUpdatingThis}
                                                        className="h-8 rounded-xl border-surface-border hover:border-accent hover:bg-accent/10 text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-all"
                                                    >
                                                        {isUpdatingThis ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                                                        ) : (
                                                            <>
                                                                <span>Update Status</span>
                                                                <ChevronDown className="w-3.5 h-3.5 text-accent" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-56 p-2 rounded-2xl shadow-warm-md border border-surface-border bg-surface" align="end">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary px-2.5 py-1 mb-1 border-b border-surface-border">
                                                        Select Pipeline Stage
                                                    </div>
                                                    <div className="space-y-1">
                                                        {/* Under Review */}
                                                        <button
                                                            onClick={() => statusHandler('under_review', item._id)}
                                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                item.status === 'under_review' 
                                                                    ? 'bg-accent/10 text-accent font-bold' 
                                                                    : 'text-text-primary hover:bg-bg hover:text-accent'
                                                            }`}
                                                        >
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>Under Review</span>
                                                        </button>

                                                        {/* Shortlisted */}
                                                        <button
                                                            onClick={() => statusHandler('shortlisted', item._id)}
                                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                item.status === 'shortlisted' 
                                                                    ? 'bg-accent/10 text-accent font-bold' 
                                                                    : 'text-text-primary hover:bg-bg hover:text-accent'
                                                            }`}
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            <span>Shortlisted</span>
                                                        </button>

                                                        {/* Interview */}
                                                        <button
                                                            onClick={() => openScheduleDialog(item, 'interview')}
                                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                item.status === 'interview' 
                                                                    ? 'bg-accent/10 text-accent font-bold' 
                                                                    : 'text-text-primary hover:bg-bg hover:text-accent'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Video className="w-3.5 h-3.5" />
                                                                <span>Interview</span>
                                                            </div>
                                                            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-md font-semibold">
                                                                Schedule
                                                            </span>
                                                        </button>

                                                        {/* Assessment */}
                                                        <button
                                                            onClick={() => openScheduleDialog(item, 'assessment')}
                                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                item.status === 'assessment' 
                                                                    ? 'bg-accent/10 text-accent font-bold' 
                                                                    : 'text-text-primary hover:bg-bg hover:text-accent'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                                <span>Assessment</span>
                                                            </div>
                                                            <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-md font-semibold">
                                                                Schedule
                                                            </span>
                                                        </button>

                                                        {/* Selected / Hired */}
                                                        <button
                                                            onClick={() => statusHandler('selected', item._id)}
                                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                ['selected', 'hired', 'accepted'].includes(item.status) 
                                                                    ? 'bg-success/10 text-success font-bold' 
                                                                    : 'text-text-primary hover:bg-success/10 hover:text-success'
                                                            }`}
                                                        >
                                                            <PartyPopper className="w-3.5 h-3.5 text-success" />
                                                            <span>Selected / Hired</span>
                                                        </button>

                                                        <div className="border-t border-surface-border my-1" />

                                                        {/* Reject */}
                                                        <button
                                                            onClick={() => statusHandler('rejected', item._id)}
                                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-colors text-left font-medium ${
                                                                item.status === 'rejected' 
                                                                    ? 'bg-danger/10 text-danger font-bold' 
                                                                    : 'text-danger hover:bg-danger/10'
                                                            }`}
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Schedule Assessment / Interview Dialog */}
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl bg-surface border border-surface-border shadow-warm-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-accent" />
                            <span>
                                {pendingStatus === 'interview' ? 'Schedule Candidate Interview' : 'Schedule Assessment'}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Set date, time, and instructions for <strong>{selectedApplication?.applicant?.fullname || 'Candidate'}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleScheduleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="sched-datetime" className="text-xs font-semibold text-text-primary flex items-center justify-between">
                                <span>Date & Time</span>
                                <span className="text-[10px] font-normal text-text-secondary">Optional</span>
                            </Label>
                            <Input
                                id="sched-datetime"
                                type="datetime-local"
                                value={scheduledDateTime}
                                onChange={(e) => setScheduledDateTime(e.target.value)}
                                className="rounded-xl border-surface-border bg-bg text-text-primary text-xs"
                            />
                            <p className="text-[10px] text-text-secondary">
                                Leave blank if the exact date is to be coordinated later.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="sched-note" className="text-xs font-semibold text-text-primary">
                                Reminder / Instructions Note (Optional)
                            </Label>
                            <Input
                                id="sched-note"
                                type="text"
                                placeholder="e.g. Google Meet link or coding challenge link"
                                value={reminderNote}
                                onChange={(e) => setReminderNote(e.target.value)}
                                className="rounded-xl border-surface-border bg-bg text-text-primary text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setScheduleDialogOpen(false)}
                                className="text-xs rounded-xl border-surface-border hover:bg-bg text-text-primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={savingStatus}
                                className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-warm-sm"
                            >
                                {savingStatus ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                <span>Save Stage</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicantsTable;