import { Router } from "express";
import { isAuth } from "../middleware/isAuth";
import { getSavedResources, toggleSavedResource } from "../controllers/resource.controller";

const router = Router();

router.get("/saved", isAuth, getSavedResources);
router.post("/saved/:resourceId", isAuth, toggleSavedResource);

export default router;
