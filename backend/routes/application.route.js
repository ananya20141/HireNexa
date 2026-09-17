import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter, isCandidate } from "../middlewares/authorizeRoles.js";
import {
    applyJob,
    getApplicants,
    getAppliedJobs,
    updateStatus,
    withdrawApplication
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, isCandidate, applyJob);
router.route("/withdraw/:id").post(isAuthenticated, isCandidate, withdrawApplication);
router.route("/get").get(isAuthenticated, isCandidate, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, isRecruiter, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, isRecruiter, updateStatus);

export default router;

