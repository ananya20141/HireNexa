import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CandidateProtectedRoute = ({ children }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user || user.role !== 'student') {
        return null;
    }

    return children;
};

export default CandidateProtectedRoute;
