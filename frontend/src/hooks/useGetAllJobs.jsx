import { setAllJobs } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { filters, searchedQuery } = useSelector(store => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const params = new URLSearchParams();
                const keyword = filters?.keyword !== undefined && filters.keyword !== "" ? filters.keyword : (searchedQuery || "");
                if (keyword) params.append("keyword", keyword);
                if (filters?.location && filters.location !== "All") params.append("location", filters.location);
                if (filters?.jobType && filters.jobType !== "All") params.append("jobType", filters.jobType);
                if (filters?.experienceLevel !== undefined && filters.experienceLevel !== "") params.append("experienceLevel", filters.experienceLevel);
                if (filters?.minSalary) params.append("minSalary", filters.minSalary);
                if (filters?.maxSalary) params.append("maxSalary", filters.maxSalary);
                if (filters?.category && filters.category !== "All") params.append("category", filters.category);
                if (filters?.sort) params.append("sort", filters.sort);

                const queryString = params.toString();
                const url = `${JOB_API_END_POINT}/get${queryString ? `?${queryString}` : ''}`;

                const res = await axios.get(url, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.error("useGetAllJobs Error:", error?.message || error);
            }
        };

        fetchAllJobs();
    }, [
        searchedQuery, 
        filters?.keyword,
        filters?.location, 
        filters?.jobType, 
        filters?.experienceLevel, 
        filters?.minSalary, 
        filters?.maxSalary, 
        filters?.category, 
        filters?.sort, 
        dispatch
    ]);
};


export default useGetAllJobs;