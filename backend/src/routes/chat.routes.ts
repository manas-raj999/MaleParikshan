import { Router } from "express";
import { chat, getChatHistory } from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, chat);
router.get("/history", authenticate, getChatHistory);

export default router;
