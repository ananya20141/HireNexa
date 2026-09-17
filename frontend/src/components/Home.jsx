import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import HeroSection from './HeroSection';
import CategoryCarousel from './CategoryCarousel';
import LatestJobs from './LatestJobs';
import Footer from './shared/Footer';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Briefcase, 
    ArrowRight, 
    Sparkles, 
    Cpu, 
    CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';

const Home = () => {
    useGetAllJobs();
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'recruiter') {
            navigate("/recruiter/dashboard");
        } else if (user?.role === 'admin') {
            navigate("/admin/dashboard");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-bg">
            <Navbar />
            <HeroSection />
            <CategoryCarousel />

            {/* Section: How HireNexa Works */}
            <section className="py-20 bg-bg border-y border-surface-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                            Workflow
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mt-3">
                            How HireNexa Works
                        </h2>
                        <p className="text-text-secondary text-sm sm:text-base mt-3">
                            A transparent, four-step path from candidate credentials to verified career placement.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm relative">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-sm mb-4 border border-accent/20">
                                1
                            </div>
                            <h3 className="font-bold text-text-primary text-base mb-1.5">Build Your Profile</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Enter your verified skills, experience level, and academic background into your profile.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm relative">
                            <div className="w-8 h-8 rounded-xl bg-muted text-text-secondary flex items-center justify-center font-bold text-sm mb-4 border border-surface-border">
                                2
                            </div>
                            <h3 className="font-bold text-text-primary text-base mb-1.5">Upload Your Resume</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Upload a PDF or Word document to enable automated semantic and keyword skill parsing.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm relative">
                            <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold text-sm mb-4 border border-warning/30">
                                3
                            </div>
                            <h3 className="font-bold text-text-primary text-base mb-1.5">Discover Matches</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                See accurate match percentages for each job, along with matched skills and missing gaps.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-warm-sm relative">
                            <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold text-sm mb-4 border border-success/30">
                                4
                            </div>
                            <h3 className="font-bold text-text-primary text-base mb-1.5">Apply with Confidence</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Submit applications with one click and track real-time stages through the Journey Tracker.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Visual Feature Showcase — Deterministic Match System */}
            <section className="py-20 bg-surface border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">
                                <Cpu className="w-3.5 h-3.5 text-accent" />
                                <span>Deterministic Algorithmic Matching</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight">
                                Transparent Math, <br />
                                Not Black-Box Guesswork.
                            </h2>
                            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                HireNexa replaces arbitrary candidate ranking with a transparent four-pillar scoring formula. Candidates understand why they match and recruiters get objectively aligned talent.
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-success/30">
                                        50%
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">Skills Alignment</h4>
                                        <p className="text-xs text-text-secondary">Exact and alias matching against job technical requirements.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-accent/20">
                                        25%
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">Experience Seniority</h4>
                                        <p className="text-xs text-text-secondary">Graduated scoring based on verified professional years.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-muted text-text-secondary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-surface-border">
                                        15%
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">Context & Keyword Overlap</h4>
                                        <p className="text-xs text-text-secondary">Evaluation of candidate bio and project descriptions.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-warning/30">
                                        10%
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">Education & Degree</h4>
                                        <p className="text-xs text-text-secondary">Relevant academic specialization credentials.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Card Example - Clean warm aesthetic */}
                        <div className="bg-bg text-text-primary p-6 sm:p-7 rounded-2xl shadow-warm-sm border border-surface-border relative">
                            <div className="flex items-center justify-between pb-5 border-b border-surface-border">
                                <div>
                                    <span className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Live Preview</span>
                                    <h3 className="text-lg font-bold text-text-primary mt-0.5">Senior FullStack Engineer</h3>
                                    <p className="text-xs text-text-secondary">TechCorp Solutions · Bengaluru</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success font-bold text-xs">
                                        <span className="w-2 h-2 rounded-full bg-success" />
                                        <span>82% Match</span>
                                    </div>
                                    <p className="text-[10px] text-text-secondary mt-1">Strong Fit</p>
                                </div>
                            </div>

                            <div className="py-5 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-medium text-text-secondary mb-1.5">
                                        <span>Match Breakdown</span>
                                        <span className="text-text-primary font-bold">82 / 100</span>
                                    </div>
                                    <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                                        <div className="bg-success h-2 rounded-full w-[82%] transition-all duration-700 ease-out" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="p-3 bg-success/10 border border-success/30 rounded-xl">
                                        <p className="text-[11px] font-bold text-success mb-1 flex items-center gap-1">
                                            <span>✓ Matched Skills</span>
                                        </p>
                                        <p className="text-xs text-text-primary">React, JavaScript, Node.js, MongoDB</p>
                                    </div>
                                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
                                        <p className="text-[11px] font-bold text-warning mb-1 flex items-center gap-1">
                                            <span>• Missing Requirements</span>
                                        </p>
                                        <p className="text-xs text-text-primary">Docker, AWS DevOps</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs text-text-secondary">
                                <span>Experience: 2 yrs required / 3 yrs on profile</span>
                                <span className="text-success font-semibold">Qualified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest & Featured Jobs */}
            <LatestJobs />

            {/* Section: Recruiter CTA */}
            <section className="py-16 bg-[#2E2824] text-[#FAF7F3] border-t border-[#3A3530] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FAF7F3] border border-white/15 text-xs font-semibold">
                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                            <span>For Employers & Recruiters</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Find your next great hire on HireNexa.
                        </h2>
                        <p className="text-sm text-[#E9E1D6]/80 leading-relaxed">
                            Publish job openings, evaluate applicants with deterministic compatibility scores, and streamline your recruitment pipeline.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <Link to="/signup">
                            <Button className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-xl shadow-warm-sm text-sm">
                                Post a Job
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                                Recruiter Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;