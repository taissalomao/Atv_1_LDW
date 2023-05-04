import { Router } from "express";
import TeamController from "../controller/Team";

const router = Router();

router.post("/", TeamController.create);
router.get("/", TeamController.list);
router.get("/:name", TeamController.listByName);
router.put("/:id", TeamController.updateTeam);
router.delete("/:id", TeamController.deleteTeam);

export default router;