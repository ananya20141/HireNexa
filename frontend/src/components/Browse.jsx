import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import Job from './Job';
import { useSelector } from 'react-redux';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { Search, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Browse = () => {
    useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);

    useEffect(() => {
        return () => {
            // keep query during session or clean up on unmount
        };
    }, []);

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                                <Compass className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                                    {searchedQuery ? `Results for "${searchedQuery}"` : "Browse Available Openings"}
                                </h1>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Displaying {allJobs.length} active verified career opportunities.
                                </p>
                            </div>
                        </div>

                        <Link to="/jobs">
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold border-surface-border text-text-primary hover:bg-muted">
                                View Filtered Search
                            </Button>
                        </Link>
                    </div>

                    {allJobs.length === 0 ? (
                        <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                            <div className="w-12 h-12 rounded-full bg-muted text-accent flex items-center justify-center mx-auto mb-3">
                                <Search className="w-6 h-6" />
                            </div>
                            <h2 className="text-base font-bold text-text-primary">No positions found</h2>
                            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                                No active postings matched your query. Browse all available positions or adjust your keywords.
                            </p>
                            <Link to="/jobs" className="mt-4 inline-block">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl shadow-warm-sm text-xs px-4">
                                    Browse All Jobs
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {allJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Browse;