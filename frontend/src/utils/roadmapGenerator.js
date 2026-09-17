/**
 * HireNexa Skill Gap & Roadmap Generator
 * 
 * Generates personalized, deterministic learning progressions and project recommendations
 * based on the candidate's verified skills and the target job's missing prerequisites.
 */

// Domain curated skill metadata for practical roadmap generation
const SKILL_ROADMAP_KNOWLEDGE = {
    'node': {
        name: 'Node.js',
        stage1: ['Event Loop & Non-blocking I/O', 'CommonJS & ES Modules', 'Node Core APIs (fs, path, http)'],
        stage2: ['Express middleware & Routing', 'Authentication (JWT, bcrypt, cookies)', 'Error handling middleware'],
        stage3Project: 'RESTful API with Rate Limiting & Auth',
        stage4: ['Clustering & PM2', 'Security headers (Helmet) & CORS', 'Node.js profiling & stream optimization'],
        priority: 1
    },
    'express': {
        name: 'Express.js',
        stage1: ['Request/Response Lifecycle', 'Routing & Route Parameters', 'URL Encoding & JSON Parsers'],
        stage2: ['Custom Middleware Architecture', 'Async Handlers & Error Boundaries', 'Validation with Joi / Zod'],
        stage3Project: 'Modular Microservice Gateway',
        stage4: ['Express security best practices', 'API versioning strategies', 'Swagger/OpenAPI documentation'],
        priority: 1
    },
    'mongo': {
        name: 'MongoDB',
        stage1: ['Document Data Modeling vs Relational', 'CRUD Operations & BSON', 'Mongoose Schema Design'],
        stage2: ['Aggregation Pipelines ($match, $group, $lookup)', 'Indexing strategies (B-Tree, Compound)', 'Transactions & Session locks'],
        stage3Project: 'Analytics Aggregation Dashboard with MongoDB',
        stage4: ['Query optimization (explain())', 'MongoDB Atlas Replica Sets', 'Backup & disaster recovery'],
        priority: 2
    },
    'react': {
        name: 'React',
        stage1: ['Component Lifecycle & JSX', 'useState, useEffect, useRef', 'Props Drilling vs Composition'],
        stage2: ['Custom Hooks & Context API', 'State Management (Redux Toolkit or Zustand)', 'React Router 6 & Layouts'],
        stage3Project: 'Dynamic Dashboard with Real-time Filtering & Theme Switcher',
        stage4: ['React Profiler & re-render optimization (useMemo, useCallback)', 'Accessibility (a11y)', 'Unit testing with React Testing Library'],
        priority: 1
    },
    'docker': {
        name: 'Docker',
        stage1: ['Containers vs Virtual Machines', 'Basic Docker CLI (run, ps, stop, exec)', 'Dockerfile instructions (FROM, WORKDIR, COPY)'],
        stage2: ['Multi-stage Builds for production', 'Docker Compose for multi-container apps', 'Volumes & Bind Mounts'],
        stage3Project: 'Containerized Full-Stack App (Frontend + API + MongoDB) with docker-compose',
        stage4: ['Image size optimization (<100MB)', 'Non-root container security', 'Docker in CI/CD pipelines'],
        priority: 2
    },
    'aws': {
        name: 'AWS Cloud',
        stage1: ['Cloud Concepts (IaaS, PaaS, Regions, AZs)', 'IAM Roles, Users & Policies', 'AWS CLI configuration'],
        stage2: ['EC2 & S3 Object Storage', 'RDS & Managed Databases', 'API Gateway & Lambda Basics'],
        stage3Project: 'Serverless File Processing Pipeline with S3 & Lambda',
        stage4: ['VPC, Subnets & Security Groups', 'CloudWatch Logs & Metrics', 'Cost Optimization & Well-Architected Framework'],
        priority: 3
    },
    'git': {
        name: 'Git & Version Control',
        stage1: ['Commit hygiene & Git staging area', 'Branching workflows (feature branches)', 'Resolving merge conflicts'],
        stage2: ['Interactive Rebasing & Squashing', 'Git Cherry-pick & Stashing', 'Pull Request reviews & guidelines'],
        stage3Project: 'Open Source Contribution with clean rebased PR',
        stage4: ['GitHub Actions CI/CD workflows', 'Git bisect for debugging', 'Semantic versioning & releases'],
        priority: 1
    },
    'typescript': {
        name: 'TypeScript',
        stage1: ['Basic Types, Unions & Intersections', 'Interfaces vs Type Aliases', 'Function Typing & Optional Parameters'],
        stage2: ['Generics in React & Node APIs', 'Utility Types (Partial, Pick, Omit, Record)', 'Type Narrowing & Discriminated Unions'],
        stage3Project: 'End-to-End Type-Safe Fullstack App with Shared Types',
        stage4: ['Advanced Generics & Conditional Types', 'tsconfig.json tuning for strictness', 'Migrating JS codebase to TS'],
        priority: 2
    },
    'sql': {
        name: 'PostgreSQL / SQL',
        stage1: ['Relational schema design (1:1, 1:N, N:M)', 'DDL & DML (SELECT, JOIN, GROUP BY)', 'Foreign keys & constraints'],
        stage2: ['Indexes (B-Tree, GIN, Hash)', 'Transactions & ACID compliance', 'ORMs (Prisma or Sequelize)'],
        stage3Project: 'Transactional E-Commerce Inventory Database with ACID guarantees',
        stage4: ['Query execution plans (EXPLAIN ANALYZE)', 'Connection pooling with PgBouncer', 'Database migrations in CI'],
        priority: 2
    }
};

/**
 * Maps a skill string to standard knowledge key
 */
function findSkillKnowledge(skillStr) {
    const s = (skillStr || '').toLowerCase().trim();
    for (const [key, data] of Object.entries(SKILL_ROADMAP_KNOWLEDGE)) {
        if (s.includes(key) || key.includes(s) || (data.name && data.name.toLowerCase().includes(s))) {
            return data;
        }
    }
    return null;
}

/**
 * Generates recommended next skills and a 4-stage actionable roadmap
 */
export function generateSkillRoadmap(missingSkills = [], targetJob = null, candidateSkills = []) {
    const cleanMissing = missingSkills.map(s => String(s).trim()).filter(Boolean);
    const jobTitle = targetJob?.title || 'Target Role';

    // 1. Recommended Next Skills
    // Prioritize missing skills that match known foundational libraries first
    const prioritizedMissing = [...cleanMissing].sort((a, b) => {
        const kA = findSkillKnowledge(a);
        const kB = findSkillKnowledge(b);
        const prioA = kA ? kA.priority : 5;
        const prioB = kB ? kB.priority : 5;
        return prioA - prioB;
    });

    const recommendedNextSkills = prioritizedMissing.slice(0, 4);

    // If candidate has few or no missing skills, recommend industry companion skills
    if (recommendedNextSkills.length === 0) {
        recommendedNextSkills.push('TypeScript', 'Docker', 'System Design', 'CI/CD Pipelines');
    }

    // 2. Build 4-Stage Learning Roadmap
    const stage1Topics = [];
    const stage2Topics = [];
    const stage3ProjectIdeas = [];
    const stage4Topics = [];

    cleanMissing.forEach(skill => {
        const info = findSkillKnowledge(skill);
        if (info) {
            stage1Topics.push(...info.stage1);
            stage2Topics.push(...info.stage2);
            if (info.stage3Project) stage3ProjectIdeas.push(info.stage3Project);
            stage4Topics.push(...info.stage4);
        } else {
            stage1Topics.push(`${skill}: Core syntax, architecture & fundamentals`);
            stage2Topics.push(`${skill}: Hands-on configuration & practical integration`);
            stage3ProjectIdeas.push(`Integrate ${skill} into a production-grade full-stack project`);
            stage4Topics.push(`${skill}: Industry best practices, error handling & interview Q&As`);
        }
    });

    // Fallbacks if candidate already matches all requirements
    if (stage1Topics.length === 0) {
        stage1Topics.push('Advanced JavaScript / TypeScript concurrency & async patterns');
        stage1Topics.push('HTTP/2, WebSockets and REST vs GraphQL architectures');
    }
    if (stage2Topics.length === 0) {
        stage2Topics.push('Microservice boundaries & API design principles');
        stage2Topics.push('State management scaling and caching patterns (Redis)');
    }
    if (stage3ProjectIdeas.length === 0) {
        stage3ProjectIdeas.push(`Production-grade ${jobTitle} portfolio project with automated CI/CD and deployment`);
    }
    if (stage4Topics.length === 0) {
        stage4Topics.push('System design mock interviews: Scaling to 100k requests/min');
        stage4Topics.push('Behavioral STAR stories: Technical trade-offs and challenging bugs');
    }

    const stages = [
        {
            stageNumber: 1,
            title: "Core Fundamentals & Prerequisite Concepts",
            timeframe: "Week 1 – 2",
            badge: "Foundations",
            description: `Build rock-solid theoretical and syntactical understanding of ${recommendedNextSkills.slice(0, 2).join(' & ') || 'key prerequisites'}.`,
            topics: Array.from(new Set(stage1Topics)).slice(0, 4),
            milestone: "Complete foundational tutorials, documentation walkthroughs, and small syntax challenges."
        },
        {
            stageNumber: 2,
            title: "Tooling & Framework Architecture",
            timeframe: "Week 3 – 4",
            badge: "Practical Skills",
            description: "Transition from basic syntax to real-world integration, APIs, databases, and configuration.",
            topics: Array.from(new Set(stage2Topics)).slice(0, 4),
            milestone: "Write clean, modular code with environment variables, proper error handlers, and validation."
        },
        {
            stageNumber: 3,
            title: "Hands-on Portfolio Showcase Project",
            timeframe: "Week 5 – 6",
            badge: "Portfolio Milestone",
            description: `Build a resume-worthy project proving hands-on proficiency to recruiters at ${targetJob?.company?.name || 'top companies'}.`,
            topics: Array.from(new Set(stage3ProjectIdeas)).slice(0, 3),
            milestone: "Deploy the project live (Vercel/Render/Railway) with a documented GitHub README and architecture diagram."
        },
        {
            stageNumber: 4,
            title: "Production Hardening & Interview Prep",
            timeframe: "Week 7",
            badge: "Interview Readiness",
            description: `Master common technical questions, edge cases, and performance optimizations for ${jobTitle} roles.`,
            topics: Array.from(new Set(stage4Topics)).slice(0, 4),
            milestone: "Confidently explain technical decisions, trade-offs, and debug real-time coding assessments."
        }
    ];

    return {
        targetJobTitle: jobTitle,
        missingSkillsCount: cleanMissing.length,
        recommendedNextSkills,
        stages
    };
}
