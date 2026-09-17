import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        bio: "",
        skills: "",
        experienceYears: 0,
        educationDegree: "",
        educationInstitution: "",
        educationYear: "",
        firstJobMode: false,
        githubUrl: "",
        projectTitle: "",
        projectDesc: "",
        projectLink: "",
        certName: "",
        certIssuer: "",
        file: null
    });

    useEffect(() => {
        if (user) {
            const firstEdu = user.profile?.education?.[0] || {};
            const firstProj = user.profile?.projects?.[0] || {};
            const firstCert = user.profile?.certifications?.[0] || {};
            setInput({
                fullname: user.fullname || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                bio: user.profile?.bio || "",
                skills: Array.isArray(user.profile?.skills) ? user.profile.skills.join(", ") : "",
                experienceYears: user.profile?.experienceYears || 0,
                educationDegree: firstEdu.degree || "",
                educationInstitution: firstEdu.institution || "",
                educationYear: firstEdu.year || "",
                firstJobMode: Boolean(user.profile?.firstJobMode),
                githubUrl: user.profile?.githubUrl || "",
                projectTitle: firstProj.title || "",
                projectDesc: firstProj.description || "",
                projectLink: firstProj.link || "",
                certName: firstCert.name || "",
                certIssuer: firstCert.issuer || "",
                file: null
            });
        }
    }, [user, open]);

    const changeEventHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setInput({ 
            ...input, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Correct field names matching backend schema & backward compatibility
        formData.append("fullname", input.fullname);
        formData.append("name", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("number", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        formData.append("experienceYears", input.experienceYears);
        formData.append("firstJobMode", input.firstJobMode);
        formData.append("githubUrl", input.githubUrl);

        // Package education structure
        if (input.educationDegree || input.educationInstitution) {
            const eduArray = [{
                degree: input.educationDegree,
                institution: input.educationInstitution,
                year: input.educationYear
            }];
            formData.append("education", JSON.stringify(eduArray));
        }

        // Package featured project
        if (input.projectTitle) {
            const projArray = [{
                title: input.projectTitle,
                description: input.projectDesc,
                link: input.projectLink
            }];
            formData.append("projects", JSON.stringify(projArray));
        }

        // Package certification
        if (input.certName) {
            const certArray = [{
                name: input.certName,
                issuer: input.certIssuer,
                year: new Date().getFullYear().toString()
            }];
            formData.append("certifications", JSON.stringify(certArray));
        }

        // Only append file if a new File was explicitly selected
        if (input.file instanceof File) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || "Profile updated successfully.");
                setOpen(false);
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl" onInteractOutside={() => setOpen(false)}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-text-primary">Update Candidate Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={submitHandler} className="space-y-4 py-2">
                    {/* Full Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullname" className="text-right text-xs font-semibold text-text-primary">
                            Full Name
                        </Label>
                        <Input
                            id="fullname"
                            name="fullname"
                            type="text"
                            value={input.fullname}
                            onChange={changeEventHandler}
                            className="col-span-3 text-xs"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-xs font-semibold text-text-primary">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="col-span-3 text-xs"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phoneNumber" className="text-right text-xs font-semibold text-text-primary">
                            Phone Number
                        </Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="text"
                            value={input.phoneNumber}
                            onChange={changeEventHandler}
                            className="col-span-3 text-xs"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right text-xs font-semibold text-text-primary">
                            Bio Summary
                        </Label>
                        <Input
                            id="bio"
                            name="bio"
                            value={input.bio}
                            onChange={changeEventHandler}
                            placeholder="e.g. FullStack engineer passionate about distributed systems"
                            className="col-span-3 text-xs"
                        />
                    </div>

                    {/* Experience in Years */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="experienceYears" className="text-right text-xs font-semibold text-text-primary">
                            Experience (Yrs)
                        </Label>
                        <Input
                            id="experienceYears"
                            name="experienceYears"
                            type="number"
                            min="0"
                            step="0.5"
                            value={input.experienceYears}
                            onChange={changeEventHandler}
                            className="col-span-3 text-xs"
                            required
                        />
                    </div>

                    {/* Skills */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="skills" className="text-right text-xs font-semibold text-text-primary">
                            Skills (Comma sep)
                        </Label>
                        <Input
                            id="skills"
                            name="skills"
                            value={input.skills}
                            onChange={changeEventHandler}
                            placeholder="React, Node.js, TypeScript, MongoDB"
                            className="col-span-3 text-xs"
                        />
                    </div>

                    {/* Education section */}
                    {/* Education section */}
                    <div className="pt-2 border-t border-surface-border">
                        <p className="text-xs font-bold text-text-primary mb-2">Education Background</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[11px] text-text-secondary">Degree</Label>
                                <Input
                                    name="educationDegree"
                                    placeholder="B.Tech Computer Science"
                                    value={input.educationDegree}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] text-text-secondary">Institution</Label>
                                <Input
                                    name="educationInstitution"
                                    placeholder="University / College"
                                    value={input.educationInstitution}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] text-text-secondary">Year</Label>
                                <Input
                                    name="educationYear"
                                    placeholder="2024"
                                    value={input.educationYear}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* First Job Mode & Portfolio Section */}
                    <div className="pt-3 border-t border-surface-border space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/30">
                            <div>
                                <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                    <span>🌱 Enable First Job Mode</span>
                                </p>
                                <p className="text-[11px] text-text-secondary mt-0.5">
                                    Removes 0-year experience penalty and prioritizes projects, skills & coursework.
                                </p>
                            </div>
                            <input 
                                type="checkbox" 
                                name="firstJobMode"
                                id="firstJobMode"
                                checked={input.firstJobMode} 
                                onChange={changeEventHandler}
                                className="w-4 h-4 rounded text-success focus:ring-success cursor-pointer"
                            />
                        </div>

                        {/* GitHub Profile URL */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="githubUrl" className="text-right text-xs font-semibold text-text-primary">
                                GitHub URL
                            </Label>
                            <Input
                                id="githubUrl"
                                name="githubUrl"
                                value={input.githubUrl}
                                onChange={changeEventHandler}
                                placeholder="https://github.com/username"
                                className="col-span-3 text-xs"
                            />
                        </div>

                        {/* Featured Project */}
                        <div className="space-y-2 p-3 bg-bg rounded-xl border border-surface-border">
                            <p className="text-xs font-bold text-text-primary">Featured Hands-on Project</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    name="projectTitle"
                                    placeholder="Project Title (e.g. Job Tracker)"
                                    value={input.projectTitle}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                                <Input
                                    name="projectLink"
                                    placeholder="Live Demo or Repo URL"
                                    value={input.projectLink}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                            </div>
                            <Input
                                name="projectDesc"
                                placeholder="Short description of technical architecture & stack"
                                value={input.projectDesc}
                                onChange={changeEventHandler}
                                className="text-xs h-8"
                            />
                        </div>

                        {/* Featured Certification */}
                        <div className="space-y-2 p-3 bg-bg rounded-xl border border-surface-border">
                            <p className="text-xs font-bold text-text-primary">Certification</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    name="certName"
                                    placeholder="Cert Name (e.g. AWS Cloud Practitioner)"
                                    value={input.certName}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                                <Input
                                    name="certIssuer"
                                    placeholder="Issuer (e.g. Amazon / Coursera)"
                                    value={input.certIssuer}
                                    onChange={changeEventHandler}
                                    className="text-xs h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Optional Resume/Photo File Upload */}
                    <div className="grid grid-cols-4 items-center gap-4 pt-2 border-t border-surface-border">
                        <Label htmlFor="file" className="text-right text-xs font-semibold text-text-primary">
                            Resume (PDF/DOC)
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept=".pdf,.doc,.docx,image/*"
                                onChange={fileChangeHandler}
                                className="text-xs cursor-pointer"
                            />
                            <p className="text-[10px] text-text-secondary/60 mt-1">
                                Optional. Uploading updates your resume for deterministic match calculation.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-surface-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-xl text-xs border-surface-border text-text-primary hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-warm-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;