const fs = require('fs');
let code = fs.readFileSync('src/lib/ai.functions.ts', 'utf8');

const replacements = {
  scoreResume: { path: '/ai/resume/score', method: 'post' },
  reviewCode: { path: '/ai/code-review', method: 'post' },
  generateInterview: { path: '/ai/interview/generate', method: 'post' },
  generateRoadmap: { path: '/ai/roadmap/generate', method: 'post' },
  updateProfile: { path: '/ai/profile', method: 'post' },
  analyzeJobMatch: { path: '/ai/job-match', method: 'post' },
  getJobMatchesHistory: { path: '/ai/job-match', method: 'get' },
  generateDeveloperScore: { path: '/ai/developer-score', method: 'post' },
  getDeveloperScoresHistory: { path: '/ai/developer-score', method: 'get' },
  saveResume: { path: '/ai/resume', method: 'post' },
  getResumes: { path: '/ai/resume', method: 'get' },
  deleteResume: { path: '/ai/resume', method: 'delete' },
  generateCoverLetter: { path: '/ai/cover-letter', method: 'post' },
  generateGithubResume: { path: '/ai/github-resume', method: 'post' },
  generateMockInterviewQuestions: { path: '/ai/mock-interview/questions', method: 'post' },
  evaluateMockInterview: { path: '/ai/mock-interview/evaluate', method: 'post' }
};

for (const [fnName, api] of Object.entries(replacements)) {
  const isGet = api.method === 'get';
  const isDelete = api.method === 'delete';
  const param = isDelete ? ' + "/" + data.id' : '';
  const body = isGet || isDelete ? '' : ', data';
  
  // Find start of .handler
  const startStr = 'export const ' + fnName + ' = createServerFn';
  const startIdx = code.indexOf(startStr);
  if (startIdx === -1) {
    console.log("NOT FOUND:", fnName);
    continue;
  }
  
  const handlerStr = '.handler(async ({ ';
  let handlerIdx = code.indexOf(handlerStr, startIdx);
  if (handlerIdx === -1 || handlerIdx > startIdx + 1000) {
    const handlerStr2 = '.handler(async ({ context }) => {';
    handlerIdx = code.indexOf(handlerStr2, startIdx);
    if (handlerIdx === -1 || handlerIdx > startIdx + 1000) {
      const handlerStr3 = '.handler(async ({ data, context }) => {';
      handlerIdx = code.indexOf(handlerStr3, startIdx);
    }
  }
  
  if (handlerIdx !== -1) {
    let braceCount = 0;
    let inBrace = false;
    let endIdx = -1;
    for (let i = handlerIdx; i < code.length; i++) {
      if (code[i] === '{') {
        braceCount++;
        inBrace = true;
      } else if (code[i] === '}') {
        braceCount--;
        if (inBrace && braceCount === 0) {
           if (code.substring(i+1, i+3) === ');') {
             endIdx = i + 3;
             break;
           }
        }
      }
    }
    if (endIdx !== -1) {
       const replacement = '.handler(async ({ data, context }: any) => {\n' +
         '    const { data: res } = await serverApiClient.' + api.method + '("' + api.path + '"' + param + body + ',\n      { headers: { Authorization: `Bearer ${context.token}` } }\n    );\n' +
         '    return res;\n  });';
         
       code = code.substring(0, handlerIdx) + replacement + code.substring(endIdx);
       console.log("REPLACED:", fnName);
    } else {
       console.log("FAILED to find end for:", fnName);
    }
  } else {
    console.log("FAILED to find handler for:", fnName);
  }
}

fs.writeFileSync('src/lib/ai.functions.ts', code);
console.log('Done!');
