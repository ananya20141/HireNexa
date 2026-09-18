import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { 
    Users, 
    Briefcase, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    FileText, 
    Building2, 
    ShieldCheck, 
    ArrowRight,
    Loader2,
    Activity as ActivityIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector(store => store.auth);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await axios.get(`${ADMIN_API_END_POINT}/stats`, { 
                withCredentials: true,
                headers
            });
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Fetch Admin Stats Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [token]);

    const stats = data?.stats || {};
    const activities = data?.recentActivity || [];

    const totalJobs = stats.totalJobs || 0;
    const pendingPercent = totalJobs ? Math.round((stats.pendingJobs / totalJobs) * 100) : 0;
    const approvedPercent = totalJobs ? Math.round((stats.approvedJobs / totalJobs) * 100) : 0;
    const rejectedPercent = totalJobs ? Math.round((stats.rejectedJobs / totalJobs) * 100) : 0;

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header Banner */}
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>Platform Administrator Console</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
                                System Overview & Governance
                            </h1>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Real-time platform analytics, moderation pipelines, user management, and activity logs.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <Link to="/admin/jobs">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-warm-sm">
                                    <span>Review Pending Jobs ({stats.pendingJobs || 0})</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-text-secondary">Gathering platform analytics...</p>
                        </div>
                    ) : (
                        <>
                            {/* KPI Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Total Candidates */}
                                <Link 
                                    to="/admin/candidates" 
                                    className="bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent/40 hover:shadow-warm-md transition-all group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    title="View registered candidates"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Candidates</span>
                                        <div className="w-8 h-8 rounded-xl bg-bg text-accent border border-surface-border flex items-center justify-center group-hover:scale-105 group-hover:bg-accent/10 transition-all">
                                            <Users className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-text-primary group-hover:text-accent transition-colors">{stats.totalCandidates || 0}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[11px] text-text-secondary">Registered job seekers</p>
                                        <ArrowRight className="w-3 h-3 text-text-secondary/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>

                                {/* Total Recruiters */}
                                <Link 
                                    to="/admin/recruiters" 
                                    className="bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent/40 hover:shadow-warm-md transition-all group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    title="View registered employer accounts"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Employers</span>
                                        <div className="w-8 h-8 rounded-xl bg-bg text-accent border border-surface-border flex items-center justify-center group-hover:scale-105 group-hover:bg-accent/10 transition-all">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-text-primary group-hover:text-accent transition-colors">{stats.totalRecruiters || 0}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[11px] text-text-secondary">Registered hiring accounts</p>
                                        <ArrowRight className="w-3 h-3 text-text-secondary/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>

                                {/* Pending Approval */}
                                <Link 
                                    to="/admin/jobs?status=pending" 
                                    className="bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-warning/50 hover:shadow-warm-md transition-all group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-warning/20"
                                    title="View jobs awaiting moderation review"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Pending Review</span>
                                        <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-warning/20 transition-all">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-warning group-hover:brightness-90 transition-colors">{stats.pendingJobs || 0}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[11px] text-text-secondary">Awaiting moderation</p>
                                        <ArrowRight className="w-3 h-3 text-text-secondary/40 group-hover:text-warning group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>

                                {/* Total Applications */}
                                <Link 
                                    to="/admin/applications" 
                                    className="bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent/40 hover:shadow-warm-md transition-all group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    title="View all candidate applications"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Applications</span>
                                        <div className="w-8 h-8 rounded-xl bg-success/10 text-success border border-success/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-success/20 transition-all">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-text-primary group-hover:text-accent transition-colors">{stats.totalApplications || 0}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[11px] text-text-secondary">Total candidate submissions</p>
                                        <ArrowRight className="w-3 h-3 text-text-secondary/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                            </div>

                            {/* Middle Split: Job Status Pipeline & Quick Admin Links */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Job Status Breakdown */}
                                <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                                        <div>
                                            <h2 className="font-bold text-base text-text-primary">Job Requisitions Pipeline</h2>
                                            <p className="text-xs text-text-secondary">Lifecycle distribution of {totalJobs} total listings.</p>
                                        </div>
                                        <Link to="/admin/jobs" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                                            <span>Manage Jobs</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {/* Visual stacked bar */}
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-bg border border-surface-border rounded-full overflow-hidden flex">
                                            <div style={{ width: `${approvedPercent}%` }} className="bg-success transition-all" title={`Approved: ${approvedPercent}%`} />
                                            <div style={{ width: `${pendingPercent}%` }} className="bg-warning transition-all" title={`Pending: ${pendingPercent}%`} />
                                            <div style={{ width: `${rejectedPercent}%` }} className="bg-danger transition-all" title={`Rejected: ${rejectedPercent}%`} />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                                                <span>Approved: <strong>{stats.approvedJobs || 0}</strong> ({approvedPercent}%)</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                                                <span>Pending: <strong>{stats.pendingJobs || 0}</strong> ({pendingPercent}%)</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                                                <span>Rejected/Flagged: <strong>{stats.rejectedJobs || 0}</strong> ({rejectedPercent}%)</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <Link to="/admin/jobs?status=pending" className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors block">
                                            <div className="flex items-center gap-2 text-warning font-bold text-xs mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Pending Approvals</span>
                                            </div>
                                            <p className="text-xl font-black text-text-primary">{stats.pendingJobs || 0}</p>
                                        </Link>

                                        <Link to="/admin/jobs?isFlagged=true" className="p-3.5 rounded-xl border border-danger/30 bg-danger/5 hover:bg-danger/10 transition-colors block">
                                            <div className="flex items-center gap-2 text-danger font-bold text-xs mb-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>Flagged Listings</span>
                                            </div>
                                            <p className="text-xl font-black text-text-primary">{stats.flaggedJobs || 0}</p>
                                        </Link>

                                        <Link to="/admin/jobs?status=approved" className="p-3.5 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors block">
                                            <div className="flex items-center gap-2 text-success font-bold text-xs mb-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Live Active Jobs</span>
                                            </div>
                                            <p className="text-xl font-black text-text-primary">{stats.approvedJobs || 0}</p>
                                        </Link>
                                    </div>
                                </div>

                                {/* Platform Navigation Shortcuts */}
                                <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm space-y-3">
                                    <h2 className="font-bold text-base text-text-primary pb-2 border-b border-surface-border">
                                        Quick Navigation
                                    </h2>
                                    <Link to="/admin/jobs" className="flex items-center justify-between p-3 rounded-xl border border-surface-border hover:border-accent/40 hover:bg-bg transition-all text-xs font-semibold text-text-primary">
                                        <div className="flex items-center gap-2.5">
                                            <Briefcase className="w-4 h-4 text-accent" />
                                            <span>Moderation Console</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                                    </Link>
                                    <Link to="/admin/recruiters" className="flex items-center justify-between p-3 rounded-xl border border-surface-border hover:border-accent/40 hover:bg-bg transition-all text-xs font-semibold text-text-primary">
                                        <div className="flex items-center gap-2.5">
                                            <Building2 className="w-4 h-4 text-accent" />
                                            <span>Manage Employers</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                                    </Link>
                                    <Link to="/admin/candidates" className="flex items-center justify-between p-3 rounded-xl border border-surface-border hover:border-accent/40 hover:bg-bg transition-all text-xs font-semibold text-text-primary">
                                        <div className="flex items-center gap-2.5">
                                            <Users className="w-4 h-4 text-accent" />
                                            <span>Manage Candidates</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                                    </Link>
                                    <Link to="/admin/applications" className="flex items-center justify-between p-3 rounded-xl border border-surface-border hover:border-accent/40 hover:bg-bg transition-all text-xs font-semibold text-text-primary">
                                        <div className="flex items-center gap-2.5">
                                            <FileText className="w-4 h-4 text-accent" />
                                            <span>Applications Oversight</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                                    </Link>
                                    <Link to="/admin/activity" className="flex items-center justify-between p-3 rounded-xl border border-surface-border hover:border-accent/40 hover:bg-bg transition-all text-xs font-semibold text-text-primary">
                                        <div className="flex items-center gap-2.5">
                                            <ActivityIcon className="w-4 h-4 text-accent" />
                                            <span>Audit Activity Stream</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Platform Activity Stream */}
                            <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm">
                                <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
                                    <div className="flex items-center gap-2">
                                        <ActivityIcon className="w-4 h-4 text-accent" />
                                        <h2 className="font-bold text-base text-text-primary">Recent Platform Operations</h2>
                                    </div>
                                    <Link to="/admin/activity" className="text-xs font-semibold text-accent hover:underline">
                                        View Complete History →
                                    </Link>
                                </div>

                                {activities.length === 0 ? (
                                    <p className="text-xs text-text-secondary py-4 text-center">No platform activity recorded yet.</p>
                                ) : (
                                    <div className="divide-y divide-surface-border">
                                        {activities.slice(0, 6).map((act) => (
                                            <div key={act._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                                                <div>
                                                    <span className="font-semibold text-text-primary">{act.description}</span>
                                                    {act.user && (
                                                        <span className="text-text-secondary ml-2">by {act.user.fullname} ({act.user.role})</span>
                                                    )}
                                                </div>
                                                <span className="text-text-secondary shrink-0">
                                                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
