import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

const EditJob = () => {
    const params = useParams();
    const jobId = params.id;
    const navigate = useNavigate();

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        position: 1,
        category: "",
        isActive: true
    });
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                setFetching(true);
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });

                if (res.data.success && res.data.job) {
                    const job = res.data.job;
                    setInput({
                        title: job.title || "",
                        description: job.description || "",
                        requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : "",
                        salary: job.salary || "",
                        location: job.location || "",
                        jobType: job.jobType || "",
                        experienceLevel: job.experienceLevel !== undefined ? job.experienceLevel : "",
                        position: job.position || 1,
                        category: job.category || "Engineering",
                        isActive: job.isActive !== undefined ? job.isActive : true
                    });
                }
            } catch (error) {
                console.error("Fetch Job For Edit Error:", error);
                toast.error(error?.response?.data?.message || "Failed to load job details.");
            } finally {
                setFetching(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const changeEventHandler = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setInput({ ...input, [e.target.name]: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.put(`${JOB_API_END_POINT}/update/${jobId}`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message || "Job updated successfully.");
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            console.error("Update Job Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update job.");
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
                                <h1 className="font-bold text-xl text-text-primary">Edit Job Listing</h1>
                                <p className="text-xs text-text-secondary">Modify requirements, compensation, and opening status.</p>
                            </div>
                        </div>

                        {fetching ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
                                <p className="text-xs text-text-secondary">Loading job data...</p>
                            </div>
                        ) : (
                            <form onSubmit={submitHandler} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-text-primary">Job Title</Label>
                                        <Input
                                            type="text"
                                            name="title"
                                            value={input.title}
                                            onChange={changeEventHandler}
                                            className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-text-primary">Category</Label>
                                        <Input
                                            type="text"
                                            name="category"
                                            value={input.category}
                                            onChange={changeEventHandler}
                                            className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Description</Label>
                                    <textarea
                                        name="description"
                                        rows={4}
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
                                        value={input.requirements}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-text-primary">Salary (LPA)</Label>
                                        <Input
                                            type="number"
                                            name="salary"
                                            value={input.salary}
                                            onChange={changeEventHandler}
                                            className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-text-primary">Experience (Yrs)</Label>
                                        <Input
                                            type="number"
                                            name="experienceLevel"
                                            min="0"
                                            value={input.experienceLevel}
                                            onChange={changeEventHandler}
                                            className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold text-text-primary">Open Positions</Label>
                                        <Input
                                            type="number"
                                            name="position"
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
                                            value={input.jobType}
                                            onChange={changeEventHandler}
                                            className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl focus-visible:ring-accent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={input.isActive}
                                        onChange={changeEventHandler}
                                        className="w-4 h-4 rounded text-accent accent-[#C1592F] cursor-pointer"
                                    />
                                    <Label htmlFor="isActive" className="text-xs font-semibold text-text-primary cursor-pointer">
                                        Job Listing is Active & Accepting Applications
                                    </Label>
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
                                        disabled={loading}
                                        className="bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl shadow-warm-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            <span>Update Job</span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditJob;
