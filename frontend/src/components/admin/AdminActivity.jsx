import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { Activity as ActivityIcon, ArrowLeft, Loader2, Calendar, User, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';

const getActionBadge = (actionType) => {
    switch (actionType) {
        case 'USER_REGISTERED':
            return <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[10px]">Registration</Badge>;
        case 'JOB_POSTED':
            return <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[10px]">Job Created</Badge>;
        case 'JOB_APPROVED':
            return <Badge className="bg-success/10 text-success hover:bg-success/10 border border-success/20 text-[10px]">Job Approved</Badge>;
        case 'JOB_REJECTED':
            return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[10px]">Job Rejected</Badge>;
        case 'JOB_FLAGGED':
            return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border border-warning/20 text-[10px]">Flagged</Badge>;
        case 'APPLICATION_SUBMITTED':
            return <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border border-accent/20 text-[10px]">Application</Badge>;
        case 'USER_BLOCKED':
            return <Badge className="bg-danger/10 text-danger hover:bg-danger/10 border border-danger/20 text-[10px]">Account Blocked</Badge>;
        default:
            return <Badge className="bg-bg text-text-secondary hover:bg-bg border border-surface-border text-[10px]">{actionType}</Badge>;
    }
};

const AdminActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/activity`, { withCredentials: true });
            if (res.data.success) {
                setActivities(res.data.activities || []);
            }
        } catch (error) {
            console.error("Fetch Activity Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => navigate("/admin/dashboard")} className="rounded-xl border-surface-border hover:bg-bg text-text-primary text-xs">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                <span>Dashboard</span>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">System Activity Audit Trail</h1>
                                <p className="text-xs text-text-secondary">Immutable chronological record of registrations, approvals, moderation actions, and applications.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface rounded-2xl border border-surface-border shadow-warm-sm p-6">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                                <span className="text-xs text-text-secondary">Loading audit feed...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="py-12 text-center text-xs text-text-secondary">
                                No activity recorded yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-surface-border">
                                {activities.map((act) => (
                                    <div key={act._id} className="py-3.5 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getActionBadge(act.actionType)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-text-primary">{act.description}</p>
                                                {act.user && (
                                                    <p className="text-[11px] text-text-secondary mt-0.5">
                                                        Triggered by {act.user.fullname} ({act.user.email}) · Role: {act.user.role}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-text-secondary shrink-0 font-medium">
                                            {new Date(act.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminActivity;
