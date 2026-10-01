import { Router } from "express";
import { getCapsules, getEmailPreview, postCapsule, removeCapsule } from "../controllers/capsules.controller";
import { asyncHandler } from "../middlewares/errorHandler";

export const capsulesRouter = Router();

capsulesRouter.get("/", asyncHandler(getCapsules));
capsulesRouter.post("/", postCapsule);
capsulesRouter.get("/email-preview", getEmailPreview);
capsulesRouter.delete("/:id", asyncHandler(removeCapsule));
