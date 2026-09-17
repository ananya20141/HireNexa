import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminProtectedRoute = ({ children }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            toast.error("Administrator sign in required.");
            navigate("/login");
        } else if (user.role !== 'admin') {
            toast.error("Access forbidden: Administrator privileges required.");
            navigate("/");
        }
    }, [user, navigate]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
