import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { Building2, Ban, CheckCircle, ArrowLeft, Loader2, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const AdminRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const navigate = useNavigate();

    const fetchRecruiters = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/recruiters`, { withCredentials: true });
            if (res.data.success) {
                setRecruiters(res.data.recruiters || []);
            }
        } catch (error) {
            console.error("Fetch Recruiters Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load recruiters.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const handleToggleBlock = async (userId, currentBlocked) => {
        const action = currentBlocked ? "unblock" : "suspend";
        if (!window.confirm(`Are you sure you want to ${action} this recruiter account?`)) return;

        try {
            setActionId(userId);
            const res = await axios.put(`${ADMIN_API_END_POINT}/users/${userId}/toggle-block`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setRecruiters(recruiters.map(r => r._id === userId ? { ...r, isBlocked: !currentBlocked } : r));
            }
        } catch (error) {
            console.error("Toggle Block Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update user block status.");
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
                                <h1 className="text-2xl font-bold text-text-primary">Employer & Recruiter Accounts</h1>
                                <p className="text-xs text-text-secondary">Manage registered employer accounts, associated corporate entities, and access states.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-surface-border rounded-2xl bg-surface shadow-warm-sm">
                        <Table>
                            <TableCaption className="pb-3 text-xs text-text-secondary">
                                Total registered recruiters: {recruiters.length}
                            </TableCaption>
                            <TableHeader className="bg-bg">
                                <TableRow>
                                    <TableHead className="text-xs font-bold text-text-primary">Recruiter Details</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Contact</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Associated Companies</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Posted Jobs</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Account Status</TableHead>
                                    <TableHead className="text-xs font-bold text-text-primary">Registered</TableHead>
                                    <TableHead className="text-right text-xs font-bold text-text-primary">Governance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                                            <span className="text-xs text-text-secondary">Loading recruiters...</span>
                                        </TableCell>
                                    </TableRow>
                                ) : recruiters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-xs text-text-secondary">
                                            No recruiter accounts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recruiters.map((rec) => (
                                        <TableRow key={rec._id} className="hover:bg-bg/60 transition-colors">
                                            <TableCell className="text-xs font-bold text-text-primary">
                                                {rec.fullname}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                <div className="text-text-primary">{rec.email}</div>
                                                <div className="text-[11px] text-text-secondary">{rec.phoneNumber}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                {rec.companies?.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {rec.companies.map((c, i) => (
                                                             <div key={i} className="font-semibold text-text-primary">
                                                                {c.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-text-secondary italic">None registered</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold text-text-primary">
                                                {rec.jobCount || 0} Openings
                                            </TableCell>
                                            <TableCell>
                                                {rec.isBlocked ? (
                                                    <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[11px]">Suspended</Badge>
                                                ) : (
                                                    <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[11px]">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                {formatDate(rec.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={actionId === rec._id}
                                                    onClick={() => handleToggleBlock(rec._id, rec.isBlocked)}
                                                    className={`text-xs h-7 px-2.5 rounded-lg font-semibold ${
                                                        rec.isBlocked 
                                                            ? 'border-success/30 text-success hover:bg-success/10' 
                                                            : 'border-danger/30 text-danger hover:bg-danger/10'
                                                    }`}
                                                >
                                                    {rec.isBlocked ? (
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

export default AdminRecruiters;
