import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
        savedJobs: []
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            if (action.payload && action.payload.savedJobs) {
                state.savedJobs = action.payload.savedJobs;
            } else if (!action.payload) {
                state.savedJobs = [];
            }
        },
        setSavedJobs: (state, action) => {
            state.savedJobs = action.payload || [];
        },
        logout: (state) => {
            state.user = null;
            state.savedJobs = [];
            state.loading = false;
        },
        toggleSavedJobInState: (state, action) => {
            const jobId = action.payload;
            if (!state.savedJobs) state.savedJobs = [];
            const exists = state.savedJobs.some(id => (id._id || id).toString() === jobId.toString());
            if (exists) {
                state.savedJobs = state.savedJobs.filter(id => (id._id || id).toString() !== jobId.toString());
            } else {
                state.savedJobs.push(jobId);
            }
        },
        updateRoadmapProgressInState: (state, action) => {
            const { jobId, completedPhases } = action.payload;
            if (!state.user) return;
            if (!state.user.profile) state.user.profile = {};
            if (!Array.isArray(state.user.profile.roadmapProgress)) {
                state.user.profile.roadmapProgress = [];
            }
            let jobEntry = state.user.profile.roadmapProgress.find(
                p => (p.jobId?._id || p.jobId)?.toString() === jobId.toString()
            );
            if (!jobEntry) {
                state.user.profile.roadmapProgress.push({
                    jobId,
                    completedPhases
                });
            } else {
                jobEntry.completedPhases = completedPhases;
            }
        }
    }
});

export const { 
    setLoading, 
    setUser, 
    setSavedJobs, 
    logout, 
    toggleSavedJobInState,
    updateRoadmapProgressInState 
} = authSlice.actions;
export default authSlice.reducer;