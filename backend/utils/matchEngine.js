/**
 * HireNexa Deterministic Matching Engine
 * 
 * Computes a transparent, reproducible, weighted match score (0-100%) between
 * a candidate's profile/resume data and a job posting's requirements.
 * 
 * Scoring Weights:
 * - Skills Match: 50%
 * - Experience Level: 25%
 * - Education / Qualification: 10%
 * - Keyword & Context Relevance: 15%
 */

// Skill aliases & normalization map for semantic equivalence without AI hallucination
const SKILL_ALIASES = {
    'react': ['react', 'reactjs', 'react.js'],
    'node': ['node', 'nodejs', 'node.js'],
    'express': ['express', 'expressjs', 'express.js'],
    'mongo': ['mongo', 'mongodb'],
    'postgres': ['postgres', 'postgresql', 'psql'],
    'js': ['js', 'javascript'],
    'ts': ['ts', 'typescript'],
    'python': ['python', 'py'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3', 'tailwind', 'tailwindcss', 'bootstrap'],
    'aws': ['aws', 'amazon web services'],
    'gcp': ['gcp', 'google cloud'],
    'docker': ['docker', 'containerization'],
    'k8s': ['k8s', 'kubernetes'],
    'git': ['git', 'github', 'gitlab'],
    'next': ['next', 'nextjs', 'next.js'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'redux': ['redux', 'redux-toolkit', 'rtk']
};

/**
 * Normalizes text to lowercase alphanumeric tokens
 */
function cleanToken(str) {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().trim().replace(/[^\w\s.#+]/g, '');
}

/**
 * Checks if two skill terms match directly or through alias equivalence
 */
function isSkillMatch(candSkill, reqSkill) {
    const c = cleanToken(candSkill);
    const r = cleanToken(reqSkill);
    if (!c || !r) return false;
    if (c === r) return true;
    if (c.includes(r) || r.includes(c)) return true;

    // Check alias dictionary
    for (const [, aliases] of Object.entries(SKILL_ALIASES)) {
        const cInAlias = aliases.some(a => a === c || c.includes(a));
        const rInAlias = aliases.some(a => a === r || r.includes(a));
        if (cInAlias && rInAlias) return true;
    }
    return false;
}

/**
 * Calculate match percentage and breakdown
 * @param {Object} candidate - Candidate user or profile object
 * @param {Object} job - Job document
 * @returns {Object} { score, matchLevel, matchedSkills, missingSkills, details, hasSufficientData }
 */
export function calculateJobMatch(candidate, job) {
    if (!candidate || !job) {
        return {
            score: 0,
            matchLevel: 'Low Match',
            matchedSkills: [],
            missingSkills: Array.isArray(job?.requirements) ? job.requirements : [],
            details: { skillsScore: 0, expScore: 0, eduScore: 0, keywordScore: 0 },
            hasSufficientData: false,
            message: 'Incomplete candidate or job data'
        };
    }

    const candidateProfile = candidate.profile || candidate;
    const candidateSkills = Array.isArray(candidateProfile.skills) ? candidateProfile.skills : [];
    const candidateExp = Number(candidateProfile.experienceYears || candidateProfile.experienceLevel || 0);
    const candidateBio = (candidateProfile.bio || '').toLowerCase();
    const candidateEdu = Array.isArray(candidateProfile.education) ? candidateProfile.education : [];

    const jobRequirements = Array.isArray(job.requirements)
        ? job.requirements
        : typeof job.requirements === 'string'
            ? job.requirements.split(',').map(s => s.trim())
            : [];
    const jobExp = Number(job.experienceLevel || job.experience || 0);
    const jobTitle = (job.title || '').toLowerCase();
    const jobDesc = (job.description || '').toLowerCase();

    // Verify if candidate has provided sufficient information (at least 1 skill or resume)
    const hasSufficientData = candidateSkills.length > 0 || !!candidateProfile.resume;

    if (!hasSufficientData) {
        return {
            score: 0,
            matchLevel: 'Low Match',
            matchedSkills: [],
            missingSkills: jobRequirements,
            details: { skillsScore: 0, expScore: 0, eduScore: 0, keywordScore: 0 },
            hasSufficientData: false,
            message: 'Upload your resume or add your skills to unlock personalized job matching.'
        };
    }

    // Check if candidate has enabled First Job Mode
    const isFirstJobMode = Boolean(candidateProfile.firstJobMode);
    const candidateProjects = Array.isArray(candidateProfile.projects) ? candidateProfile.projects : [];
    const candidateCerts = Array.isArray(candidateProfile.certifications) ? candidateProfile.certifications : [];
    const hasGithub = Boolean(candidateProfile.githubUrl);

    // 1. Skills Match
    const matchedSkills = [];
    const missingSkills = [];

    jobRequirements.forEach(req => {
        const found = candidateSkills.some(candSkill => isSkillMatch(candSkill, req));
        if (found) {
            matchedSkills.push(req);
        } else {
            missingSkills.push(req);
        }
    });

    const totalReq = Math.max(jobRequirements.length, 1);
    const skillsRatio = matchedSkills.length / totalReq;

    let skillsScore = 0;
    let expScore = 0;
    let eduScore = 0;
    let projectScore = 0;
    let keywordScore = 0;
    let expStatus = 'Meets requirement';
    let eduStatus = 'No education details listed';

    if (isFirstJobMode) {
        // --- FIRST JOB MODE WEIGHTING ---
        // Skills: 50%
        skillsScore = Math.round(skillsRatio * 50);

        // Experience: 10% (Entry/Junior postings <= 2 yrs receive full credit)
        if (jobExp <= 2) {
            expScore = 10;
            expStatus = 'Credited via First Job Mode';
        } else if (candidateExp >= jobExp) {
            expScore = 10;
            expStatus = 'Meets requirement';
        } else {
            expScore = Math.round((candidateExp / jobExp) * 10);
            expStatus = `${jobExp - candidateExp} yrs professional gap`;
        }

        // Projects & Certifications (Portfolio potential): 20%
        let projPts = 0;
        if (candidateProjects.length >= 2) projPts += 10;
        else if (candidateProjects.length === 1) projPts += 6;

        if (candidateCerts.length > 0) projPts += 6;
        if (hasGithub) projPts += 4;
        projectScore = Math.min(20, projPts);

        // Education: 10%
        if (candidateEdu.length > 0) {
            const eduText = candidateEdu.map(e => `${e.degree || ''} ${e.institution || ''}`).join(' ').toLowerCase();
            const techDegrees = ['b.tech', 'm.tech', 'bca', 'mca', 'b.sc', 'm.sc', 'computer', 'engineering', 'science', 'diploma'];
            const hasTechEdu = techDegrees.some(deg => eduText.includes(deg) || candidateBio.includes(deg));
            eduScore = hasTechEdu ? 10 : 7;
            eduStatus = hasTechEdu ? 'Technical degree verified' : 'Education background verified';
        }

        // Keyword & Relevance: 10%
        let kwMatches = 0;
        const combinedCandidateText = `${candidateSkills.join(' ')} ${candidateBio}`.toLowerCase();
        const commonKeywords = [
            'frontend', 'backend', 'fullstack', 'full stack', 'developer', 'engineer',
            'api', 'rest', 'database', 'cloud', 'agile', 'ui', 'ux', 'responsive',
            'testing', 'deployment', 'git', 'performance', 'security'
        ];
        commonKeywords.forEach(kw => {
            if (jobDesc.includes(kw) && combinedCandidateText.includes(kw)) kwMatches++;
        });
        const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2);
        if (titleWords.some(w => combinedCandidateText.includes(w))) kwMatches += 2;
        keywordScore = Math.min(10, Math.round((kwMatches / 4) * 10));

    } else {
        // --- STANDARD DETERMINISTIC WEIGHTING ---
        // 1. Skills: 50%
        skillsScore = Math.round(skillsRatio * 50);

        // 2. Experience: 25%
        if (jobExp <= 0) {
            expScore = 25;
            expStatus = 'Entry level position';
        } else if (candidateExp >= jobExp) {
            expScore = 25;
            expStatus = 'Meets requirement';
        } else {
            expScore = Math.round((candidateExp / jobExp) * 25);
            expStatus = `${jobExp - candidateExp} yrs experience gap`;
        }

        // 3. Education: 10%
        if (candidateEdu.length > 0) {
            const eduText = candidateEdu.map(e => `${e.degree || ''} ${e.institution || ''}`).join(' ').toLowerCase();
            const techDegrees = ['b.tech', 'm.tech', 'bca', 'mca', 'b.sc', 'm.sc', 'computer', 'engineering', 'science', 'diploma'];
            const hasTechEdu = techDegrees.some(deg => eduText.includes(deg) || candidateBio.includes(deg));
            eduScore = hasTechEdu ? 10 : 7;
            eduStatus = hasTechEdu ? 'Technical degree verified' : 'Education background verified';
        }

        // 4. Keyword & Context: 15%
        let kwMatches = 0;
        const combinedCandidateText = `${candidateSkills.join(' ')} ${candidateBio}`.toLowerCase();
        const commonKeywords = [
            'frontend', 'backend', 'fullstack', 'full stack', 'developer', 'engineer',
            'api', 'rest', 'database', 'cloud', 'agile', 'ui', 'ux', 'responsive',
            'testing', 'deployment', 'git', 'performance', 'security'
        ];
        commonKeywords.forEach(kw => {
            if (jobDesc.includes(kw) && combinedCandidateText.includes(kw)) kwMatches++;
        });
        const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2);
        if (titleWords.some(w => combinedCandidateText.includes(w))) kwMatches += 2;
        keywordScore = Math.min(15, Math.round((kwMatches / 5) * 15));
    }

    // Normalize final score
    const rawTotal = skillsScore + expScore + eduScore + projectScore + keywordScore;
    const score = Math.min(100, Math.max(0, Math.round(rawTotal)));

    let matchLevel = 'Low Match';
    if (score >= 75) {
        matchLevel = 'Strong Match';
    } else if (score >= 50) {
        matchLevel = 'Moderate Match';
    }

    return {
        score,
        matchLevel,
        matchedSkills,
        missingSkills,
        skillsCount: jobRequirements.length,
        skillsMatchedCount: matchedSkills.length,
        skillsRatioLabel: `${matchedSkills.length}/${jobRequirements.length} matched`,
        expStatus,
        eduStatus,
        isFirstJobMode,
        modeExplanation: isFirstJobMode 
            ? "🌱 First Job Mode: Weights potential, hands-on projects, and skills over professional experience." 
            : null,
        details: {
            skillsScore,
            expScore,
            eduScore,
            projectScore,
            keywordScore,
            candidateExp,
            jobExp
        },
        hasSufficientData: true
    };
}
