import express from "express";
import * as counselorController from "../controllers/counselor.controller";

const router = express.Router();

/* COUNSELOR */
router.post("/counselors", counselorController.createProfile);
router.get("/counselors", counselorController.getAllCounselors);
router.get("/counselors/:id", counselorController.getCounselor);
router.patch("/counselors/:id", counselorController.updateProfile);

/* APPOINTMENTS */
router.post("/appointments", counselorController.createAppointment);
router.get("/appointments/user", counselorController.getUserAppointments);
router.get("/appointments/counselor", counselorController.getCounselorAppointments);
router.patch("/appointments/:id/cancel", counselorController.cancelAppointment);
router.patch("/appointments/:id/complete", counselorController.completeAppointment);

export default router;
