# HireNexa — Precision Job Portal & Resume Intelligence Platform

HireNexa is a full-stack job marketplace and recruitment intelligence platform built using the MERN stack (MongoDB, Express, React, Node.js). It bridges the gap between candidates and employers by replacing arbitrary keyword searches with a transparent, **Deterministic 4-Factor Resume–Job Match Engine**, an isolated **Admin Governance Console**, and end-to-end applicant tracking workflows.

Developed as a Web Development Capstone Project and professional portfolio showcase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Core Feature Suite](#core-feature-suite)
4. [Unique Resume–Job Match Engine](#unique-resumejob-match-engine)
5. [Candidate Workspace](#candidate-workspace)
6. [Recruiter / Employer Workspace](#recruiter--employer-workspace)
7. [Capstone Admin Panel & Moderation](#capstone-admin-panel--moderation)
8. [Technology Stack](#technology-stack)
9. [System Architecture](#system-architecture)
10. [Database Architecture & Schemas](#database-architecture--schemas)
11. [REST API Catalog](#rest-api-catalog)
12. [Security, Authentication & Authorization](#security-authentication--authorization)
13. [Environment Variables](#environment-variables)
14. [Local Setup Instructions](#local-setup-instructions)
15. [Production & Deployment Guide](#production--deployment-guide)
16. [Visual Interface Preview](#visual-interface-preview)
17. [Future Roadmap](#future-roadmap)

---

## 1. Project Overview

Modern job portals suffer from two extremes: opaque black-box algorithms that leave candidates in the dark, or naive keyword scrapers that flood recruiters with unqualified applicants.

**HireNexa** is engineered to deliver:
- **Transparent Compatibility**: A deterministic 0–100% match score with explicit "Why this matches" (matched skills, experience qualification) and "What you're missing" (skill gaps).
- **Three-Tier Role Architecture**: Strict separation between Candidates, Employers/Recruiters, and System Administrators.
- **Enterprise Governance**: Content moderation pipeline (Pending → Approved / Flagged / Rejected) ensuring platform listing integrity.
- **High-Performance UI**: Modern design system built on React, Tailwind CSS, Radix UI primitives, Lucide icons, and Redux Toolkit.

---

## 2. Problem Statement

1. **The Black-Box Dilemma**: Job seekers waste hours submitting applications without knowing whether their profile satisfies the employer's core requirements.
2. **Recruiter Fatigue**: Hiring managers spend 75% of screening time manually cross-referencing resumes against required technical stacks.
3. **Spam & Stale Listings**: Traditional starter portals lack moderation workflows; fraudulent or low-quality listings go unmoderated without administrative oversight.
4. **Data Isolation Vulnerabilities (IDOR)**: Many portals fail to check ownership when retrieving applicants or modifying corporate profiles.

HireNexa directly solves each of these challenges with role-guarded APIs, deterministic compatibility scoring, administrative moderation, and persistent bookmarking.

---

## 3. Core Feature Suite

- **Deterministic Resume–Job Match Engine**: Real-time 0–100% percentage score with tokenized skill and experience breakdown.
- **Dedicated Admin Console**: Real-time platform KPI analytics, job moderation queue, recruiter management, candidate inspection, and audit logging.
- **Candidate Hub**: Search with multi-dimensional filters, 1-click apply, application withdrawal, bookmarking/saved jobs, and resume replacement.
- **Employer Workspace**: Corporate registration, job lifecycle management (Active / Closed), and applicant pipeline tracking with candidate match scores.
- **Security Hardening**: HttpOnly cookie-based JWT authentication, header Bearer token support, role authorization, and IDOR ownership verification.

---

## 4. Unique Resume–Job Match Engine

HireNexa implements a transparent, weighted formula (0–100%) that evaluates candidate suitability against job requisitions without relying on nondeterministic generative models.

```
Total Match Score (0–100%) = Skills (50%) + Experience (25%) + Keywords (15%) + Education (10%)
```

### Weight Distribution & Mathematical Model

| Pillar | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Skills Match** | **50%** | Normalized token comparison between candidate profile skills and job required skills. Uses semantic alias mapping (e.g., `react` ↔ `reactjs`, `node` ↔ `nodejs`, `ts` ↔ `typescript`, `mongo` ↔ `mongodb`). Score = `(Matched Skills / Max(Job Skills, 1)) * 50`. |
| **Experience Seniority** | **25%** | Proportional evaluation comparing candidate years of experience (`experienceYears`) against job minimum requirement (`experienceLevel`). Full 25 points if candidate meets or exceeds requirement; scaled proportionally if lower; full credit for entry-level positions. |
| **Keyword & Context** | **15%** | Textual overlap analysis across candidate bio, resume summary, and job description (engineering verbs, cloud infrastructure, API architectures). |
| **Education & Credentials** | **10%** | Evaluation of candidate degree credentials (e.g., B.Tech, MCA, B.Sc, M.Sc Computer Science) against technical job prerequisites. |

### Match Levels & Candidate Feedback

- **75% – 100% (Strong Match)**: Highlighted in green with pulse indicator. Candidate possesses primary stack and seniority.
- **50% – 74% (Moderate Match)**: Highlighted in amber. Candidate possesses foundational skills with minor gaps.
- **0% – 49% (Low Match)**: Neutral/slate indicator. Clear actionable missing skills displayed to help candidate upskill.

### Visual Feedback Component
On each job card and job details view, the candidate sees:
- **✓ Matched Skills**: E.g., `✓ React`, `✓ JavaScript`, `✓ Node.js`, `✓ MongoDB`.
- **• Missing Requirements**: E.g., `• Docker`, `• AWS`.
- **Experience Alignment**: E.g., `You have 2 yrs · Job requires 2 yrs (Requirement Met)`.

---

## 5. Candidate Workspace

- **Intelligent Discovery**: Multi-faceted filter by Location (Bengaluru, Delhi NCR, Hyderabad, Pune, Mumbai, Remote), Job Type (Full Time, Part Time, Contract, Internship), Experience Level, and Salary Range (in LPA).
- **Personalized Sort**: Sort jobs by Most Recent, Highest Salary, Lowest Salary, or **Best Match %**.
- **Resume Hub**: Upload, view/download, replace, or delete resume documents (PDF / DOCX via Cloudinary memory streaming).
- **Persistent Bookmarks**: 1-click save/unsave jobs persisted in MongoDB with real-time UI synchronization.
- **Application Tracker**: Live visibility into recruitment stages:
  - `Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Hired / Accepted` (or `Rejected`).
- **Application Withdrawal**: Candidates can withdraw applications while in `applied` or `under_review` status.

---

## 6. Recruiter / Employer Workspace

- **Recruiter Overview**: Key metrics dashboard showing Active Jobs, Total Applicants, Shortlisted Candidates, Scheduled Interviews, and Hired Offers.
- **Company Management**: Register company entities, upload brand logos, specify website domains and office locations.
- **Job Authoring**: Post openings with structured skills, salary brackets, experience minimums, and vacancy counts.
- **Edit & Lifecycle Controls**: Update existing jobs, toggle openings between Active and Closed.
- **Applicant Evaluation**: Review candidates with contact info, direct resume download, and pre-calculated Resume–Job match score.
- **Status Progression**: Progress applicant status through recruitment stages with real-time candidate notifications.

---

## 7. Capstone Admin Panel & Moderation

A dedicated, isolated administrative console accessible exclusively to users with `role: 'admin'`.

- **KPI Analytics Dashboard**: Total registered users, candidate vs. recruiter split, total jobs, pending approvals, approved listings, flagged posts, and total applications.
- **Job Approval Workflow**: Recruiter-posted jobs start with status `pending` and become publicly discoverable only after administrative review and approval.
- **Listing Moderation**: Flag suspicious or invalid postings with moderation notes, unflag verified listings, or permanently delete spam.
- **Employer Oversight**: Inspect corporate profiles, view posted job history, and suspend/unblock recruiter accounts.
- **Candidate Governance**: View candidate metrics and manage account active/blocked status.
- **System Activity Audit Trail**: Immutable chronological feed of all system actions (registrations, postings, approvals, status transitions).

---

## 8. Technology Stack

### Frontend
- **Framework**: React 18 with Vite 5
- **State Management**: Redux Toolkit & Redux Persist
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v3 with Shadcn/UI Design Tokens
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Toasts**: Sonner
- **HTTP Client**: Axios with `withCredentials: true`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) stored in HTTP-Only Cookies & Bearer headers
- **Password Hashing**: Bcrypt.js (10 salt rounds)
- **File & Media Storage**: Multer (Memory Storage) + Cloudinary v2 SDK
- **Data Serialization**: DataURI Parser

---

## 9. System Architecture

```
                                +-----------------------------------+
                                |       HireNexa Web Client         |
                                |     (React 18 + Vite + Redux)     |
                                +-----------------+-----------------+
                                                  |
                                      HTTPS / REST APIs (JSON)
                                      HTTP-Only JWT Cookies
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |      Express.js API Server        |
                                |     (Node.js ESM + Routing)       |
                                +--------+--------+--------+--------+
                                         |        |        |
             +---------------------------+        |        +---------------------------+
             |                                    |                                    |
             v                                    v                                    v
+------------+------------+          +------------+------------+          +------------+------------+
|  Authentication Layer   |          | Deterministic Engine    |          |  Media Upload Pipeline  |
|  JWT + Role Guard (RBAC)|          | 4-Pillar Scoring        |          |  Multer Memory Stream   |
|  IDOR Ownership Check   |          | Synonym/Alias Mapping   |          |  Cloudinary Storage     |
+------------+------------+          +------------+------------+          +------------+------------+
             |                                    |                                    |
             +------------------------------------+------------------------------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |       MongoDB Database            |
                                |    (Users, Jobs, Apps, Audit)     |
                                +-----------------------------------+
```

---

## 10. Database Architecture & Schemas

### User Schema (`User`)
- `fullname`: String (required)
- `email`: String (unique, required)
- `phoneNumber`: Number (required)
- `password`: String (bcrypt hashed)
- `role`: Enum `['student', 'recruiter', 'admin']`
- `isBlocked`: Boolean (default: `false`)
- `savedJobs`: `[{ type: ObjectId, ref: 'Job' }]`
- `profile`:
  - `bio`: String
  - `skills`: `[String]` (normalized lowercase tokens)
  - `experienceYears`: Number
  - `education`: `[{ degree: String, institution: String, year: String }]`
  - `resume`: String (Cloudinary URL)
  - `resumeOriginalName`: String
  - `profilePhoto`: String (Cloudinary URL)
  - `company`: ObjectId (ref: `'Company'`)

### Job Schema (`Job`)
- `title`: String (required)
- `description`: String (required)
- `requirements`: `[String]` (required skills)
- `salary`: Number (in LPA)
- `experienceLevel`: Number (years required)
- `location`: String
- `jobType`: String
- `position`: Number (vacancies)
- `company`: ObjectId (ref: `'Company'`)
- `created_by`: ObjectId (ref: `'User'`)
- `applications`: `[{ type: ObjectId, ref: 'Application' }]`
- `status`: Enum `['pending', 'approved', 'rejected']` (default: `'pending'`)
- `isActive`: Boolean (default: `true`)
- `isFlagged`: Boolean (default: `false`)
- `flagReason`: String
- `category`: String

### Application Schema (`Application`)
- `job`: ObjectId (ref: `'Job'`, required)
- `applicant`: ObjectId (ref: `'User'`, required)
- `status`: Enum `['applied', 'pending', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'hired']`
- `withdrawn`: Boolean (default: `false`)

### Activity Log Schema (`Activity`)
- `user`: ObjectId (ref: `'User'`)
- `actionType`: Enum (`USER_REGISTERED`, `JOB_POSTED`, `JOB_APPROVED`, `APPLICATION_SUBMITTED`, etc.)
- `description`: String
- `metadata`: Mixed
- `createdAt`: Timestamp

---

## 11. REST API Catalog

### Authentication & Candidate Routes (`/api/v1/user`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new candidate or recruiter account. |
| `POST` | `/login` | Public | Authenticate user and issue JWT cookie. |
| `GET` | `/logout` | Public | Invalidate authentication cookie. |
| `GET` | `/me` | Authenticated | Retrieve authenticated user profile and saved jobs. |
| `POST` | `/profile/update` | Authenticated | Update user bio, skills, experience, education, resume. |
| `DELETE`| `/resume/delete` | Candidate | Remove uploaded resume document. |
| `POST` | `/save-job/:id` | Candidate | Toggle saving/unsaving a job. |
| `GET` | `/saved-jobs` | Candidate | Retrieve all bookmarked jobs. |

### Job Management Routes (`/api/v1/job`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/get` | Public / Optional Auth | Discover approved jobs with multi-criteria filters. |
| `GET` | `/get/:id` | Public / Optional Auth | Retrieve job details and personalized match score. |
| `POST` | `/post` | Recruiter / Admin | Create job posting (defaults to `pending` approval). |
| `PUT` | `/update/:id` | Recruiter (Owner) / Admin | Update existing job posting details. |
| `PATCH`| `/toggle-active/:id`| Recruiter (Owner) / Admin | Toggle job open/closed status. |
| `GET` | `/getadminjobs` | Recruiter / Admin | Retrieve all jobs created by authenticated recruiter. |

### Application Routes (`/api/v1/application`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/apply/:id` | Candidate | Submit application for an active, approved job. |
| `POST` | `/withdraw/:id`| Candidate (Applicant) | Withdraw application from review. |
| `GET` | `/get` | Candidate | Retrieve candidate's application history. |
| `GET` | `/:id/applicants`| Recruiter (Owner) / Admin | Retrieve applicants with Resume–Job match scores. |
| `POST` | `/status/:id/update` | Recruiter (Owner) / Admin | Progress candidate status (Shortlisted, Interview, Hired). |

### Company Routes (`/api/v1/company`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Recruiter / Admin | Register a new hiring company entity. |
| `GET` | `/get` | Recruiter / Admin | List companies owned by recruiter. |
| `GET` | `/get/:id` | Authenticated | Retrieve company details by ID. |
| `PUT` | `/update/:id` | Recruiter (Owner) / Admin | Update company name, description, website, and logo. |

### Admin Governance Routes (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin Only | Platform KPI metrics and job status breakdown. |
| `GET` | `/jobs` | Admin Only | List all platform jobs with moderation filters. |
| `PUT` | `/jobs/:id/status`| Admin Only | Approve or reject a job posting. |
| `PUT` | `/jobs/:id/flag` | Admin Only | Flag or unflag a listing with moderation note. |
| `DELETE`| `/jobs/:id` | Admin Only | Permanently delete inappropriate listing. |
| `GET` | `/recruiters` | Admin Only | List registered employers with company & job counts. |
| `GET` | `/candidates` | Admin Only | List registered candidates with credentials audit. |
| `PUT` | `/users/:id/toggle-block` | Admin Only | Suspend or restore user account access. |
| `GET` | `/activity` | Admin Only | Retrieve platform audit trail feed. |

---

## 12. Security, Authentication & Authorization

1. **Role-Based Access Control (RBAC)**: Enforced through backend middlewares (`authorizeRoles('admin')`, `isRecruiter`, `isCandidate`). Frontend routes use `ProtectedRoute` and `AdminProtectedRoute`.
2. **Insecure Direct Object Reference (IDOR) Prevention**:
   - Recruiters can only modify companies and jobs they created (`created_by.toString() === req.id`).
   - Recruiters can only access applicants for their own jobs.
   - Candidates can only withdraw or inspect their own applications.
3. **Session Integrity**: Tokens are signed with HMAC-SHA256 (`process.env.SECRET_KEY`) and stored in HTTP-Only cookies with `sameSite: 'lax'`.
4. **Account Suspension**: The `isBlocked` flag is verified on both login and every authenticated request. Suspended users receive `403 Forbidden`.
5. **Safe File Handling**: Multer enforces memory storage with strict 10MB limits, preventing disk-exhaustion vulnerabilities.
6. **No Unhandled Rejections**: Every controller implements try/catch blocks returning standardized JSON error payloads.

---

## 13. Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your_database_name?retryWrites=true&w=majority
SECRET_KEY=your_super_secret_jwt_signing_key_32_chars_long
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 14. Local Setup Instructions

### Prerequisites
- Node.js (v18 or v20 recommended)
- MongoDB Database (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (Free tier sufficient for images/resumes)

### Step 1: Clone and Navigate
```bash
git clone https://github.com/ananya20141/HireNexa.git HireNexa
cd HireNexa
```

### Step 2: Backend Setup
```bash
cd backend
npm install
# Create .env based on .env.example with your database and Cloudinary keys
cp .env.example .env
npm run dev
```
Backend will start on `http://localhost:3000`.

### Step 3: Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install
# Verify .env
npm run dev
```
Frontend will launch on `http://localhost:5173`.

---

## 15. Production & Deployment Guide

### Production Build
```bash
# In frontend directory:
npm run build
```
Generates optimized static assets in `frontend/dist/`.

### Deployment Checklist
1. **Backend**: Deploy to Render, Railway, AWS EC2, or Heroku.
   - Set environment variables in the host dashboard.
   - Ensure `CORS_ORIGIN` matches your deployed frontend URL.
2. **Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages.
   - Set `VITE_API_BASE_URL` to your production backend URL (e.g. `https://hirenexa-backend.onrender.com`).
3. **Database**: Use MongoDB Atlas with IP Whitelisting enabled (`0.0.0.0/0` for cloud PaaS).
4. **Cookies in Production**: Ensure `NODE_ENV=production` so cookies set `secure: true` over HTTPS.

---

## 16. Visual Interface Preview

- **Homepage Hero**: Modern dual-input search with real-time platform statistics.
- **Job Discovery (`/jobs`)**: Responsive sidebar with multi-faceted filtering by location, experience, salary LPA, and domain.
- **Match Breakdown Component**: Collapsible card detailing matched skills (`✓ React`, `✓ Node.js`) and missing gaps (`• Docker`).
- **Recruiter Workspace (`/recruiter/dashboard`)**: Key hiring metrics and candidate review table.
- **Admin Console (`/admin/dashboard`)**: System KPI cards, job approval workflow, and moderation tools.

---

## 17. Future Roadmap

1. **Embedding-Based Semantic Matching**: Upgrade deterministic keyword parser to vector embeddings (e.g., pgvector / Pinecone) without altering the UI contract.
2. **Direct Recruiter Messaging**: Real-time WebSockets/Socket.io messaging between shortlisted candidates and hiring managers.
3. **Automated Assessment Quizzes**: Pre-screening technical quizzes tied to job skill requirements.
4. **Calendar & Interview Booking**: Integration with Google Calendar and Calendly API for automatic interview scheduling.

---

## License

This project is licensed under the ISC License. Developed for academic submission and portfolio presentation.
