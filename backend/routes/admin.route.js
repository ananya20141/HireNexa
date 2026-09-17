import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/authorizeRoles.js";
import {
    getAdminStats,
    getAllJobsForAdmin,
    updateJobStatus,
    flagJob,
    deleteJobByAdmin,
    getRecruiters,
    getCandidates,
    toggleUserBlock,
    getActivityFeed,
    getAllApplicationsForAdmin
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

router.route("/stats").get(getAdminStats);
router.route("/jobs").get(getAllJobsForAdmin);
router.route("/jobs/:id/status").put(updateJobStatus);
router.route("/jobs/:id/flag").put(flagJob);
router.route("/jobs/:id").delete(deleteJobByAdmin);
router.route("/recruiters").get(getRecruiters);
router.route("/candidates").get(getCandidates);
router.route("/applications").get(getAllApplicationsForAdmin);
router.route("/users/:id/toggle-block").put(toggleUserBlock);
router.route("/activity").get(getActivityFeed);

export default router;
