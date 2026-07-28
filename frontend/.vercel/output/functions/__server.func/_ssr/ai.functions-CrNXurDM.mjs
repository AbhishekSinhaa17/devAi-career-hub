import { c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { o as objectType, s as stringType, a as arrayType, n as numberType, b as anyType, e as enumType } from "../_libs/zod.mjs";
objectType({
  score: numberType(),
  summary: stringType(),
  strengths: arrayType(stringType()),
  weaknesses: arrayType(stringType()),
  suggestions: arrayType(stringType())
});
const analyzeGithub = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  username: stringType().trim().min(1).max(40)
}).parse(d)).handler(createSsrRpc("47641c932ba217ef5fca5122e8bf3d43cf8d5df13656a5f8336615082312033d"));
objectType({
  score: numberType(),
  suggestions: arrayType(stringType()),
  missingSkills: arrayType(stringType())
});
const scoreResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resume: objectType({
    fullName: stringType().optional(),
    title: stringType().optional(),
    summary: stringType().optional(),
    email: stringType().optional(),
    phone: stringType().optional(),
    location: stringType().optional(),
    skills: arrayType(stringType()).default([]),
    experience: arrayType(objectType({
      role: stringType(),
      company: stringType(),
      period: stringType(),
      description: stringType()
    })).default([]),
    education: arrayType(objectType({
      school: stringType(),
      degree: stringType(),
      period: stringType()
    })).default([]),
    projects: arrayType(objectType({
      name: stringType(),
      description: stringType(),
      tech: stringType().optional()
    })).default([])
  })
}).parse(d)).handler(createSsrRpc("bffe9790aad4411c37d40c4c229a9c09f299a4b4c24ba3f3971c4b4f93e84d05"));
objectType({
  overall: stringType(),
  bugs: arrayType(stringType()),
  security: arrayType(stringType()),
  performance: arrayType(stringType()),
  cleanCode: arrayType(stringType()),
  bestPractices: arrayType(stringType())
});
const reviewCode = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  code: stringType().min(1, "Code cannot be empty.").max(8e3, "Code is too large. Maximum allowed size is 8,000 characters for optimal AI review."),
  language: stringType().default("javascript")
}).parse(d)).handler(createSsrRpc("7571c70091bf5a1254baaa71a5cb527ffca922f831e46074d1fe89f24a16119c"));
const generateInterview = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  role: stringType().min(1),
  category: stringType().min(1),
  difficulty: enumType(["easy", "medium", "hard"]).default("medium"),
  count: numberType().int().min(3).max(15).default(8)
}).parse(d)).handler(createSsrRpc("65aacc8bce50188e3837642f9feebe1923c698a3266c3dd91a004e3262e725b9"));
objectType({
  timeline: stringType(),
  phases: arrayType(objectType({
    title: stringType(),
    duration: stringType(),
    skills: arrayType(stringType()),
    projects: arrayType(stringType()),
    resources: arrayType(stringType())
  })),
  certifications: arrayType(stringType())
});
const generateRoadmap = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  path: stringType().min(1),
  level: stringType().default("beginner")
}).parse(d)).handler(createSsrRpc("b6facfec805a4d13e6faff31af888082ec42bbac733da5852134732c7b3f5fe6"));
const getDashboard = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("7fb8173ca1f57f5d2d8d576140c8db8c7928d04056d33643215c9e00700e52d3"));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  name: stringType().max(80).optional(),
  bio: stringType().max(500).optional(),
  github_username: stringType().max(40).optional(),
  experience_level: stringType().max(40).optional(),
  skills: arrayType(stringType().max(40)).max(40).optional()
}).parse(d)).handler(createSsrRpc("7f0927474030ec22be8d6debf00b369199198eb0d4da54f8fac7d5d2e043ea5b"));
objectType({
  atsScore: numberType(),
  hiringProbability: numberType(),
  interviewReadiness: numberType(),
  matchingSkills: arrayType(stringType()),
  missingSkills: arrayType(stringType()),
  strengths: arrayType(stringType()),
  weaknesses: arrayType(stringType()),
  suggestions: arrayType(stringType()),
  summary: stringType(),
  recommendedProjects: arrayType(stringType()),
  recommendedSkills: arrayType(stringType())
});
const analyzeJobMatch = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resumeText: stringType().min(10, "Resume text is too short.").max(8e3, "Resume text is too large. Maximum allowed size is 8,000 characters."),
  resumeFileName: stringType().min(1),
  jobDescription: stringType().min(10, "Job description is too short.").max(8e3, "Job description is too large. Maximum allowed size is 8,000 characters."),
  jobRole: stringType().min(1)
}).parse(d)).handler(createSsrRpc("4f719bf470fe4d6011b10c38f2570579acc81a57b3219af0194501b523a5ecd9"));
const getJobMatchesHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("ad63b59828c6aef86eefa13d68eeb14566c06101ad588a138eff6bdd3fba3926"));
objectType({
  overallScore: numberType(),
  strengths: arrayType(stringType()),
  weaknesses: arrayType(stringType()),
  recommendations: arrayType(stringType()),
  suggestedProjects: arrayType(stringType()),
  certifications: arrayType(stringType()),
  jobRoles: arrayType(stringType()),
  insights: objectType({
    why: stringType(),
    biggestStrength: stringType(),
    biggestWeakness: stringType(),
    fastestImprovement: stringType()
  })
});
const generateDeveloperScore = createServerFn({
  method: "POST"
}).middleware([requireAuth]).handler(createSsrRpc("495859b218ab78fa3c3519320283b9dfeba18687e8a9511ea8e79c1e02ca9aa8"));
const getDeveloperScoresHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("753cddb32a8cd2f2c2767a24698f0f1f657ed8796c449c8f678aa09f8ab5ba7e"));
const saveResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType().optional(),
  title: stringType().min(1),
  content: anyType(),
  score: numberType().default(0),
  ai_suggestions: arrayType(stringType()).default([])
}).parse(d)).handler(createSsrRpc("e52e8df4c791b71d29d58263130980b39ec6070b3db05a4c18578793e1d38fe1"));
const getResumes = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("0d4ffeeb06bc7ecbec8efd18f3ff8f0f57058121d7d6b711daa715741c4ff937"));
const deleteResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(createSsrRpc("9b30295beb640857d74cfad4b2372c0c660353324125cb88ef80fe8b5b7705f9"));
const generateCoverLetter = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resume: anyType(),
  jobRole: stringType().optional(),
  company: stringType().optional()
}).parse(d)).handler(createSsrRpc("63bee33169032bb1bcb61d61b987856ecbbf5347b46c6b8f0d635468eb359d30"));
objectType({
  developerType: stringType(),
  specialization: stringType(),
  experienceLevel: stringType(),
  professionalSummary: stringType(),
  skills: arrayType(stringType()),
  projects: arrayType(objectType({
    name: stringType(),
    description: stringType(),
    tech: stringType()
  })),
  achievements: arrayType(stringType()),
  githubHighlights: arrayType(stringType()),
  recommendedRoles: arrayType(stringType()),
  recommendedProjects: arrayType(stringType()),
  recommendedCertifications: arrayType(stringType()),
  missingSkills: arrayType(stringType()),
  atsScore: numberType(),
  completenessScore: numberType(),
  badges: arrayType(stringType())
});
const generateGithubResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  username: stringType().trim().min(1).max(40)
}).parse(d)).handler(createSsrRpc("369e6e0d19e450da6b751616ca828372c20a5d4d1aa7c72c701a3ccf373a4726"));
objectType({
  questions: arrayType(objectType({
    question: stringType(),
    expected_answer: stringType(),
    type: stringType()
  }))
});
const generateMockInterviewQuestions = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  jobRole: stringType(),
  experienceLevel: stringType(),
  interviewType: stringType()
}).parse(d)).handler(createSsrRpc("1e995ef5fdbeb1fd9d883bd50985a7696c614b5408af656c7d84d4f1d52bf46a"));
objectType({
  overallScore: numberType(),
  technicalScore: numberType(),
  communicationScore: numberType(),
  problemSolvingScore: numberType(),
  confidenceScore: numberType(),
  completenessScore: numberType(),
  strengths: arrayType(stringType()),
  weaknesses: arrayType(stringType()),
  improvements: arrayType(stringType()),
  recommendedTopics: arrayType(stringType()),
  nextSteps: arrayType(stringType()),
  evaluations: arrayType(objectType({
    feedback: stringType(),
    score: numberType()
  }))
});
const evaluateMockInterview = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  interviewId: stringType(),
  answers: arrayType(stringType())
}).parse(d)).handler(createSsrRpc("8f2d49c91462eca5aa690f6daf00d15a2502df60fca05cd738811f6cc33135d6"));
export {
  getDeveloperScoresHistory as a,
  generateDeveloperScore as b,
  analyzeGithub as c,
  generateGithubResume as d,
  generateCoverLetter as e,
  generateInterview as f,
  getDashboard as g,
  analyzeJobMatch as h,
  getJobMatchesHistory as i,
  generateMockInterviewQuestions as j,
  evaluateMockInterview as k,
  scoreResume as l,
  getResumes as m,
  deleteResume as n,
  generateRoadmap as o,
  reviewCode as r,
  saveResume as s,
  updateProfile as u
};
