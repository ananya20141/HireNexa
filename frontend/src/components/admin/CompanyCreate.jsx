import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT, getCompanyInitials } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setSingleCompany } from '@/redux/companySlice';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Building2, Upload, X, Loader2 } from 'lucide-react';

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload an image file (PNG, JPG, JPEG, WebP, SVG).");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
            setLogoPreview(null);
        }
    };

    const registerNewCompany = async () => {
        if (!companyName || !companyName.trim()) {
            toast.error("Company name is required.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("companyName", companyName.trim());
            if (logoFile instanceof File) {
                formData.append("file", logoFile);
            }

            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (res?.data?.success) {
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message || "Company registered successfully.");
                const companyId = res?.data?.company?._id;
                navigate(`/recruiter/companies/${companyId}`);
            }
        } catch (error) {
            console.error("Register Company Error:", error);
            toast.error(error?.response?.data?.message || "Failed to register company.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />
                <div className='max-w-4xl mx-auto px-4 py-10'>
                    <div className="bg-surface p-8 rounded-2xl border border-surface-border shadow-warm-sm">
                        <div className='mb-6'>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
                                    <Building2 className="w-4 h-4" />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-accent">Register New Employer</span>
                            </div>
                            <h1 className='font-bold text-2xl text-text-primary'>Your Company Identity</h1>
                            <p className='text-xs text-text-secondary mt-1'>
                                Set up your hiring organization profile. You can customize details and requisitions anytime.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">
                                    Company Name <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={companyName}
                                    className="border-surface-border bg-bg text-text-primary rounded-xl text-xs"
                                    placeholder="e.g. Google, Microsoft, UrbanForm Architects..."
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Optional Company Logo with Preview */}
                            <div className="space-y-2 p-4 rounded-2xl bg-bg border border-surface-border">
                                <Label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                                    <span>Company Logo (Optional)</span>
                                    <span className="text-[10px] font-normal text-text-secondary">PNG, JPG, SVG, WebP up to 10MB</span>
                                </Label>

                                <div className="flex items-center gap-4 pt-1">
                                    {/* Preview Avatar */}
                                    <Avatar className="h-14 w-14 rounded-2xl border border-surface-border bg-surface shrink-0 shadow-warm-sm">
                                        {logoPreview ? (
                                            <AvatarImage src={logoPreview} alt="Logo preview" className="object-cover rounded-2xl" />
                                        ) : null}
                                        <AvatarFallback className="rounded-2xl bg-accent/10 text-accent font-black text-sm border border-accent/20">
                                            {getCompanyInitials(companyName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="logo-upload-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="text-xs cursor-pointer border-surface-border bg-surface text-text-primary rounded-xl file:text-xs file:font-semibold file:text-accent file:bg-accent/10 file:border-0 file:rounded-lg file:mr-2 file:py-1 file:px-2.5"
                                            />
                                            {logoFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveLogo}
                                                    className="text-xs text-danger hover:bg-danger/10 hover:text-danger rounded-xl px-2 shrink-0"
                                                    title="Remove uploaded logo"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    <span>Clear</span>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-secondary">
                                            {logoFile 
                                                ? `Selected: ${logoFile.name} (${Math.round(logoFile.size / 1024)} KB)` 
                                                : "If no logo is uploaded, a clean initials badge will be generated automatically."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-between pt-6 mt-6 border-t border-surface-border'>
                            <Button 
                                variant="outline" 
                                className="rounded-xl border-surface-border hover:bg-bg text-text-primary text-xs font-semibold" 
                                onClick={() => navigate("/recruiter/companies")}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-warm-sm flex items-center gap-1.5" 
                                onClick={registerNewCompany}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <span>Continue to Setup</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyCreate;