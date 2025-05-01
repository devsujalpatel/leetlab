import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
	createProblem,
	deleteProblem,
	getAllProblems,
	getAllProblemSolvedByUser,
	updateProblem,
} from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.post(
	"/create-problem",
	authMiddleware,
	checkAdmin,
	createProblem,
);
problemRoutes.get("/get-all-problems", authMiddleware, getAllProblems);
problemRoutes.get("/get-problem/:id", authMiddleware, createProblem);
problemRoutes.put(
	"/update-problem/:id",
	authMiddleware,
	checkAdmin,
	updateProblem,
);
problemRoutes.delete(
	"/delete-problem/:id",
	authMiddleware,
	checkAdmin,
	deleteProblem,
);
problemRoutes.get(
	"/get-solved-problems",
	authMiddleware,
	getAllProblemSolvedByUser,
);

export default problemRoutes;
