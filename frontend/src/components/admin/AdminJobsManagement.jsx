import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { 
    Briefcase, 
    Search, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Trash2, 
    Loader2, 
    ExternalLink, 
    Eye,
    SlidersHorizontal,
    ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const AdminJobsManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [keyword, setKeyword] = useState("");
    const [actionId, setActionId] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== 'all') params.append("status", statusFilter);
            if (keyword) params.append("keyword", keyword);
            if (searchParams.get("isFlagged") === 'true') params.append("isFlagged", "true");

            const res = await axios.get(`${ADMIN_API_END_POINT}/jobs?${params.toString()}`, { withCredentials: true });
            if (res.data.success) {
                setJobs(res.data.jobs || []);
            }
        } catch (error) {
            console.error("Fetch Admin Jobs Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load job listings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryStatus = searchParams.get("status") || "all";
        if (queryStatus !== statusFilter) {
            setStatusFilter(queryStatus);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchJobs();
    }, [statusFilter]);

    const handleStatusFilterChange = (st) => {
        setStatusFilter(st);
        const newParams = new URLSearchParams(searchParams);
        if (st === 'all') {
            newParams.delete("status");
        } else {
            newParams.set("status", st);
        }
        setSearchParams(newParams);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleStatusUpdate = async (jobId, newStatus) => {
        try {
            setActionId(jobId);
            const res = await axios.put(`${ADMIN_API_END_POINT}/jobs/${jobId}/status`, { status: newStatus }, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
            }
        } catch (error) {
            console.error("Status Update Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update status.");
        } finally {
            setActionId(null);
        }
    };

    const handleFlagToggle = async (jobId, currentFlagged) => {
        let reason = "";
        if (!currentFlagged) {
            reason = prompt("Please specify the moderation reason for flagging this listing:", "Violates posting terms / Invalid data");
            if (reason === null) return;
        }

        try {
            setActionId(jobId);
            const res = await axios.put(`${ADMIN_API_END_POINT}/jobs/${jobId}/flag`, { 
                isFlagged: !currentFlagged,
                flagReason: reason 
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                setJobs(jobs.map(j => j._id === jobId ? { ...j, isFlagged: !currentFlagged, flagReason: reason } : j));
            }
        } catch (error) {
            console.error("Flag Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update flag.");
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to permanently delete this job listing and its applications?")) return;

        try {
            setActionId(jobId);
            const res = await axios.delete(`${ADMIN_API_END_POINT}/jobs/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setJobs(jobs.filter(j => j._id !== jobId));
            }
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error(error?.response?.data?.message || "Failed to delete job.");
        } finally {
            setActionId(null);
        }
    };

    const getStatusBadge = (status, isFlagged) => {
        if (isFlagged) {
            return <Badge className="bg-danger text-white hover:bg-danger text-[11px] font-semibold">Flagged</Badge>;
        }
        switch (status) {
            case 'approved':
                return <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[11px]">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[11px]">Rejected</Badge>;
            case 'pending':
            default:
                return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border border-warning/20 text-[11px]">Pending</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => navigate("/admin/dashboard")} className="rounded-xl border-surface-border hover:bg-bg text-text-primary text-xs">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                <span>Dashboard</span>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">Job Requisitions Moderation</h1>
                                <p className="text-xs text-text-secondary">Approve pending employer listings, flag suspicious postings, and enforce quality standards.</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-surface p-4 rounded-2xl border border-surface-border shadow-warm-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-bg border border-surface-border rounded-xl text-xs w-full sm:w-auto">
                            {['all', 'pending', 'approved', 'rejected'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleStatusFilterChange(st)}
                                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                                        statusFilter === st ? 'bg-surface text-accent shadow-warm-sm' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {st === 'pending' ? 'Pending Approval' : st}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by job title..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-surface-border bg-bg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <Button type="submit" size="sm" className="bg-accent hover:bg-accent-hover text-white text-xs px-3 rounded-xl shadow-warm-sm">
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                        <Table>
                            <TableCaption className="pb-3 text-xs text-text-secondary">
                                Total listings under review: {jobs.length}
                            </TableCaption>
                            <TableHeader className="bg-bg">
                                <TableRow>
                                    <TableHead className="text-xs font-bold text-text-primary">Company & Title</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Recruiter</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Salary / Exp</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Status</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Flag Reason</TableHead>
                                    <TableHead className="text-right text-xs font-bold text-text-primary">Governance Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                                            <span className="text-xs text-text-secondary">Loading listings...</span>
                                        </TableCell>
                                    </TableRow>
                                ) : jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-xs text-text-secondary">
                                            No job listings found matching the selected filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job._id} className="hover:bg-bg/60 transition-colors">
                                            <TableCell className="text-xs">
                                                <div className="font-bold text-text-primary">{job.title}</div>
                                                <div className="text-text-secondary">{job.company?.name || "Company"} · {job.location}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                <div className="text-text-primary font-medium">{job.created_by?.fullname || "Recruiter"}</div>
                                                <div className="text-[11px] text-text-secondary">{job.created_by?.email}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-primary">
                                                <div>{job.salary} LPA</div>
                                                <div className="text-[11px] text-text-secondary">{job.experienceLevel || 0} yrs exp</div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(job.status, job.isFlagged)}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary max-w-xs truncate">
                                                {job.flagReason || "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Approve */}
                                                    {job.status !== 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled={actionId === job._id}
                                                            onClick={() => handleStatusUpdate(job._id, 'approved')}
                                                            className="text-xs h-7 px-2 text-success hover:text-success hover:bg-success/10 rounded-lg"
                                                            title="Approve Job"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                            <span>Approve</span>
                                                        </Button>
                                                    )}

                                                    {/* Reject */}
                                                    {job.status !== 'rejected' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled={actionId === job._id}
                                                            onClick={() => handleStatusUpdate(job._id, 'rejected')}
                                                            className="text-xs h-7 px-2 text-text-secondary hover:text-text-primary hover:bg-bg rounded-lg"
                                                            title="Reject Job"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5 mr-1" />
                                                            <span>Reject</span>
                                                        </Button>
                                                    )}

                                                    {/* Flag / Unflag */}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={actionId === job._id}
                                                        onClick={() => handleFlagToggle(job._id, job.isFlagged)}
                                                        className={`text-xs h-7 px-2 rounded-lg ${
                                                            job.isFlagged 
                                                                ? 'text-accent hover:bg-accent/10' 
                                                                : 'text-warning hover:bg-warning/10'
                                                        }`}
                                                        title={job.isFlagged ? "Unflag Job" : "Flag Inappropriate Listing"}
                                                    >
                                                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                                        <span>{job.isFlagged ? 'Unflag' : 'Flag'}</span>
                                                    </Button>

                                                    {/* Delete */}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={actionId === job._id}
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        className="text-xs h-7 px-2 text-danger hover:text-danger hover:bg-danger/10 rounded-lg"
                                                        title="Delete Listing"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* View Details */}
                                                    <Link to={`/description/${job._id}`} target="_blank">
                                                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-text-secondary hover:text-text-primary rounded-lg">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminJobsManagement;
