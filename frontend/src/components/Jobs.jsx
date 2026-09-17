import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { setFilterCriteria, resetFilters } from '@/redux/jobSlice';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const Jobs = () => {
    useGetAllJobs();

    const dispatch = useDispatch();
    const { allJobs, filters } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [searchLocal, setSearchLocal] = useState(filters?.keyword || "");
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        dispatch(setFilterCriteria({ keyword: searchLocal }));
    };

    const handleSortChange = (e) => {
        dispatch(setFilterCriteria({ sort: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Strip with search & sort */}
                    <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-surface-border shadow-warm-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
                                <span>Explore Job Openings</span>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                    {allJobs.length} Available
                                </span>
                            </h1>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Real-time curated opportunities matching your career objectives.
                            </p>
                        </div>

                        {/* Top controls: quick search, sort, mobile filter button */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Inline search bar */}
                            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                                <Search className="w-4 h-4 text-text-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Filter by keyword or title..."
                                    value={searchLocal}
                                    onChange={(e) => setSearchLocal(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-surface-border bg-bg text-text-primary placeholder:text-text-secondary/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                />
                            </form>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1.5 border border-surface-border rounded-xl px-2.5 py-1.5 bg-bg text-xs">
                                <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary/60" />
                                <select 
                                    value={filters?.sort || ""}
                                    onChange={handleSortChange}
                                    className="bg-transparent text-text-primary font-semibold focus:outline-none cursor-pointer"
                                >
                                    <option value="">Most Recent</option>
                                    <option value="salary_high">Highest Salary</option>
                                    <option value="salary_low">Lowest Salary</option>
                                    {user?.role === 'student' && (
                                        <option value="match">Best Match % (Personalized)</option>
                                    )}
                                    <option value="oldest">Oldest Listings</option>
                                </select>
                            </div>

                            {/* Mobile filter toggle */}
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMobileFilter(!showMobileFilter)}
                                className="md:hidden flex items-center gap-1 text-xs border-surface-border text-text-primary hover:bg-muted rounded-xl"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>Filters</span>
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Layout: Sidebar Filters + Jobs Grid */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar Desktop */}
                        <div className="hidden md:block w-72 shrink-0">
                            <div className="sticky top-24">
                                <FilterCard />
                            </div>
                        </div>

                        {/* Mobile Collapsible Filter */}
                        {showMobileFilter && (
                            <div className="md:hidden mb-6">
                                <FilterCard />
                            </div>
                        )}

                        {/* Jobs Grid Container */}
                        <div className="flex-1">
                            {allJobs.length === 0 ? (
                                <div className="bg-surface rounded-2xl border border-surface-border p-12 text-center shadow-warm-sm">
                                    <div className="w-12 h-12 rounded-full bg-muted text-accent flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary">No matching jobs found</h3>
                                    <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                                        No active listings match the selected filters. Try broadening your criteria or reset filters.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                             setSearchLocal("");
                                             dispatch(resetFilters());
                                        }}
                                        className="mt-4 text-xs font-semibold border-surface-border text-accent hover:bg-muted rounded-xl"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                        Clear All Filters
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                                    {allJobs.map((job) => (
                                        <motion.div
                                            key={job?._id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Job job={job} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Jobs;