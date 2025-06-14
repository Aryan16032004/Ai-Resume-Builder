import axios from "axios";

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

async function executeCode({ code, language, testCases = [] }) {
  if (!testCases || testCases.length === 0) {
    return {
      totalTests: 0,
      passedTests: 0,
      results: [],
      error: "No test cases provided"
    };
  }

  const languageId = getLanguageId(language);
  
  try {
    const submissions = testCases.map(testCase => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output
    }));
    
    const options = {
      method: 'POST',
      url: `${JUDGE0_API}/submissions/batch`,
      params: { base64_encoded: 'false' },
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      data: { submissions }
    };
    
    const response = await axios.request(options);
    const tokens = response.data.map(sub => sub.token);
    
    // Wait for results with timeout
    const results = await Promise.all(tokens.map(token => 
      getSubmissionResult(token)
    ));
    
    return {
      totalTests: testCases.length,
      passedTests: results.filter(r => r.status.id === 3).length,
      results
    };
  } catch (error) {
    console.error('Error executing code:', error);
    return {
      totalTests: testCases.length,
      passedTests: 0,
      results: [],
      error: "Code execution failed"
    };
  }
}

async function getSubmissionResult(token) {
  const options = {
    method: 'GET',
    url: `${JUDGE0_API}/submissions/${token}`,
    params: { base64_encoded: 'false' },
    headers: {
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  };
  
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 1000));
    result = await axios.request(options);
  } while (result.data.status.id <= 2);
  
  return result.data;
}

function getLanguageId(language) {
  const languages = {
    'javascript': 63,
    'python': 71,
    'java': 62,
    'c': 50,
    'cpp': 54
  };
  return languages[language.toLowerCase()] || 63; // Default to JavaScript
}

export default executeCode;