import { Router } from "express";
import MatchController from "../controller/Match";

const router = Router();

router.post("/", MatchController.createMatch);
router.get('/match', MatchController.getMatches);
router.get('/match/:id', MatchController.getMatchesByTeamId);
router.put("/:id", MatchController.updateMatch);
router.delete("/:id", MatchController.deleteMatch);


export default router;