import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { Users, Ban, CheckCircle, ArrowLeft, Loader2, FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const AdminCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const navigate = useNavigate();

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/candidates`, { withCredentials: true });
            if (res.data.success) {
                setCandidates(res.data.candidates || []);
            }
        } catch (error) {
            console.error("Fetch Candidates Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load candidates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleToggleBlock = async (userId, currentBlocked) => {
        const action = currentBlocked ? "unblock" : "suspend";
        if (!window.confirm(`Are you sure you want to ${action} this candidate account?`)) return;

        try {
            setActionId(userId);
            const res = await axios.put(`${ADMIN_API_END_POINT}/users/${userId}/toggle-block`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setCandidates(candidates.map(c => c._id === userId ? { ...c, isBlocked: !currentBlocked } : c));
            }
        } catch (error) {
            console.error("Toggle Block Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update user status.");
        } finally {
            setActionId(null);
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
                                <h1 className="text-2xl font-bold text-text-primary">Registered Job Seekers & Candidates</h1>
                                <p className="text-xs text-text-secondary">Inspect candidate credentials, verified resume status, application metrics, and access privileges.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                        <Table>
                            <TableCaption className="pb-3 text-xs text-text-secondary">
                                Total registered candidates: {candidates.length}
                            </TableCaption>
                            <TableHeader className="bg-bg">
                                <TableRow>
                                    <TableHead className="text-xs font-bold text-text-primary">Candidate Name</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Contact</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Experience</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Skills Count</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Resume Status</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Submissions</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Account</TableHead>
                                    <TableHead className="text-right text-xs font-bold text-text-primary">Governance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                                            <span className="text-xs text-text-secondary">Loading candidates...</span>
                                        </TableCell>
                                    </TableRow>
                                ) : candidates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-xs text-text-secondary">
                                            No candidate accounts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    candidates.map((cand) => (
                                        <TableRow key={cand._id} className="hover:bg-bg/60 transition-colors">
                                            <TableCell className="text-xs font-bold text-text-primary">
                                                {cand.fullname}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                <div className="text-text-primary">{cand.email}</div>
                                                <div className="text-[11px] text-text-secondary">{cand.phoneNumber}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary font-medium">
                                                {cand.profile?.experienceYears || 0} years
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary font-medium">
                                                {cand.profile?.skills?.length || 0} listed
                                            </TableCell>
                                            <TableCell>
                                                {cand.profile?.resume ? (
                                                    <a 
                                                        href={cand.profile.resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`View resume for ${cand.fullname || 'candidate'}`}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-accent/20 bg-accent/10 hover:bg-accent hover:text-white text-accent text-xs font-semibold shadow-warm-xs transition-all duration-200 group"
                                                        title={cand.profile?.resumeOriginalName ? `View ${cand.profile.resumeOriginalName}` : `View resume for ${cand.fullname}`}
                                                    >
                                                        <FileText className="w-3.5 h-3.5 shrink-0" />
                                                        <span>View Resume</span>
                                                        <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-text-secondary font-medium italic">
                                                        No Resume
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold text-text-primary">
                                                {cand.applicationCount || 0} applications
                                            </TableCell>
                                            <TableCell>
                                                {cand.isBlocked ? (
                                                    <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[11px]">Suspended</Badge>
                                                ) : (
                                                    <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[11px]">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={actionId === cand._id}
                                                    onClick={() => handleToggleBlock(cand._id, cand.isBlocked)}
                                                    className={`text-xs h-7 px-2.5 rounded-lg font-semibold ${
                                                        cand.isBlocked 
                                                            ? 'border-success/30 text-success hover:bg-success/10' 
                                                            : 'border-danger/30 text-danger hover:bg-danger/10'
                                                    }`}
                                                >
                                                    {cand.isBlocked ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1 text-success" />
                                                            <span>Unblock</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="w-3 h-3 mr-1 text-danger" />
                                                            <span>Suspend</span>
                                                        </>
                                                    )}
                                                </Button>
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

export default AdminCandidates;
