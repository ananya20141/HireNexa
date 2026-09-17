const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const API_V1_URL = `${API_BASE_URL}/api/v1`;

export const USER_API_END_POINT = `${API_V1_URL}/user`;
export const JOB_API_END_POINT = `${API_V1_URL}/job`;
export const APPLICATION_API_END_POINT = `${API_V1_URL}/application`;
export const COMPANY_API_END_POINT = `${API_V1_URL}/company`;
export const ADMIN_API_END_POINT = `${API_V1_URL}/admin`;

/**
 * Generates dynamic company initials fallback from company name.
 * Examples:
 * - "google" -> "G"
 * - "UrbanForm Architects" -> "UA"
 * - "DesignHaus Studio" -> "DS"
 * - "NovaTech Solutions" -> "NS"
 */
export const getCompanyInitials = (name) => {
    if (!name || typeof name !== 'string') return "CO";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "CO";
    if (words.length === 1) {
        return words[0].slice(0, 1).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
};

