import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { ArrowLeft, Loader2, Building2, Globe, MapPin, X, Upload } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import axios from 'axios';
import { COMPANY_API_END_POINT, getCompanyInitials } from '@/utils/constant';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import useGetCompanyById from '@/hooks/useGetCompanyById';

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const { singleCompany } = useSelector(store => store.company);
    const [loading, setLoading] = useState(false);
    const [newLogoPreview, setNewLogoPreview] = useState(null);
    const navigate = useNavigate();

    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file (PNG, JPG, SVG, WebP)");
                return;
            }
            setInput({ ...input, file });
            setNewLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveNewLogo = () => {
        setInput({ ...input, file: null });
        if (newLogoPreview) {
            URL.revokeObjectURL(newLogoPreview);
            setNewLogoPreview(null);
        }
        const fileInput = document.getElementById("company-logo-setup-input");
        if (fileInput) fileInput.value = "";
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        
        // Logo is strictly OPTIONAL
        if (input.file instanceof File) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message || "Company information updated.");
                navigate("/recruiter/companies");
            }
        } catch (error) {
            console.error("Update Company Error:", error);
            toast.error(error?.response?.data?.message || "Failed to update company.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (singleCompany) {
            setInput({
                name: singleCompany.name || "",
                description: singleCompany.description || "",
                website: singleCompany.website || "",
                location: singleCompany.location || "",
                file: null
            });
            setNewLogoPreview(null);
        }
    }, [singleCompany]);

    useEffect(() => {
        return () => {
            if (newLogoPreview) {
                URL.revokeObjectURL(newLogoPreview);
            }
        };
    }, [newLogoPreview]);

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />
                <div className="max-w-2xl mx-auto my-10 px-4">
                    <div className="bg-surface p-8 rounded-2xl border border-surface-border shadow-warm-sm">
                        <div className="flex items-center gap-4 pb-6 border-b border-surface-border mb-6">
                            <Button 
                                onClick={() => navigate("/recruiter/companies")} 
                                variant="outline" 
                                size="sm"
                                className="rounded-xl border-surface-border hover:bg-bg text-text-primary flex items-center gap-1.5 text-xs"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </Button>
                            <div>
                                <h1 className="font-bold text-xl text-text-primary">Company Information</h1>
                                <p className="text-xs text-text-secondary">Update company identity, logo, and location details.</p>
                            </div>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <Label className="text-xs font-semibold text-text-primary">Company Name</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={input.name}
                                    onChange={changeEventHandler}
                                    className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-text-primary">Description</Label>
                                <Input
                                    type="text"
                                    name="description"
                                    value={input.description}
                                    onChange={changeEventHandler}
                                    placeholder="Brief overview of company mission and products"
                                    className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Website URL</Label>
                                    <Input
                                        type="text"
                                        name="website"
                                        placeholder="https://example.com"
                                        value={input.website}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold text-text-primary">Location</Label>
                                    <Input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Bengaluru, India"
                                        value={input.location}
                                        onChange={changeEventHandler}
                                        className="text-xs mt-1 border-surface-border bg-bg text-text-primary rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Optional Company Logo with current preview & new file preview */}
                            <div className="space-y-2 p-4 rounded-2xl bg-bg border border-surface-border">
                                <Label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                                    <span>Company Logo (Optional)</span>
                                    <span className="text-[10px] font-normal text-text-secondary">PNG, JPG, SVG, WebP up to 10MB</span>
                                </Label>

                                <div className="flex items-center gap-4 pt-1">
                                    {/* Preview Avatar */}
                                    <Avatar className="h-14 w-14 rounded-2xl border border-surface-border bg-surface shrink-0 shadow-warm-sm">
                                        {newLogoPreview ? (
                                            <AvatarImage src={newLogoPreview} alt="New logo preview" className="object-cover rounded-2xl" />
                                        ) : singleCompany?.logo ? (
                                            <AvatarImage src={singleCompany.logo} alt={input.name || singleCompany.name} className="object-cover rounded-2xl" />
                                        ) : null}
                                        <AvatarFallback className="rounded-2xl bg-accent/10 text-accent font-black text-sm border border-accent/20">
                                            {getCompanyInitials(input.name || singleCompany?.name || "")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="company-logo-setup-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={changeFileHandler}
                                                className="text-xs cursor-pointer border-surface-border bg-surface text-text-primary rounded-xl file:text-xs file:font-semibold file:text-accent file:bg-accent/10 file:border-0 file:rounded-lg file:mr-2 file:py-1 file:px-2.5"
                                            />
                                            {input.file && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveNewLogo}
                                                    className="text-xs text-danger hover:bg-danger/10 hover:text-danger rounded-xl px-2 shrink-0"
                                                    title="Cancel replacement logo"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    <span>Cancel</span>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-secondary">
                                            {input.file ? (
                                                <span className="text-accent font-medium">
                                                    Ready to replace: {input.file.name} ({Math.round(input.file.size / 1024)} KB). Click Save to apply.
                                                </span>
                                            ) : singleCompany?.logo ? (
                                                <span className="text-success font-medium">
                                                    Current logo is active. Choose a new image file only if you wish to replace it.
                                                </span>
                                            ) : (
                                                "No logo currently uploaded. Choose an image file, or leave blank to continue using the initials fallback."
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-surface-border flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => navigate("/recruiter/companies")}
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
                                        <span>Save Company Details</span>
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

export default CompanySetup;