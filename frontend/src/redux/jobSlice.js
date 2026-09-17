import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
    keyword: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    minSalary: "",
    maxSalary: "",
    category: "",
    sort: ""
};

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],
        searchedQuery: "",
        filters: initialFilters
    },
    reducers: {
        setAllJobs: (state, action) => {
            state.allJobs = action.payload || [];
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload || [];
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload || [];
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
            state.filters.keyword = action.payload;
        },
        setFilterCriteria: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            if (action.payload && action.payload.keyword !== undefined) {
                state.searchedQuery = action.payload.keyword;
            }
        },
        resetFilters: (state) => {
            state.filters = initialFilters;
            state.searchedQuery = "";
        }
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setFilterCriteria,
    resetFilters
} = jobSlice.actions;

export default jobSlice.reducer;