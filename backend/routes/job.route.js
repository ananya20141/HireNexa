import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/authorizeRoles.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import {
    getAdminJobs,
    getAllJobs,
    getJobById,
    postJob,
    updateJob,
    toggleJobActive
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, isRecruiter, postJob);
router.route("/update/:id").put(isAuthenticated, isRecruiter, updateJob);
router.route("/toggle-active/:id").patch(isAuthenticated, isRecruiter, toggleJobActive);
router.route("/get").get(optionalAuth, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/get/:id").get(optionalAuth, getJobById);

export default router;
