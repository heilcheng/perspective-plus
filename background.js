const API_KEY = "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";

async function verifyMedicalContent(transcript) {
  console.log("Starting verification");
  const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

  const chunks = splitIntoChunks(transcript, 500);
  let verificationResults = [];

  const MAX_CHUNKS = 10;
  for (let i = 0; i < Math.min(chunks.length, MAX_CHUNKS); i++) {
    const chunk = chunks[i];
    try {
      console.log("Sending chunk to API:", chunk.substring(0, 50) + "...");
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ 
          inputs: chunk,
          parameters: {
            candidate_labels: ["accurate medical information", "inaccurate medical information"]
          }
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      verificationResults.push(interpretResult(result, chunk));
    } catch (error) {
      console.error("API request failed:", error);
      verificationResults.push({ chunk, score: null, interpretation: "Failed to verify" });
    }
  }
  
  console.log("Verification complete", verificationResults);
  const verificationResult = summarizeResults(verificationResults);
  const summary = await generateSummary(transcript, verificationResult);

  return {
    ...verificationResult,
    summary
  };
}

function splitIntoChunks(text, maxTokens) {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = [];
  
  for (let word of words) {
    if (currentChunk.length + 1 > maxTokens) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
    currentChunk.push(word);
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

function interpretResult(result, chunk) {
  console.log("Interpreting result:", result);
  if (!result || !result.scores || result.scores.length === 0) {
    return { chunk, score: null, interpretation: "Unable to assess" };
  }
  
  const accurateScore = result.scores[result.labels.indexOf("accurate medical information")];
  let interpretation;
  if (accurateScore > 0.8) interpretation = "Highly likely accurate";
  else if (accurateScore > 0.6) interpretation = "Likely accurate";
  else if (accurateScore > 0.4) interpretation = "Uncertain";
  else if (accurateScore > 0.2) interpretation = "Likely inaccurate";
  else interpretation = "Highly likely inaccurate";
  
  return { chunk, score: accurateScore, interpretation };
}

function summarizeResults(results) {
  const validScores = results.filter(r => r.score !== null);
  const overallScore = validScores.length > 0 
    ? validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length 
    : null;
  
  return {
    overallScore,
    overallInterpretation: interpretOverallScore(overallScore),
    details: results
  };
}

function interpretOverallScore(score) {
  if (score === null) return "Unable to assess the overall content.";
  if (score > 0.8) return "The content appears to be highly accurate.";
  if (score > 0.6) return "The content appears to be generally accurate.";
  if (score > 0.4) return "The content contains a mix of accurate and potentially inaccurate information.";
  if (score > 0.2) return "The content may contain significant inaccuracies.";
  return "The content is likely to be highly inaccurate.";
}

async function generateSummary(transcript, verificationResults) {
  const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ 
        inputs: transcript.substring(0, 1000), // Limit to first 1000 characters
        parameters: {
          max_length: 150,
          min_length: 50,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const summary = result[0].summary_text;

    const overallScore = verificationResults.overallScore ? verificationResults.overallScore.toFixed(2) : 'N/A';
    const enhancedSummary = `${summary}\n\nContent Verification: This content has an overall accuracy score of ${overallScore}. ${verificationResults.overallInterpretation}`;

    return enhancedSummary;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "Unable to generate summary due to an error.";
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  if (request.action === "verifyContent") {
    verifyMedicalContent(request.transcript).then(result => {
      console.log("Sending response:", result);
      sendResponse(result);
    });
    return true;
  }
});