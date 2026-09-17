import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { setAllAppliedJobs } from '@/redux/jobSlice';
import { toast } from 'sonner';
import { Loader2, ArrowUpRight, ChevronDown, ChevronUp, Clock, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ApplicationJourneyStepper from './ApplicationJourneyStepper';

const getStatusBadge = (status) => {
    switch (status) {
        case 'hired':
        case 'accepted':
        case 'selected':
            return <Badge className="bg-success/10 text-success hover:bg-success/15 border border-success/30">Selected</Badge>;
        case 'interview':
            return <Badge className="bg-accent/10 text-accent hover:bg-accent/15 border border-accent/30">Interview</Badge>;
        case 'assessment':
            return <Badge className="bg-warning/10 text-warning hover:bg-warning/15 border border-warning/30">Assessment</Badge>;
        case 'shortlisted':
            return <Badge className="bg-accent/10 text-accent hover:bg-accent/15 border border-accent/30">Shortlisted</Badge>;
        case 'under_review':
            return <Badge className="bg-bg text-text-secondary hover:bg-muted border border-surface-border">Under Review</Badge>;
        case 'rejected':
        case 'withdrawn':
            return <Badge className="bg-danger/10 text-danger hover:bg-danger/15 border border-danger/30">Closed / Rejected</Badge>;
        case 'applied':
        default:
            return <Badge className="bg-bg text-text-secondary hover:bg-muted border border-surface-border">Applied</Badge>;
    }
};

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [expandedAppId, setExpandedAppId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedAppId(prev => prev === id ? null : id);
    };

    const withdrawHandler = async (applicationId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to withdraw this application?")) return;

        try {
            setWithdrawingId(applicationId);
            const res = await axios.post(`${APPLICATION_API_END_POINT}/withdraw/${applicationId}`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                const updated = allAppliedJobs.map(app => 
                    app._id === applicationId ? { ...app, status: 'rejected', withdrawn: true } : app
                );
                dispatch(setAllAppliedJobs(updated));
            }
        } catch (error) {
            console.error("Withdraw Error:", error);
            toast.error(error?.response?.data?.message || "Failed to withdraw application.");
        } finally {
            setWithdrawingId(null);
        }
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

    // Find any upcoming scheduled interviews/assessments
    const upcomingEvents = (allAppliedJobs || []).filter(app => 
        (app.interviewDate || app.assessmentDate) && app.status !== 'rejected' && app.status !== 'withdrawn'
    );

    return (
        <div className="space-y-4">
            {/* Upcoming Event Reminder Card */}
            {upcomingEvents.length > 0 && (
                <div className="p-4 rounded-2xl bg-muted/60 border border-surface-border shadow-warm-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-accent animate-pulse" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
                            Upcoming Scheduled Steps ({upcomingEvents.length})
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {upcomingEvents.map(app => (
                            <div key={app._id} className="p-3 bg-surface rounded-xl border border-surface-border flex items-center justify-between gap-3 text-xs shadow-warm-sm">
                                <div>
                                    <p className="font-bold text-text-primary">{app.job?.title || 'Applied Position'}</p>
                                    <p className="text-[11px] text-text-secondary">{app.job?.company?.name}</p>
                                    <p className="text-accent font-semibold mt-1">
                                        {app.interviewDate ? `Interview: ${new Date(app.interviewDate).toLocaleString()}` : `Assessment: ${new Date(app.assessmentDate).toLocaleString()}`}
                                    </p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => toggleExpand(app._id)}
                                    className="text-xs h-7 rounded-xl border-surface-border text-accent hover:bg-muted"
                                >
                                    Track
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Application Records Table */}
            <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                <Table>
                    <TableCaption className="pb-3 text-xs text-text-secondary/70">
                        Click on any application to view its interactive 5-stage Application Journey.
                    </TableCaption>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="text-xs font-bold text-text-secondary">Applied Date</TableHead>
                            <TableHead className="text-xs font-bold text-text-secondary">Position</TableHead>
                            <TableHead className="text-xs font-bold text-text-secondary">Company</TableHead>
                            <TableHead className="text-xs font-bold text-text-secondary">Current Status</TableHead>
                            <TableHead className="text-center text-xs font-bold text-text-secondary">Journey Tracker</TableHead>
                            <TableHead className="text-right text-xs font-bold text-text-secondary">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!allAppliedJobs || allAppliedJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-xs text-text-secondary">
                                    You haven't submitted any job applications yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allAppliedJobs.map((appliedJob) => {
                                const canWithdraw = appliedJob.status === 'applied' || appliedJob.status === 'under_review';
                                const isExpanded = expandedAppId === appliedJob._id;

                                return (
                                    <React.Fragment key={appliedJob._id}>
                                        <TableRow 
                                            onClick={() => toggleExpand(appliedJob._id)}
                                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="text-xs text-text-secondary font-medium">
                                                {formatDate(appliedJob?.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-text-primary">
                                                {appliedJob.job ? (
                                                    <Link 
                                                        to={`/description/${appliedJob.job._id}`} 
                                                        onClick={(e) => e.stopPropagation()} 
                                                        className="hover:text-accent inline-flex items-center gap-1"
                                                    >
                                                        <span>{appliedJob.job.title}</span>
                                                        <ArrowUpRight className="w-3 h-3 text-text-secondary/60" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-text-secondary/60">Position unavailable</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary font-medium">
                                                {appliedJob.job?.company?.name || "Company"}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(appliedJob.status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <button 
                                                    type="button"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
                                                >
                                                    <span>{isExpanded ? 'Hide Journey' : 'View Journey'}</span>
                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canWithdraw ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={withdrawingId === appliedJob._id}
                                                        onClick={(e) => withdrawHandler(appliedJob._id, e)}
                                                        className="text-xs h-7 px-2.5 text-danger hover:text-danger hover:bg-danger/10 rounded-xl"
                                                    >
                                                        {withdrawingId === appliedJob._id ? (
                                                             <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <span>Withdraw</span>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <span className="text-[11px] text-text-secondary/50 font-medium">Locked</span>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {/* Expandable Application Journey Drawer */}
                                        {isExpanded && (
                                            <TableRow className="bg-muted/20">
                                                <TableCell colSpan={6} className="p-4 sm:p-6">
                                                    <ApplicationJourneyStepper application={appliedJob} compact={false} />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AppliedJobTable;