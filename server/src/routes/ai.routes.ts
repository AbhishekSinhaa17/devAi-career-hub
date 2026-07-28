import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getDashboard, getGithubAnalysisCache, saveGithubAnalysis, getLeaderboard, upgradeToPro, generateJson } from "../controllers/ai.controller.js";
import { scoreResume, reviewCode, generateInterview, generateRoadmap, updateProfile } from "../controllers/ai.batch1.js";
import { analyzeJobMatch, getJobMatchesHistory, generateDeveloperScore, getDeveloperScoresHistory } from "../controllers/ai.batch2.js";
import { saveResume, getResumes, deleteResume, generateCoverLetter } from "../controllers/ai.batch3.js";
import { generateGithubResume, generateMockInterviewQuestions, evaluateMockInterview } from "../controllers/ai.batch4.js";
import { apiLimiterMinuteIp, apiLimiterDailyAuth } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(apiLimiterMinuteIp);
router.use(apiLimiterDailyAuth);

router.get("/dashboard", getDashboard);
router.get("/leaderboard", getLeaderboard);
router.post("/checkout/upgrade", upgradeToPro);
router.post("/generate-json", generateJson);
router.get("/github-analysis/cache/:username", getGithubAnalysisCache);
router.post("/github-analysis", saveGithubAnalysis);

// Batch 1
router.post("/resume/score", scoreResume);
router.post("/code-review", reviewCode);
router.post("/interview/generate", generateInterview);
router.post("/roadmap/generate", generateRoadmap);
router.post("/profile", updateProfile);

// Batch 2
router.post("/job-match", analyzeJobMatch);
router.get("/job-match", getJobMatchesHistory);
router.post("/developer-score", generateDeveloperScore);
router.get("/developer-score", getDeveloperScoresHistory);

// Batch 3
router.post("/resume", saveResume);
router.get("/resume", getResumes);
router.delete("/resume/:id", deleteResume);
router.post("/cover-letter", generateCoverLetter);

// Batch 4
router.post("/github-resume", generateGithubResume);
router.post("/mock-interview/questions", generateMockInterviewQuestions);
router.post("/mock-interview/evaluate", evaluateMockInterview);

export default router;
