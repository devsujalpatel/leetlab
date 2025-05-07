import { db } from "../libs/db.js";
import {
	getJudge0LanguageId,
	pollBatchResults,
	submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
	const {
		title,
		description,
		difficulty,
		tags,
		examples,
		constraints,
		testcases,
		codeSnippets,
		referenceSolutions,
	} = req.body;

	if (req.user.role !== "ADMIN") {
		return res.status(403).json({
			error: "You are not allowd to create a problem",
		});
	}
	try {
		for (const [language, solutionCode] of Object.entries(
			referenceSolutions,
		)) {
			const languageId = getJudge0LanguageId(language);
			if (!languageId) {
				return res.status(400).json({
					error: `Language ${language} is not supported`,
				});
			}

			const submissions = testcases.map(({ input, output }) => ({
				source_code: solutionCode,
				language_id: languageId,
				stdin: input,
				expected_output: output,
			}));

			const submissionResults = await submitBatch(submissions);

			const tokens = submissionResults.map((res) => res.token);

			const results = pollBatchResults(tokens);

			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				console.log("Result---", result);
				if (result.status.id !== 3) {
					return res.status(400).json({
						error: `Testcase ${i + 1} failed for language ${language}`,
					});
				}
			}
			const newProblem = await db.problem.create({
				data: {
					title,
					description,
					difficulty,
					tags,
					examples,
					constraints,
					testcases,
					codeSnippets,
					referenceSolutions,
					userId: req.user.id,
				},
			});
			return res.status(201).json({
				success: true,
				message: "Message Created Successfully",
				problem: newProblem,
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: "Error While Creating Problem",
		});
	}
};

export const getAllProblems = async (req, res) => {
	try {
		const problems = await db.problem.findMany();
		if (!problems) {
			return res.status(404).json({
				error: "No Problem Found",
			});
		}
		return res.status(200).json({
			success: true,
			message: "Problems Fetched Successfully",
			problems,
		});
	} catch (error) {
		console.log("Error while fetching problems", error);
		return res.status(500).json({
			error: "Error While Fetching Problems",
		});
	}
};

export const getProblemById = async (req, res) => {
	const { id } = req.params;
	try {
		const problem = await db.problem.findUnique({
			where: {
				id,
			},
		});
		if (!problem) {
			return res.status(404).json({ error: "Problem not found" });
		}
		return res.status(200).json({
			success: true,
			message: "Problem Fetched Successfully by Id",
			problem,
		});
	} catch (error) {
		console.log("Error while fetching problem by id", error);
		return res.status(500).json({
			error: "Error While Fetching Problem by id",
		});
	}
};

export const updateProblem = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			title,
			description,
			difficulty,
			tags,
			examples,
			constraints,
			testCases,
			codeSnippets,
			referenceSolutions,
		} = req.body;

		if (req.user.role !== "ADMIN") {
			return res
				.status(403)
				.json({ error: "Forbidden: Only admin can update problems" });
		}

		const problem = await db.problem.findUnique({
			where: {
				id,
			},
		});

		if (!problem) {
			return res.status(404).json({ error: "Problem not found" });
		}

		for (const [language, solutionCode] of Object.entries(
			referenceSolutions,
		)) {
			const languageId = getJudge0LanguageId(language);
			if (!languageId) {
				return res
					.status(400)
					.json({ error: `Unsupported language: ${language}` });
			}
			const submissions = testCases.map(({ input, output }) => ({
				source_code: solutionCode,
				language_id: languageId,
				stdin: input,
				expected_output: output,
			}));

			const submissionResults = await submitBatch(submissions);

			const tokens = submissionResults.map((res) => res.token);

			const results = await pollBatchResults(tokens);

			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				if (result.status.id !== 3) {
					return res.status(400).json({
						error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
						details: result,
					});
				}
			}
		}

		const updatedProblem = await db.problem.update({
			where: { id },
			data: {
			  title,
			  description,
			  difficulty,
			  tags,
			  examples,
			  constraints,
			  testCases,
			  codeSnippets,
			  referenceSolutions,
			},
		  });
	  
		  res.status(200).json({
			success: true,
			message: 'Problem updated successfully',
			problem: updatedProblem,
		  });

	} catch (error) {
		console.log("Error while Updating problem", error);
		return res.status(500).json({
			error: "Error while updating problem",
		});
	}
};

export const deleteProblem = async (req, res) => {
	const { id } = req.params;
	try {
		if (req.user.role !== "ADMIN") {
			return res.status(403).json({
				error: "You are not allowd to delete problem",
			});
		}
		const problem = await db.problem.findUnique({
			where: {
				id,
			},
		});
		if (!problem) {
			return res.status(404).json({ error: "Problem not found" });
		}

		await db.problem.delete({ where: { id } });
		return res
			.status(200)
			.json({ message: "Problem Deleted Successfully" });
	} catch (error) {}
	console.log(error);
	return res.status(500).json({
		error: "Error While Deleting the problem",
	});
};

export const getAllProblemSolvedByUser = async (req, res) => {};
