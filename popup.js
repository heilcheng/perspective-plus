document.addEventListener('DOMContentLoaded', function() {
  const verifyButton = document.getElementById('verifyButton');
  const resultDiv = document.getElementById('result');

  verifyButton.addEventListener('click', function() {
    verifyButton.disabled = true;
    resultDiv.innerHTML = "<p>Fetching and verifying content...</p>";
    
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {action: "getTranscript"}, function(response) {
        console.log("Received transcript response:", response);
        if (response && response.transcript) {
          browser.runtime.sendMessage({action: "verifyContent", transcript: response.transcript}, function(result) {
            console.log("Received verification result:", result);
            displayResults(result);
            verifyButton.disabled = false;
          });
        } else {
          resultDiv.textContent = "Unable to retrieve transcript. Please make sure you're on a YouTube video page with available captions.";
          verifyButton.disabled = false;
        }
      });
    });
  });
});

function displayResults(result) {
  const resultDiv = document.getElementById('result');
  const scorePercentage = result.overallScore ? Math.round(result.overallScore * 100) : 'N/A';
  const scoreColor = getScoreColor(result.overallScore);

  resultDiv.innerHTML = `
    <div class="score" style="color: ${scoreColor}">${scorePercentage}%</div>
    <div class="interpretation">${result.overallInterpretation}</div>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>${result.summary}</p>
    </div>
    
    <div class="analysis">
      <h2>Detailed Analysis</h2>
      ${result.details.map((detail, index) => `
        <div class="chunk">
          <span class="chunk-score">Chunk ${index + 1}: ${detail.score ? Math.round(detail.score * 100) : 'N/A'}% - </span>
          ${detail.interpretation}
        </div>
      `).join('')}
    </div>
  `;
}

function getScoreColor(score) {
  if (score === null) return '#888'; // Gray for N/A
  if (score > 0.7) return '#4CAF50'; // Green
  if (score > 0.4) return '#FFC107'; // Yellow
  return '#F44336'; // Red
}