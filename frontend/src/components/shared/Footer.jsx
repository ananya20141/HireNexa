import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface text-text-secondary pt-16 pb-12 border-t border-surface-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-border">
                    {/* Brand column */}
                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-warm-sm">
                                <Sparkles className="w-4 h-4 fill-white/20" />
                            </div>
                            <span className="text-xl font-bold text-text-primary tracking-tight">
                                Hire<span className="text-accent">Nexa</span>
                            </span>
                        </Link>
                        <p className="text-xs leading-relaxed text-text-secondary">
                            The intelligent career marketplace powered by deterministic Resume–Job matching. Connect candidate potential with ideal opportunities through authentic transparency.
                        </p>
                    </div>

                    {/* Candidates */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Candidates</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/jobs" className="hover:text-accent transition-colors">Explore All Jobs</Link></li>
                            <li><Link to="/browse" className="hover:text-accent transition-colors">Browse by Category</Link></li>
                            <li><Link to="/saved-jobs" className="hover:text-accent transition-colors">Saved Positions</Link></li>
                            <li><Link to="/profile" className="hover:text-accent transition-colors">Profile & Skills</Link></li>
                        </ul>
                    </div>

                    {/* Employers */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Employers</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/recruiter/dashboard" className="hover:text-accent transition-colors">Recruiter Workspace</Link></li>
                            <li><Link to="/recruiter/jobs/create" className="hover:text-accent transition-colors">Post an Opening</Link></li>
                            <li><Link to="/recruiter/companies" className="hover:text-accent transition-colors">Manage Companies</Link></li>
                            <li><Link to="/recruiter/jobs" className="hover:text-accent transition-colors">Applicant Pipeline</Link></li>
                        </ul>
                    </div>

                    {/* Governance & Stack */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Platform Architecture</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/admin/dashboard" className="hover:text-accent transition-colors">Admin Governance</Link></li>
                            <li><span className="text-text-secondary">MERN Stack</span></li>
                            <li><span className="text-text-secondary">Deterministic Match Engine V1</span></li>
                            <li><span className="text-text-secondary">RBAC Security Layer</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p className="text-text-secondary">
                        © {new Date().getFullYear()} HireNexa Career Technologies. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5 text-text-secondary">
                        <span>Designed with</span>
                        <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
                        <span>for high-precision career placement.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;