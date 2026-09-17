import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck, Target, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setFilterCriteria, setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (e) => {
        e.preventDefault();
        dispatch(setSearchedQuery(keyword));
        dispatch(setFilterCriteria({ keyword, location }));
        navigate("/jobs");
    };

    return (
        <div className="relative overflow-hidden bg-bg pt-16 pb-20 border-b border-surface-border">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F0DACF]/40 rounded-full blur-3xl" />
                <div className="absolute top-10 -right-32 w-96 h-96 bg-[#FDF7EE]/60 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-semibold mb-6 shadow-warm-sm">
                    <Sparkles className="w-3.5 h-3.5 text-warning" />
                    <span>Next-gen deterministic resume matching</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-[1.18]">
                    Find jobs that match <span className="text-accent">you.</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    Stop applying blindly. HireNexa analyzes your skills, experience, and resume against job requirements to calculate an authentic, transparent match score.
                </p>

                {/* Connected Search Bar & CTA Unit */}
                <form 
                    onSubmit={searchJobHandler} 
                    className="mt-8 max-w-3xl mx-auto bg-surface p-2 rounded-2xl shadow-warm-sm border border-surface-border flex flex-col sm:flex-row items-center gap-2"
                >
                    <div className="flex items-center gap-3 w-full sm:w-1/2 px-3.5 py-2">
                        <Search className="w-4 h-4 text-text-secondary/60 shrink-0" />
                        <input
                            type="text"
                            placeholder="Job title, skill (e.g. React, Node.js)"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none bg-transparent"
                        />
                    </div>

                    <div className="hidden sm:block h-7 w-[1px] bg-surface-border" />

                    <div className="flex items-center gap-3 w-full sm:w-1/2 px-3.5 py-2">
                        <MapPin className="w-4 h-4 text-text-secondary/60 shrink-0" />
                        <input
                            type="text"
                            placeholder="Location (e.g. Bengaluru, Remote)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none bg-transparent"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-warm-sm transition-colors shrink-0 text-sm"
                    >
                        <span>Search</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>

                {/* Platform highlights */}
                <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 border-t border-surface-border text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0 border border-success/30">
                            <Target className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary font-normal">Precision</p>
                            <p className="text-sm font-semibold text-text-primary">4-Factor Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary font-normal">Verification</p>
                            <p className="text-sm font-semibold text-text-primary">Admin Approved</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0 border border-warning/30">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary font-normal">Feedback</p>
                            <p className="text-sm font-semibold text-text-primary">Skills Gap Insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;