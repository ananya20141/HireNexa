import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit2, Eye, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const [searchParams] = useSearchParams();
    const statusParam = searchParams.get('status') || 'all';
    const navigate = useNavigate();

    useEffect(() => {
        const filtered = (allAdminJobs || []).filter((job) => {
            if (searchJobByText) {
                const titleMatch = job?.title?.toLowerCase().includes(searchJobByText.toLowerCase());
                const companyMatch = job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
                if (!titleMatch && !companyMatch) return false;
            }
            if (statusParam === 'active') {
                return job.isActive && job.status === 'approved';
            }
            return true;
        });
        setFilterJobs(filtered);
    }, [allAdminJobs, searchJobByText, statusParam]);

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20">Rejected</Badge>;
            case 'pending':
            default:
                return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border border-warning/20">Pending Review</Badge>;
        }
    };

    return (
        <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
            <Table>
                <TableCaption className="pb-3 text-xs text-text-secondary">
                    Your published career openings and applicant volume.
                </TableCaption>
                <TableHeader className="bg-bg">
                    <TableRow>
                        <TableHead className="text-xs font-bold text-text-primary">Company</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Role / Title</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Approval Status</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Active</TableHead>
                        <TableHead className="text-xs font-bold text-text-primary">Date Posted</TableHead>
                        <TableHead className="text-right text-xs font-bold text-text-primary">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!filterJobs || filterJobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-xs text-text-secondary">
                                {statusParam === 'active' 
                                    ? "No active/approved job postings found. Click 'All' to view all postings or 'New Job' to create one."
                                    : 'No job postings found. Click "New Job" to post your first opening.'}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterJobs.map((job) => {
                            const appCount = job?.applications?.filter(Boolean)?.length || 0;
                            return (
                                <TableRow key={job?._id} className="hover:bg-bg/60 transition-colors">
                                    <TableCell className="text-xs font-semibold text-text-primary">
                                        {job?.company?.name || "Company"}
                                    </TableCell>
                                    <TableCell className="text-xs text-text-secondary">
                                        {job?.title}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(job?.status)}
                                    </TableCell>
                                    <TableCell>
                                        {job?.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                                                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
                                                Closed
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-text-secondary">
                                        {formatDate(job?.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                                                className="h-8 rounded-xl border-surface-border hover:border-accent hover:bg-accent/10 hover:text-accent text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-all"
                                                title="View Applicants for this job"
                                            >
                                                <Users className="w-3.5 h-3.5 text-accent" />
                                                <span>
                                                    View Applicants{appCount > 0 ? ` (${appCount})` : ''}
                                                </span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/recruiter/jobs/edit/${job._id}`)}
                                                className="h-8 px-2.5 rounded-xl border border-surface-border/60 hover:border-accent hover:text-accent hover:bg-bg text-text-secondary text-xs font-medium flex items-center gap-1 transition-all"
                                                title="Edit Job Posting"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminJobsTable;