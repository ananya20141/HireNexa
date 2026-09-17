import React from 'react';
import { Sparkles, Sprout } from 'lucide-react';

const MatchBadge = ({ score, matchLevel, size = "md", hasSufficientData = true, isFirstJobMode = false }) => {
    if (!hasSufficientData || score === undefined || score === null) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-bg text-text-secondary border border-surface-border">
                <Sparkles className="w-3 h-3 text-text-secondary/60" />
                <span>Add your skills or resume to get a match score</span>
            </div>
        );
    }

    let colorStyles = "bg-success/10 text-success border-success/30";
    let dotColor = "bg-success";

    if (score < 50) {
        colorStyles = "bg-bg text-text-secondary border-surface-border";
        dotColor = "bg-text-secondary/50";
    } else if (score < 75) {
        colorStyles = "bg-warning/10 text-warning border-warning/30";
        dotColor = "bg-warning";
    }

    const isSmall = size === "sm";

    return (
        <div className="inline-flex items-center gap-1.5">
            <div className={`inline-flex items-center gap-2 border rounded-xl font-bold transition-colors ${colorStyles} ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span>{score}% Match</span>
                <span className="text-xs font-normal opacity-85 hidden sm:inline">• {matchLevel}</span>
            </div>
            {isFirstJobMode && (
                <span className={`inline-flex items-center gap-1 rounded-xl bg-success/10 text-success border border-success/30 font-semibold ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}`} title="First Job Mode: Weighted for freshers & potential">
                    <Sprout className="w-3 h-3 text-success" />
                    <span>First Job</span>
                </span>
            )}
        </div>
    );
};

export default MatchBadge;
