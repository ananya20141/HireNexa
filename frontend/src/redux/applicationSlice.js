import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applicants: null,
    },
    reducers: {
        setAllApplicants: (state, action) => {
            state.applicants = action.payload;
        },
        updateApplicantStatus: (state, action) => {
            const { applicationId, status, interviewDate, assessmentDate, reminderNote } = action.payload;
            if (state.applicants && Array.isArray(state.applicants.applications)) {
                const app = state.applicants.applications.find(a => (a._id || a).toString() === applicationId.toString());
                if (app) {
                    app.status = status;
                    if (interviewDate !== undefined) app.interviewDate = interviewDate;
                    if (assessmentDate !== undefined) app.assessmentDate = assessmentDate;
                    if (reminderNote !== undefined) app.reminderNote = reminderNote;
                }
            }
        }
    }
});
export const { setAllApplicants, updateApplicantStatus } = applicationSlice.actions;
export default applicationSlice.reducer;