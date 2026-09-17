import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs';
import { ArrowLeft, Briefcase, Building2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

const Applicants = () => {
    useGetAllAdminJobs();
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);
    const { allAdminJobs } = useSelector(store => store.job);

    const [loading, setLoading] = useState(true);

    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            if (params.id) {
                // Job-specific applicant pipeline
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllApplicants(res.data.job));
                }
            } else {
                // Consolidated multi-job pipeline across all recruiter jobs
                if (!allAdminJobs || allAdminJobs.length === 0) {
                    dispatch(setAllApplicants({ title: "All Requisitions", applications: [] }));
                    setLoading(false);
                    return;
                }
                const promises = allAdminJobs.map(job =>
                    axios.get(`${APPLICATION_API_END_POINT}/${job._id}/applicants`, { withCredentials: true })
                        .then(res => res.data.success ? { ...res.data.job, jobTitle: job.title, jobId: job._id } : null)
                        .catch(() => null)
                );
                const results = await Promise.all(promises);
                const validJobs = results.filter(Boolean);
                const combined = [];
                validJobs.forEach(jobData => {
                    if (Array.isArray(jobData.applications)) {
                        jobData.applications.forEach(app => {
                            if (app) {
                                combined.push({
                                    ...app,
                                    jobTitle: jobData.title,
                                    jobId: jobData._id,
                                    companyName: jobData.company?.name
                                });
                            }
                        });
                    }
                });
                dispatch(setAllApplicants({
                    title: "All Requisitions",
                    applications: combined
                }));
            }
        } catch (error) {
            console.error("Fetch Applicants Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load candidate applications.");
        } finally {
            setLoading(false);
        }
    }, [params.id, allAdminJobs, dispatch]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const handleJobChange = (e) => {
        const val = e.target.value;
        if (val === 'all') {
            navigate('/recruiter/applicants');
        } else {
            navigate(`/recruiter/jobs/${val}/applicants`);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {/* Top Breadcrumb & Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            {params.id ? (
                                <Link 
                                    to="/recruiter/jobs" 
                                    className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold transition-colors mb-2"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Back to Posted Jobs</span>
                                </Link>
                            ) : (
                                <Link 
                                    to="/recruiter/dashboard" 
                                    className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold transition-colors mb-2"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Back to Dashboard</span>
                                </Link>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className='font-bold text-2xl text-text-primary'>
                                    {params.id ? `Applicants: ${applicants?.title || "Requisition"}` : "Candidate Application Pipeline"}
                                </h1>
                                {params.id && applicants?.company?.name && (
                                    <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs font-semibold flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        <span>{applicants.company.name}</span>
                                    </Badge>
                                )}
                            </div>

                            <p className='text-xs text-text-secondary mt-1'>
                                {params.id 
                                    ? `Review candidate submissions, inspect match scores, and progress applicants through hiring stages.`
                                    : `Consolidated candidate pipeline across all your published job openings.`}
                            </p>
                        </div>

                        {/* Job Requisition Switcher */}
                        {allAdminJobs && allAdminJobs.length > 0 && (
                            <div className="flex items-center gap-2 shrink-0">
                                <label htmlFor="requisition-select" className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5 text-accent" />
                                    <span>Requisition:</span>
                                </label>
                                <select
                                    id="requisition-select"
                                    value={params.id || 'all'}
                                    onChange={handleJobChange}
                                    className="text-xs bg-surface border border-surface-border text-text-primary rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer shadow-warm-sm"
                                >
                                    <option value="all">All Requisitions ({allAdminJobs.length})</option>
                                    {allAdminJobs.map(job => (
                                        <option key={job._id} value={job._id}>
                                            {job.title} ({job.applications?.filter(Boolean)?.length || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Table Area */}
                    <ApplicantsTable onStatusChange={fetchApplicants} isMultiJob={!params.id} loading={loading} />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Applicants;