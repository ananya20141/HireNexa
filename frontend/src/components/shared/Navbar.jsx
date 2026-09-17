import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
    LogOut, 
    User2, 
    Bookmark, 
    Briefcase, 
    Building2, 
    LayoutDashboard, 
    Menu, 
    X,
    Sparkles,
    PlusCircle
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { logout } from '@/redux/authSlice';
import { toast } from 'sonner';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(logout());
                toast.success(res.data.message);
                navigate("/");
            }
        } catch (error) {
            console.error("Logout Error:", error);
            dispatch(logout());
            toast.info("Logged out locally.");
            navigate("/");
        }
    };

    const getInitials = (name) => {
        if (!name) return "HN";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className='bg-bg/95 backdrop-blur-md sticky top-0 z-50 border-b border-surface-border transition-all'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8'>
                {/* Brand Logo */}
                <Link to="/" className='flex items-center gap-2.5 group'>
                    <div className='w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-warm-sm transition-transform group-hover:scale-105'>
                        <Sparkles className="w-4 h-4 fill-white/20" />
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-xl font-bold tracking-tight text-text-primary leading-none'>
                            Hire<span className='text-accent'>Nexa</span>
                        </span>
                        <span className='text-[10px] font-medium text-text-secondary tracking-wider uppercase mt-0.5'>Job Intelligence</span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className='hidden md:flex items-center gap-8'>
                    {user?.role === 'admin' ? (
                        <>
                            <Link to="/admin/dashboard" className={`text-sm font-medium transition-colors ${isActive('/admin/dashboard') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Dashboard
                            </Link>
                            <Link to="/admin/jobs" className={`text-sm font-medium transition-colors ${isActive('/admin/jobs') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Moderation
                            </Link>
                            <Link to="/admin/recruiters" className={`text-sm font-medium transition-colors ${isActive('/admin/recruiters') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Recruiters
                            </Link>
                            <Link to="/admin/candidates" className={`text-sm font-medium transition-colors ${isActive('/admin/candidates') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Candidates
                            </Link>
                            <Link to="/admin/activity" className={`text-sm font-medium transition-colors ${isActive('/admin/activity') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Activity
                            </Link>
                        </>
                    ) : user?.role === 'recruiter' ? (
                        <>
                            <Link to="/recruiter/dashboard" className={`text-sm font-medium transition-colors ${isActive('/recruiter/dashboard') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Overview
                            </Link>
                            <Link to="/recruiter/jobs" className={`text-sm font-medium transition-colors ${isActive('/recruiter/jobs') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Posted Jobs
                            </Link>
                            <Link to="/recruiter/companies" className={`text-sm font-medium transition-colors ${isActive('/recruiter/companies') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Companies
                            </Link>
                            <Link to="/recruiter/jobs/create">
                                <Button size="sm" className="bg-accent hover:bg-accent-hover text-white font-medium rounded-xl flex items-center gap-1.5 shadow-warm-sm text-xs">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Post Job</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Home
                            </Link>
                            <Link to="/jobs" className={`text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Find Jobs
                            </Link>
                            <Link to="/skill-gap-analyzer" className={`text-sm font-medium transition-colors ${isActive('/skill-gap-analyzer') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Skill Gap
                            </Link>
                            <Link to="/saved-jobs" className={`text-sm font-medium transition-colors ${isActive('/saved-jobs') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Saved Jobs
                            </Link>
                            <Link to="/browse" className={`text-sm font-medium transition-colors ${isActive('/browse') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                                Browse
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right side Profile / Auth Buttons */}
                <div className='hidden md:flex items-center gap-3'>
                    {!user ? (
                        <div className='flex items-center gap-2.5'>
                            <Link to="/login">
                                <Button variant="ghost" className="font-semibold text-text-primary hover:text-accent hover:bg-muted rounded-xl text-xs">
                                    Log In
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl shadow-warm-sm text-xs px-4">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-2 p-1 rounded-full border border-surface-border hover:border-accent focus:outline-none transition-all">
                                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-accent/10">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        <AvatarFallback className="bg-muted text-accent font-bold text-xs">
                                            {getInitials(user?.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4 rounded-2xl shadow-warm-md border border-surface-border bg-surface" align="end">
                                <div className='flex items-center gap-3 pb-3 border-b border-surface-border'>
                                    <Avatar className="h-11 w-11">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        <AvatarFallback className="bg-accent text-white font-bold">
                                            {getInitials(user?.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <h4 className='font-bold text-text-primary text-sm truncate'>{user?.fullname}</h4>
                                        <p className='text-xs text-text-secondary truncate'>{user?.email}</p>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-muted text-accent">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>

                                <div className='pt-2 space-y-1 text-sm'>
                                    {user?.role === 'admin' ? (
                                        <>
                                            <Link to="/admin/dashboard" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <LayoutDashboard className="w-4 h-4 text-accent" />
                                                <span>Admin Console</span>
                                            </Link>
                                        </>
                                    ) : user?.role === 'recruiter' ? (
                                        <>
                                            <Link to="/recruiter/dashboard" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <LayoutDashboard className="w-4 h-4 text-accent" />
                                                <span>Recruiter Dashboard</span>
                                            </Link>
                                            <Link to="/recruiter/companies" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <Building2 className="w-4 h-4 text-accent" />
                                                <span>My Companies</span>
                                            </Link>
                                            <Link to="/recruiter/jobs" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <Briefcase className="w-4 h-4 text-accent" />
                                                <span>My Posted Jobs</span>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/profile" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <User2 className="w-4 h-4 text-accent" />
                                                <span>Candidate Profile</span>
                                            </Link>
                                            <Link to="/saved-jobs" className='flex items-center gap-2.5 p-2 rounded-xl text-text-primary hover:bg-muted hover:text-accent transition-colors'>
                                                <Bookmark className="w-4 h-4 text-accent" />
                                                <span>Saved Jobs</span>
                                            </Link>
                                        </>
                                    )}

                                    <button 
                                        onClick={logoutHandler}
                                        className='w-full flex items-center gap-2.5 p-2 rounded-xl text-danger hover:bg-danger/10 transition-colors text-left font-medium'
                                    >
                                        <LogOut className="w-4 h-4 text-danger" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <div className='md:hidden flex items-center'>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-text-secondary hover:text-text-primary focus:outline-none"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-surface-border bg-bg px-4 pt-2 pb-5 space-y-3">
                    {user?.role === 'admin' ? (
                        <>
                            <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Dashboard</Link>
                            <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Moderation</Link>
                            <Link to="/admin/recruiters" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Recruiters</Link>
                            <Link to="/admin/candidates" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Candidates</Link>
                            <Link to="/admin/activity" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Activity</Link>
                        </>
                    ) : user?.role === 'recruiter' ? (
                        <>
                            <Link to="/recruiter/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Dashboard</Link>
                            <Link to="/recruiter/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Jobs</Link>
                            <Link to="/recruiter/companies" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Companies</Link>
                            <Link to="/recruiter/jobs/create" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-accent font-semibold">+ Post Job</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Home</Link>
                            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Find Jobs</Link>
                            <Link to="/skill-gap-analyzer" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Skill Gap Analyzer</Link>
                            <Link to="/saved-jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Saved Jobs</Link>
                            <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">Browse</Link>
                            {user && <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-text-primary font-medium hover:text-accent">My Profile</Link>}
                        </>
                    )}

                    <div className="pt-2 border-t border-surface-border flex flex-col gap-2">
                        {!user ? (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-surface-border text-text-primary hover:bg-muted rounded-xl">Log In</Button>
                                </Link>
                                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full bg-accent hover:bg-accent-hover text-white rounded-xl">Sign Up</Button>
                                </Link>
                            </>
                        ) : (
                            <Button onClick={logoutHandler} variant="outline" className="w-full border-surface-border text-danger hover:bg-danger/10 rounded-xl">
                                Sign Out
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;