import { db } from "../libs/db.js";
import { getJudge0LanguageId } from "../libs/judge0.lib.js";

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
		refrenceSolution,
	} = req.body;

    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error: "You are not allowd to create a problem"
        })
    }

    try {
        for(const [language, solutionCode] of Object.entries(refrenceSolution)){
            const languageId = getJudge0LanguageId(language)
            if(!languageId){
                return res.status(400).json({
                    error: `Language ${language} is not supported`
                })
            }

            const submissions = testcases.map(({input, output}) => ({
                source_code : solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            const submissionResults = await submitBatch(submissions)

        }
    } catch (error) {
        
    }
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemSolvedByUser = async (req, res) => {};
