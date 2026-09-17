import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT, getCompanyInitials } from '@/utils/constant';
import { 
    FileText, 
    ArrowLeft, 
    Loader2, 
    Search, 
    Download, 
    Building2, 
    User as UserIcon, 
    Briefcase,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [keyword, setKeyword] = useState("");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== 'all') params.append("status", statusFilter);
            if (keyword) params.append("keyword", keyword);

            const res = await axios.get(`${ADMIN_API_END_POINT}/applications?${params.toString()}`, { withCredentials: true });
            if (res.data.success) {
                setApplications(res.data.applications || []);
            }
        } catch (error) {
            console.error("Fetch Admin Applications Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load platform applications.");
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
        fetchApplications();
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
        fetchApplications();
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

    const renderStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        switch (s) {
            case 'selected':
            case 'hired':
            case 'accepted':
                return (
                    <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[11px] font-semibold capitalize">
                        {s}
                    </Badge>
                );
            case 'shortlisted':
                return (
                    <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[11px] font-semibold capitalize">
                        Shortlisted
                    </Badge>
                );
            case 'interview':
            case 'assessment':
                return (
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 text-[11px] font-semibold capitalize">
                        {s}
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[11px] font-semibold capitalize">
                        Rejected
                    </Badge>
                );
            case 'under_review':
                return (
                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 text-[11px] font-semibold">
                        Under Review
                    </Badge>
                );
            case 'applied':
            case 'pending':
            default:
                return (
                    <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border border-warning/20 text-[11px] font-semibold capitalize">
                        {s || 'Applied'}
                    </Badge>
                );
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-6">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate("/admin/dashboard")} 
                                className="rounded-xl border-surface-border hover:bg-bg text-text-primary text-xs"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                <span>Dashboard</span>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">Platform Applications Oversight</h1>
                                <p className="text-xs text-text-secondary">
                                    Platform governance view of candidate submissions, requisitions, employer responses, and pipeline milestones.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Controls */}
                    <div className="bg-surface p-4 rounded-2xl border border-surface-border shadow-warm-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-bg border border-surface-border rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
                            {[
                                { label: 'All', value: 'all' },
                                { label: 'Applied', value: 'applied' },
                                { label: 'Under Review', value: 'under_review' },
                                { label: 'Shortlisted', value: 'shortlisted' },
                                { label: 'Interview', value: 'interview' },
                                { label: 'Hired / Selected', value: 'selected' },
                                { label: 'Rejected', value: 'rejected' }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleStatusFilterChange(tab.value)}
                                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all ${
                                        statusFilter === tab.value ? 'bg-surface text-accent shadow-warm-sm' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    placeholder="Search candidate, job, or employer..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="pl-9 text-xs border-surface-border bg-bg text-text-primary rounded-xl"
                                />
                            </div>
                            <Button type="submit" size="sm" className="bg-accent hover:bg-accent-hover text-white text-xs rounded-xl font-semibold">
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                        <Table>
                            <TableCaption className="pb-3 text-xs text-text-secondary">
                                Total platform applications: {applications.length}
                            </TableCaption>
                            <TableHeader className="bg-bg">
                                <TableRow>
                                    <TableHead className="text-xs font-bold text-text-primary">Candidate</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Job Requisition</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Employer / Recruiter</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Status</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Applied Date</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary text-right">Resume</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
                                            <p className="text-xs text-text-secondary font-medium">Loading applications data...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : applications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <FileText className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-text-primary">No applications found</p>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {statusFilter !== 'all' || keyword ? "Try clearing search keywords or status filters." : "No candidates have applied to jobs yet."}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    applications.map((app) => {
                                        const candidate = app.applicant;
                                        const job = app.job;
                                        const company = job?.company;
                                        const recruiter = job?.created_by;
                                        const resumeUrl = candidate?.profile?.resume;
                                        const resumeName = candidate?.profile?.resumeOriginalName || "Resume";

                                        return (
                                            <TableRow key={app._id} className="hover:bg-bg/60 transition-colors">
                                                {/* Candidate Info */}
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 rounded-xl border border-surface-border bg-accent/10 text-accent font-bold text-xs shrink-0">
                                                            <AvatarImage src={candidate?.profile?.profilePhoto} alt={candidate?.fullname} />
                                                            <AvatarFallback className="bg-accent/10 text-accent text-xs">
                                                                {candidate?.fullname ? candidate.fullname.slice(0, 2).toUpperCase() : 'CA'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-bold text-text-primary truncate">
                                                                {candidate?.fullname || "Unknown Candidate"}
                                                            </p>
                                                            <p className="text-[11px] text-text-secondary truncate">
                                                                {candidate?.email || "No email"}
                                                            </p>
                                                            {candidate?.phoneNumber && (
                                                                <p className="text-[10px] text-text-secondary/70 truncate">
                                                                    {candidate.phoneNumber}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Job Info */}
                                                <TableCell className="py-3.5">
                                                    <div>
                                                        <p className="text-xs font-semibold text-text-primary">
                                                            {job?.title || "Untitled Requisition"}
                                                        </p>
                                                        <p className="text-[11px] text-text-secondary">
                                                            {job?.location || "India"}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                {/* Employer / Recruiter Info */}
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7 rounded-lg border border-surface-border bg-bg shrink-0">
                                                            <AvatarImage src={company?.logo} alt={company?.name} />
                                                            <AvatarFallback className="bg-bg text-accent font-bold text-[10px]">
                                                                {getCompanyInitials(company?.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-semibold text-text-primary truncate">
                                                                {company?.name || "Company"}
                                                            </p>
                                                            <p className="text-[11px] text-text-secondary truncate">
                                                                {recruiter?.fullname ? `Posted by ${recruiter.fullname}` : "Recruiter"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="py-3.5">
                                                    {renderStatusBadge(app.status)}
                                                </TableCell>

                                                {/* Applied Date */}
                                                <TableCell className="py-3.5 text-xs text-text-secondary">
                                                    {formatDate(app.createdAt)}
                                                </TableCell>

                                                {/* Resume action */}
                                                <TableCell className="py-3.5 text-right">
                                                    {resumeUrl ? (
                                                        <a 
                                                            href={resumeUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-surface-border bg-bg hover:bg-surface text-accent text-[11px] font-semibold shadow-warm-xs transition-colors"
                                                            title={`View ${resumeName}`}
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            <span>Resume</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-[11px] text-text-secondary/60 italic">
                                                            Not uploaded
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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

export default AdminApplications;
