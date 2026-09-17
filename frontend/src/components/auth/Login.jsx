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
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2, User, Briefcase, ShieldCheck, Sparkles } from 'lucide-react';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "student",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || "Logged in successfully!");
                
                // Role-based redirect
                if (res.data.user.role === 'admin') {
                    navigate("/admin/dashboard");
                } else if (res.data.user.role === 'recruiter') {
                    navigate("/recruiter/dashboard");
                } else {
                    navigate("/jobs");
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error(error?.response?.data?.message || "Invalid credentials or role mismatch.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate("/admin/dashboard");
            else if (user.role === 'recruiter') navigate("/recruiter/dashboard");
            else navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-bg flex flex-col justify-between">
            <div>
                <Navbar />

                <div className="flex items-center justify-center max-w-md mx-auto my-12 px-4">
                    <form onSubmit={submitHandler} className="w-full bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-warm-md space-y-4">
                        <div className="text-center pb-2">
                            <h1 className="font-bold text-2xl text-text-primary">Welcome Back</h1>
                            <p className="text-xs text-text-secondary mt-1">
                                Sign in to access your personalized HireNexa portal.
                            </p>
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-text-primary">Email Address</Label>
                            <Input
                                type="email"
                                value={input.email}
                                name="email"
                                onChange={changeEventHandler}
                                placeholder="name@example.com"
                                className="text-xs mt-1"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-text-primary">Password</Label>
                            </div>
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

                        {/* Role selection tabs */}
                        <div>
                            <Label className="text-xs font-semibold text-text-primary block mb-2">Portal Access Role</Label>
                            <div className="grid grid-cols-3 gap-1.5">
                                <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
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

                                <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
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

                                <label className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                                    input.role === 'admin' 
                                        ? 'bg-warning/10 border-warning text-warning' 
                                        : 'border-surface-border text-text-secondary hover:bg-muted'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={input.role === 'admin'}
                                        onChange={changeEventHandler}
                                        className="sr-only"
                                    />
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Admin</span>
                                </label>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-xl shadow-warm-sm text-xs mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <span>Sign In to HireNexa</span>
                            )}
                        </Button>

                        <div className="text-center pt-2 text-xs text-text-secondary">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-accent hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;