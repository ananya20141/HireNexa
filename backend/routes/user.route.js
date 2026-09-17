import express from "express";
import {
    login,
    logout,
    register,
    updateProfile,
    deleteResume,
    toggleSaveJob,
    getSavedJobs,
    getMe,
    toggleFirstJobMode,
    toggleRoadmapPhase,
    getRoadmapProgress
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isCandidate } from "../middlewares/authorizeRoles.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMe);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/resume/delete").delete(isAuthenticated, isCandidate, deleteResume);
router.route("/save-job/:id").post(isAuthenticated, isCandidate, toggleSaveJob);
router.route("/saved-jobs").get(isAuthenticated, isCandidate, getSavedJobs);
router.route("/first-job-mode").post(isAuthenticated, isCandidate, toggleFirstJobMode);
router.route("/roadmap/toggle-phase").post(isAuthenticated, isCandidate, toggleRoadmapPhase);
router.route("/roadmap/progress/:jobId").get(isAuthenticated, isCandidate, getRoadmapProgress);

export default router;

