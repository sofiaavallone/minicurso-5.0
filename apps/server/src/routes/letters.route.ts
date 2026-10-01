import { Router } from "express";
import { getLetter, getLetters, postLetter, putLetter, removeLetter } from "../controllers/letters.controller";
import { asyncHandler } from "../middlewares/errorHandler";

export const lettersRouter = Router();

lettersRouter.get("/", asyncHandler(getLetters));
lettersRouter.get("/:id", asyncHandler(getLetter));
lettersRouter.post("/", asyncHandler(postLetter));
lettersRouter.put("/:id", asyncHandler(putLetter));
lettersRouter.delete("/:id", asyncHandler(removeLetter));
