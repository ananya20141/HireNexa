import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import Job from './Job';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import { setSavedJobs, logout } from '@/redux/authSlice';
import { Bookmark, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';

const SavedJobs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, savedJobs } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirect to login if user is logged out
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const fetchSavedJobs = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, { withCredentials: true });
            if (res.data?.success) {
                dispatch(setSavedJobs(res.data.savedJobs || []));
            } else {
                setError(res.data?.message || "Failed to retrieve your saved jobs.");
            }
        } catch (err) {
            console.error("Fetch Saved Jobs Error:", err);
            if (err?.response?.status === 401) {
                dispatch(logout());
                navigate("/login");
                return;
            }
            setError(err?.response?.data?.message || "Failed to retrieve your saved jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchSavedJobs();
        } else {
            setLoading(false);
        }
    }, [user?._id]);

    // Safety guard: logged-out users must never see private saved jobs
    if (!user) {
        return null;
    }

    const displayJobs = user ? (savedJobs || []) : [];

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                                <Bookmark className="w-5 h-5 fill-accent" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">Saved Job Listings</h1>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Keep track of career opportunities you have bookmarked for later application.
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-text-secondary">Retrieving your saved listings...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-surface rounded-2xl border border-danger/30 p-10 text-center shadow-warm-sm max-w-lg mx-auto">
                            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-3">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <h2 className="text-base font-bold text-text-primary">Unable to load saved jobs</h2>
                            <p className="text-xs text-text-secondary mt-1 mb-5">{error}</p>
                            <Button 
                                size="sm" 
                                onClick={fetchSavedJobs} 
                                className="bg-accent hover:bg-accent-hover text-white font-semibold text-xs px-4 rounded-xl shadow-warm-sm"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (!displayJobs || displayJobs.length === 0) ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <div className="w-12 h-12 rounded-full bg-muted text-text-secondary flex items-center justify-center mx-auto mb-3">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <h2 className="text-base font-bold text-text-primary">No saved jobs yet</h2>
                            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                                You haven't bookmarked any jobs yet. Browse available listings and click the bookmark icon to save them here.
                            </p>
                            <Link to="/jobs" className="mt-4 inline-block">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white flex items-center gap-1.5 font-semibold rounded-xl shadow-warm-sm text-xs px-4">
                                    <span>Explore Openings</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {(displayJobs || []).map((job) => (
                                <Job key={job?._id} job={job} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default SavedJobs;
