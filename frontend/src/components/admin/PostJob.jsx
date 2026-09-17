import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';

const PostJob = () => {
    // Automatically fetch companies on direct navigation
    useGetAllCompanies();

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "Full Time",
        experienceLevel: "",
        position: 1,
        companyId: "",
        category: "Engineering"
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        setInput({ ...input, companyId: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.companyId) {
            toast.error("Please select a registered company.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message || "Job posted successfully.");
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            console.error("Post Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to post job.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg pb-12 flex flex-col justify-between">
            <div>
                <Navbar />
                <div className="max-w-3xl mx-auto my-10 px-4">
                    <div className="bg-surface p-8 rounded-2xl border border-surface-border shadow-warm-sm">
                        <div className="flex items-center gap-4 pb-6 border-b border-surface-border mb-6">
                            <Button 
                                onClick={() => navigate("/recruiter/jobs")} 
                                variant="outline" 
                                size="sm"
                                className="rounded-xl border-surface-border hover:bg-bg text-text-primary flex items-center gap-1.5 text-xs font-semibold"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </Button>
                            <div>
                                <h1 className="font-bold text-xl text-text-primary">Publish New Job Opening</h1>
                                <p className="text-xs text-text-secondary">Provide clear requirements to enable accurate Resume-Job match scoring.</p>
                            </div>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Job Title</Label>
                                    <Input
                                        type="text"
                                        name="title"
                                        placeholder="e.g. Senior Frontend Engineer"
                                        value={input.title}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Category / Domain</Label>
                                    <Input
                                        type="text"
                                        name="category"
                                        placeholder="e.g. Engineering, Design, DevOps"
                                        value={input.category}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-text-primary">Job Description</Label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="Describe responsibilities, day-to-day deliverables, and company culture..."
                                    value={input.description}
                                    onChange={changeEventHandler}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-bg text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-text-primary">
                                    Required Skills (Comma-separated)
                                </Label>
                                <Input
                                    type="text"
                                    name="requirements"
                                    placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
                                    value={input.requirements}
                                    onChange={changeEventHandler}
                                    className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                    required
                                />
                                <p className="text-[10px] text-text-secondary mt-1">
                                    These skills are used by HireNexa to compute candidate match scores.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Annual Salary (LPA)</Label>
                                    <Input
                                        type="number"
                                        name="salary"
                                        placeholder="e.g. 12"
                                        value={input.salary}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Experience (Years)</Label>
                                    <Input
                                        type="number"
                                        name="experienceLevel"
                                        placeholder="e.g. 2"
                                        min="0"
                                        value={input.experienceLevel}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">No. of Open Positions</Label>
                                    <Input
                                        type="number"
                                        name="position"
                                        placeholder="1"
                                        min="1"
                                        value={input.position}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Location</Label>
                                    <Input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Bengaluru, Remote, Delhi NCR"
                                        value={input.location}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Job Type</Label>
                                    <Input
                                        type="text"
                                        name="jobType"
                                        placeholder="e.g. Full Time, Part Time, Contract"
                                        value={input.jobType}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company Selection Dropdown */}
                            <div>
                                <Label className="text-xs font-semibold text-text-primary mb-1 block">Company</Label>
                                {companies.length > 0 ? (
                                    <Select onValueChange={selectChangeHandler} value={input.companyId}>
                                        <SelectTrigger className="w-full text-xs rounded-xl border-surface-border bg-bg text-text-primary">
                                            <SelectValue placeholder="Select one of your registered companies" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-surface-border bg-surface shadow-warm-md">
                                            <SelectGroup>
                                                {companies.map((company) => (
                                                    <SelectItem key={company._id} value={company._id} className="text-xs text-text-primary hover:bg-bg hover:text-accent rounded-lg cursor-pointer">
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs text-text-primary flex items-center justify-between">
                                        <span>You must register a company profile before posting an opening.</span>
                                        <Link to="/recruiter/companies/create" className="font-bold text-accent underline ml-2">
                                            Create Company →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-surface-border flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/recruiter/jobs")}
                                    className="text-xs rounded-xl border-surface-border hover:bg-bg text-text-primary"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading || companies.length === 0}
                                    className="bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl shadow-warm-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            <span>Publishing Job...</span>
                                        </>
                                    ) : (
                                        <span>Publish Job Opening</span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostJob;