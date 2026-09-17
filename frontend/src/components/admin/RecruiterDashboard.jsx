import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT, COMPANY_API_END_POINT } from '@/utils/constant';
import { setAllAdminJobs } from '@/redux/jobSlice';
import { setCompanies } from '@/redux/companySlice';
import { 
    Briefcase, 
    Users, 
    UserCheck, 
    Calendar, 
    Award, 
    PlusCircle, 
    Building2, 
    ArrowRight,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';

const RecruiterDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const { allAdminJobs } = useSelector(store => store.job);
    const { companies } = useSelector(store => store.company);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [jobsRes, compRes] = await Promise.all([
                    axios.get(`${JOB_API_END_POINT}/getadminjobs`, { withCredentials: true }),
                    axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true })
                ]);
                if (jobsRes.data.success) {
                    dispatch(setAllAdminJobs(jobsRes.data.jobs));
                }
                if (compRes.data.success) {
                    dispatch(setCompanies(compRes.data.companies));
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dispatch]);

    // Compute metrics
    const totalJobs = allAdminJobs?.length || 0;
    const activeJobs = allAdminJobs?.filter(j => j.isActive && j.status === 'approved')?.length || 0;
    const pendingJobs = allAdminJobs?.filter(j => j.status === 'pending')?.length || 0;

    let totalApplications = 0;
    let shortlisted = 0;
    let interviews = 0;
    let hired = 0;

    allAdminJobs?.forEach(job => {
        if (Array.isArray(job.applications)) {
            const activeApps = job.applications.filter(Boolean);
            totalApplications += activeApps.length;
            activeApps.forEach(app => {
                if (app.status === 'shortlisted') shortlisted++;
                if (app.status === 'interview' || app.status === 'assessment') interviews++;
                if (app.status === 'accepted' || app.status === 'hired' || app.status === 'selected') hired++;
            });
        }
    });

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Welcome Strip */}
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                                Recruiter Workspace
                            </span>
                            <h1 className="text-2xl font-bold text-text-primary mt-2">
                                Welcome back, {user?.fullname}
                            </h1>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Monitor application volume, review candidate matches, and manage open requisitions.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link to="/recruiter/companies/create">
                                <Button variant="outline" size="sm" className="rounded-xl border-surface-border hover:bg-bg text-text-primary flex items-center gap-1.5 text-xs font-semibold">
                                    <Building2 className="w-3.5 h-3.5 text-accent" />
                                    <span>Add Company</span>
                                </Button>
                            </Link>
                            <Link to="/recruiter/jobs/create">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-warm-sm">
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>Post Opening</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* KPI Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {/* Active Jobs */}
                        <div 
                            onClick={() => navigate('/recruiter/jobs?status=active')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/recruiter/jobs?status=active'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label="View Active Jobs"
                            className="group bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent hover:shadow-warm-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
                                    <span>Active Jobs</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-success/10 text-success border border-success/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-text-primary">{activeJobs}</p>
                            <p className="text-[11px] text-text-secondary mt-1">
                                {totalJobs} total · {pendingJobs} pending approval
                            </p>
                        </div>

                        {/* Total Applications */}
                        <div 
                            onClick={() => navigate('/recruiter/applicants')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/recruiter/applicants'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label="View Total Applicants"
                            className="group bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent hover:shadow-warm-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
                                    <span>Total Applicants</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-bg text-accent border border-surface-border flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-text-primary">{totalApplications}</p>
                            <p className="text-[11px] text-text-secondary mt-1">Across all openings</p>
                        </div>

                        {/* Shortlisted */}
                        <div 
                            onClick={() => navigate('/recruiter/applicants?status=shortlisted')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/recruiter/applicants?status=shortlisted'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label="View Shortlisted Applicants"
                            className="group bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent hover:shadow-warm-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
                                    <span>Shortlisted</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-bg text-accent border border-surface-border flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-text-primary">{shortlisted}</p>
                            <p className="text-[11px] text-text-secondary mt-1">Screening passed</p>
                        </div>

                        {/* Interviews */}
                        <div 
                            onClick={() => navigate('/recruiter/applicants?status=interview')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/recruiter/applicants?status=interview'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label="View Interview Candidates"
                            className="group bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent hover:shadow-warm-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
                                    <span>Interviews</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Calendar className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-text-primary">{interviews}</p>
                            <p className="text-[11px] text-text-secondary mt-1">Rounds scheduled</p>
                        </div>

                        {/* Hired */}
                        <div 
                            onClick={() => navigate('/recruiter/applicants?status=hired')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/recruiter/applicants?status=hired'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label="View Hired Candidates"
                            className="group bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm hover:border-accent hover:shadow-warm-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-accent transition-colors flex items-center gap-1">
                                    <span>Offers / Hired</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-success/10 text-success border border-success/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Award className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-text-primary">{hired}</p>
                            <p className="text-[11px] text-text-secondary mt-1">Successful matches</p>
                        </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Openings Management Card */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Briefcase className="w-5 h-5 text-accent" />
                                    <h2 className="font-bold text-base text-text-primary">Job Requisitions</h2>
                                </div>
                                <Link to="/recruiter/jobs" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                                    <span>Manage all</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <p className="text-xs text-text-secondary">
                                Review your posted openings, adjust requirements, and inspect applicant resumes.
                            </p>
                            <div className="pt-2">
                                <Link to="/recruiter/jobs">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-surface-border hover:bg-bg text-text-primary rounded-xl">
                                        View All ({totalJobs}) Openings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Companies Management Card */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Building2 className="w-5 h-5 text-accent" />
                                    <h2 className="font-bold text-base text-text-primary">Companies</h2>
                                </div>
                                <Link to="/recruiter/companies" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                                    <span>Manage all</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <p className="text-xs text-text-secondary">
                                Manage registered hiring companies, brand logos, location info, and website links.
                            </p>
                            <div className="pt-2">
                                <Link to="/recruiter/companies">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-surface-border hover:bg-bg text-text-primary rounded-xl">
                                        View Registered Companies ({companies.length})
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default RecruiterDashboard;
