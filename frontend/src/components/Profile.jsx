import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Contact, Mail, Pen, FileText, Download, Trash2, Sparkles, GraduationCap, Briefcase, Plus, Sprout, FolderGit2, Award, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import { useDispatch, useSelector } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const [removingResume, setRemovingResume] = useState(false);
    const [togglingMode, setTogglingMode] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const getInitials = (name) => {
        if (!name) return "HN";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const toggleFirstJobModeHandler = async () => {
        try {
            setTogglingMode(true);
            const res = await axios.post(`${USER_API_END_POINT}/first-job-mode`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Toggle First Job Mode Error:", error);
            toast.error(error?.response?.data?.message || "Failed to toggle First Job Mode.");
        } finally {
            setTogglingMode(false);
        }
    };

    const deleteResumeHandler = async () => {
        if (!window.confirm("Are you sure you want to remove your resume?")) return;

        try {
            setRemovingResume(true);
            const res = await axios.delete(`${USER_API_END_POINT}/resume/delete`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || "Resume removed.");
            }
        } catch (error) {
            console.error("Delete Resume Error:", error);
            toast.error(error?.response?.data?.message || "Failed to remove resume.");
        } finally {
            setRemovingResume(false);
        }
    };

    const hasResume = !!user?.profile?.resume;
    const skills = Array.isArray(user?.profile?.skills) ? user.profile.skills : [];
    const education = Array.isArray(user?.profile?.education) ? user.profile.education : [];

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                    {/* Profile Information Card */}
                    <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-warm-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-surface-border">
                            <div className="flex items-center gap-5">
                                <Avatar className="h-20 w-20 rounded-2xl border border-surface-border shadow-warm-sm shrink-0">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                    <AvatarFallback className="bg-accent text-white font-bold text-xl rounded-2xl">
                                        {getInitials(user?.fullname)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-bold text-2xl text-text-primary">{user?.fullname}</h1>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                                            {user?.role === 'student' ? 'Candidate' : user?.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1 max-w-lg leading-relaxed">
                                        {user?.profile?.bio || "No professional bio added yet. Click edit to describe your expertise."}
                                    </p>
                                </div>
                            </div>

                            <Button 
                                onClick={() => setOpen(true)} 
                                variant="outline" 
                                className="rounded-xl border-surface-border hover:bg-muted text-text-primary flex items-center gap-1.5 text-xs font-semibold shrink-0"
                            >
                                <Pen className="w-3.5 h-3.5" />
                                <span>Edit Profile</span>
                            </Button>
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                                <div className="w-8 h-8 rounded-xl bg-bg border border-surface-border flex items-center justify-center text-text-secondary/80">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                                <div className="w-8 h-8 rounded-xl bg-bg border border-surface-border flex items-center justify-center text-text-secondary/80">
                                    <Contact className="w-4 h-4" />
                                </div>
                                <span>{user?.phoneNumber || "No phone registered"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                                <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <span>Experience: <strong className="text-text-primary">{user?.profile?.experienceYears || 0} years</strong></span>
                            </div>
                            {user?.profile?.githubUrl && (
                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                    <div className="w-8 h-8 rounded-xl bg-bg border border-surface-border flex items-center justify-center text-text-secondary/80">
                                        <FolderGit2 className="w-4 h-4" />
                                    </div>
                                    <a 
                                        href={user.profile.githubUrl.startsWith('http') ? user.profile.githubUrl : `https://${user.profile.githubUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-accent font-semibold hover:underline truncate"
                                    >
                                        {user.profile.githubUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* First Job Mode Card */}
                        {user?.role === 'student' && (
                            <div className="my-6 p-5 rounded-2xl bg-success/10 border border-success/30 shadow-warm-sm transition-all">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0 shadow-warm-sm">
                                            <Sprout className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-base text-text-primary">
                                                    First Job Mode
                                                </h3>
                                                {user?.profile?.firstJobMode ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success text-white shadow-warm-sm">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-surface-border text-text-secondary">
                                                        Disabled
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-success mt-0.5">
                                                "Get opportunities based on your potential, not just experience."
                                            </p>
                                            <p className="text-[11px] text-text-secondary mt-1 max-w-xl leading-relaxed">
                                                For students and freshers with 0 years of experience. When active, matching algorithms remove the 0-year experience penalty and prioritize your skills, projects, certifications, GitHub, and coursework.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={togglingMode}
                                        onClick={toggleFirstJobModeHandler}
                                        className={`rounded-xl text-xs font-semibold px-4 shadow-warm-sm shrink-0 transition-all ${
                                            user?.profile?.firstJobMode
                                                ? 'bg-success hover:bg-success/90 text-white'
                                                : 'bg-surface hover:bg-muted text-text-primary border border-surface-border'
                                        }`}
                                    >
                                        {togglingMode ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                        ) : (
                                            <Sprout className="w-3.5 h-3.5 mr-1.5" />
                                        )}
                                        <span>
                                            {user?.profile?.firstJobMode ? 'Disable First Job Mode' : 'Enable First Job Mode'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Skills Section */}
                        <div className="pt-4 border-t border-surface-border">
                            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5">
                                Technical Skills ({skills.length})
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.length > 0 ? (
                                    skills.map((item, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-bg text-text-primary border border-surface-border"
                                        >
                                            {item}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-text-secondary/60 italic">
                                        No skills added. Add skills to power deterministic job matching!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Projects & Certifications (First Job Mode Portfolio) */}
                        {Array.isArray(user?.profile?.projects) && user.profile.projects.length > 0 && (
                            <div className="pt-5 border-t border-surface-border mt-5">
                                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <FolderGit2 className="w-4 h-4 text-accent" />
                                    <span>Hands-on Projects ({user.profile.projects.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user.profile.projects.map((proj, pidx) => (
                                        <div key={pidx} className="p-3.5 bg-bg border border-surface-border rounded-xl text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-text-primary">{proj.title || 'Project'}</p>
                                                {proj.link && (
                                                    <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-text-secondary leading-relaxed text-[11px]">{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(user?.profile?.certifications) && user.profile.certifications.length > 0 && (
                            <div className="pt-5 border-t border-surface-border mt-5">
                                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-accent" />
                                    <span>Certifications ({user.profile.certifications.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user.profile.certifications.map((cert, cidx) => (
                                        <div key={cidx} className="p-3 bg-bg border border-surface-border rounded-xl text-xs">
                                            <p className="font-bold text-text-primary">{cert.name || 'Certification'}</p>
                                            <p className="text-text-secondary text-[11px]">{cert.issuer || 'Issuer'} · {cert.year || 'Completed'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education Background */}
                        {education.length > 0 && (
                            <div className="pt-5 border-t border-surface-border mt-5">
                                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-accent" />
                                    <span>Education</span>
                                </h2>
                                <div className="space-y-2">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="p-3 bg-bg border border-surface-border rounded-xl text-xs text-text-primary">
                                            <p className="font-bold text-text-primary">{edu.degree || "Degree"}</p>
                                            <p className="text-text-secondary">{edu.institution || "Institution"} · Class of {edu.year || "N/A"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume Section */}
                        <div className="pt-5 border-t border-surface-border mt-5">
                            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5">
                                Resume Document
                            </h2>
                            {hasResume ? (
                                <div className="flex items-center justify-between p-3.5 bg-bg border border-surface-border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-primary">
                                                {user?.profile?.resumeOriginalName || "Resume Document"}
                                            </p>
                                            <p className="text-[11px] text-text-secondary">Verified and linked to profile</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={user.profile.resume} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:bg-muted text-text-primary transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>View / Download</span>
                                        </a>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={removingResume}
                                            onClick={deleteResumeHandler}
                                            className="text-xs h-8 px-2.5 text-danger hover:text-danger hover:bg-danger/10 rounded-xl"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-accent/40 bg-accent/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-accent shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-text-primary">
                                                Upload your resume to unlock personalized job matching.
                                            </p>
                                            <p className="text-[11px] text-text-secondary">
                                                Supports PDF and Word formats. Matches your resume against live requirements.
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => setOpen(true)}
                                        className="bg-accent hover:bg-accent-hover text-white font-medium text-xs rounded-xl shrink-0 shadow-warm-sm"
                                    >
                                        Upload Resume
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Applied Jobs History Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-primary">Application History</h2>
                        </div>
                        <AppliedJobTable />
                    </div>
                </main>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
            <Footer />
        </div>
    );
};

export default Profile;