import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterCriteria, resetFilters } from '@/redux/jobSlice';
import { Button } from './ui/button';
import { RotateCcw, SlidersHorizontal, MapPin, Briefcase, Clock, IndianRupee, Layers } from 'lucide-react';

const filterGroups = [
    {
        id: "location",
        title: "Location",
        icon: MapPin,
        options: [
            { label: "All Locations", value: "" },
            { label: "Bengaluru", value: "Bengaluru" },
            { label: "Delhi NCR", value: "Delhi NCR" },
            { label: "Hyderabad", value: "Hyderabad" },
            { label: "Pune", value: "Pune" },
            { label: "Mumbai", value: "Mumbai" },
            { label: "Remote", value: "Remote" }
        ]
    },
    {
        id: "jobType",
        title: "Job Type",
        icon: Briefcase,
        options: [
            { label: "All Types", value: "" },
            { label: "Full Time", value: "Full Time" },
            { label: "Part Time", value: "Part Time" },
            { label: "Internship", value: "Internship" },
            { label: "Contract", value: "Contract" }
        ]
    },
    {
        id: "experienceLevel",
        title: "Experience",
        icon: Clock,
        options: [
            { label: "Any Experience", value: "" },
            { label: "Fresher / Entry (0-1 yrs)", value: "0" },
            { label: "Junior (1-3 yrs)", value: "3" },
            { label: "Mid Level (3-5 yrs)", value: "5" },
            { label: "Senior (5+ yrs)", value: "6" }
        ]
    },
    {
        id: "salaryRange",
        title: "Salary Range",
        icon: IndianRupee,
        options: [
            { label: "All Salaries", min: "", max: "" },
            { label: "0 – 6 LPA", min: "0", max: "6" },
            { label: "6 – 12 LPA", min: "6", max: "12" },
            { label: "12 – 25 LPA", min: "12", max: "25" },
            { label: "25+ LPA", min: "25", max: "" }
        ]
    },
    {
        id: "category",
        title: "Domain / Category",
        icon: Layers,
        options: [
            { label: "All Categories", value: "" },
            { label: "Frontend", value: "Frontend" },
            { label: "Backend", value: "Backend" },
            { label: "FullStack", value: "FullStack" },
            { label: "Mobile Dev", value: "Mobile" },
            { label: "DevOps / Cloud", value: "DevOps" },
            { label: "Data Science", value: "Data" }
        ]
    }
];

const FilterCard = () => {
    const dispatch = useDispatch();
    const { filters } = useSelector(store => store.job);

    const handleSelectChange = (groupKey, value) => {
        const currentVal = filters?.[groupKey] || "";
        const nextVal = currentVal === value ? "" : value;
        dispatch(setFilterCriteria({ [groupKey]: nextVal }));
    };

    const handleSalaryChange = (min, max) => {
        const currentMin = filters?.minSalary || "";
        const currentMax = filters?.maxSalary || "";
        if (currentMin === min && currentMax === max) {
            dispatch(setFilterCriteria({ minSalary: "", maxSalary: "" }));
        } else {
            dispatch(setFilterCriteria({ minSalary: min, maxSalary: max }));
        }
    };

    const handleClear = () => {
        dispatch(resetFilters());
    };

    const isSalarySelected = (min, max) => {
        return (filters?.minSalary || "") === min && (filters?.maxSalary || "") === max;
    };

    return (
        <div className="w-full bg-surface p-5 rounded-2xl border border-surface-border shadow-warm-sm space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    <h2 className="font-bold text-sm text-text-primary uppercase tracking-wide">Filter Openings</h2>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClear}
                    className="h-8 px-2 text-xs text-text-secondary hover:text-accent hover:bg-muted flex items-center gap-1 font-semibold rounded-xl"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                </Button>
            </div>

            {/* Filter Groups */}
            <div className="space-y-5">
                {filterGroups.map((group) => {
                    const IconComponent = group.icon;
                    return (
                        <div key={group.id} className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                                <IconComponent className="w-3.5 h-3.5 text-text-secondary/60" />
                                <span>{group.title}</span>
                            </div>

                            <div className="space-y-1 pl-1">
                                {group.id === "salaryRange" ? (
                                    group.options.map((opt, idx) => {
                                        const checked = isSalarySelected(opt.min, opt.max);
                                        return (
                                            <div 
                                                key={idx}
                                                onClick={() => handleSalaryChange(opt.min, opt.max)}
                                                className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors ${
                                                    checked 
                                                        ? 'bg-accent/10 text-accent font-bold border border-accent/20' 
                                                        : 'text-text-secondary hover:bg-muted border border-transparent'
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="salaryFilter"
                                                    checked={checked}
                                                    onChange={() => {}}
                                                    className="w-3.5 h-3.5 accent-[var(--color-accent)] cursor-pointer"
                                                />
                                                <span>{opt.label}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    group.options.map((opt, idx) => {
                                        const checked = (filters?.[group.id] || "") === opt.value;
                                        return (
                                            <div 
                                                key={idx}
                                                onClick={() => handleSelectChange(group.id, opt.value)}
                                                className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors ${
                                                    checked 
                                                        ? 'bg-accent/10 text-accent font-bold border border-accent/20' 
                                                        : 'text-text-secondary hover:bg-muted border border-transparent'
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={group.id}
                                                    checked={checked}
                                                    onChange={() => {}}
                                                    className="w-3.5 h-3.5 accent-[var(--color-accent)] cursor-pointer"
                                                />
                                                <span>{opt.label}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterCard;