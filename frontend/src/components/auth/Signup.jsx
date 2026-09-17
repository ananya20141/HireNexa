import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/authSlice';
import { Loader2, User, Briefcase } from 'lucide-react';

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "student",
        file: null
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] || null });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);

        // Profile photo is strictly optional
        if (input.file instanceof File) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message || "Account registered successfully!");
                navigate("/login");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            toast.error(error?.response?.data?.message || "Registration failed. Please check your inputs.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <div className="flex items-center justify-center max-w-md mx-auto my-12 px-4">
                    <form onSubmit={submitHandler} className="w-full bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-warm-md space-y-4">
                        <div className="text-center pb-2">
                            <h1 className="font-bold text-2xl text-text-primary">Create Your Account</h1>
                            <p className="text-xs text-text-secondary mt-1">
                                Join HireNexa to discover verified, personalized career matches.
                            </p>
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Full Name</Label>
                            <Input
                                type="text"
                                value={input.fullname}
                                name="fullname"
                                onChange={changeEventHandler}
                                placeholder="e.g. Jane Doe"
                                className="text-xs mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Email Address</Label>
                            <Input
                                type="email"
                                value={input.email}
                                name="email"
                                onChange={changeEventHandler}
                                placeholder="jane.doe@example.com"
                                className="text-xs mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Phone Number</Label>
                            <Input
                                type="text"
                                value={input.phoneNumber}
                                name="phoneNumber"
                                onChange={changeEventHandler}
                                placeholder="e.g. 9876543210"
                                className="text-xs mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Password</Label>
                            <Input
                                type="password"
                                value={input.password}
                                name="password"
                                onChange={changeEventHandler}
                                placeholder="••••••••"
                                className="text-xs mt-1"
                                required
                            />
                        </div>

                        {/* Role selection */}
                        <div>
                            <Label className="text-xs font-semibold text-text-primary block mb-2">Account Role</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                                    input.role === 'student' 
                                        ? 'bg-accent/10 border-accent text-accent' 
                                        : 'border-surface-border text-text-secondary hover:bg-muted'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        checked={input.role === 'student'}
                                        onChange={changeEventHandler}
                                        className="sr-only"
                                    />
                                    <User className="w-4 h-4" />
                                    <span>Candidate</span>
                                </label>

                                <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                                    input.role === 'recruiter' 
                                        ? 'bg-accent/10 border-accent text-accent' 
                                        : 'border-surface-border text-text-secondary hover:bg-muted'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="recruiter"
                                        checked={input.role === 'recruiter'}
                                        onChange={changeEventHandler}
                                        className="sr-only"
                                    />
                                    <Briefcase className="w-4 h-4" />
                                    <span>Recruiter</span>
                                </label>
                            </div>
                        </div>

                        {/* Profile photo optional upload */}
                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Profile Photo (Optional)</Label>
                            <Input
                                accept="image/*"
                                type="file"
                                onChange={changeFileHandler}
                                className="text-xs mt-1 cursor-pointer"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-xl shadow-warm-sm text-xs mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <span>Complete Sign Up</span>
                            )}
                        </Button>

                        <div className="text-center pt-2 text-xs text-text-secondary">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-accent hover:underline">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Signup;