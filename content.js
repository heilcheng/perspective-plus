async function getYoutubeTranscript() {
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (!videoId) {
      console.error('No video ID found');
      return null;
    }
  
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      const html = await response.text();
      
      const captionsRegex = /"captionTracks":(\[.*?\])/;
      const captionsMatch = html.match(captionsRegex);
      if (!captionsMatch) {
        console.error('No captions found for this video');
        return null;
      }
  
      const captions = JSON.parse(captionsMatch[1]);
      const englishCaptions = captions.find(caption => caption.languageCode === 'en');
      if (!englishCaptions) {
        console.error('No English captions found');
        return null;
      }
  
      const transcriptResponse = await fetch(englishCaptions.baseUrl);
      const transcriptText = await transcriptResponse.text();
  
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transcriptText, "text/xml");
      const textElements = xmlDoc.getElementsByTagName('text');
  
      let transcript = '';
      for (let i = 0; i < textElements.length; i++) {
        transcript += textElements[i].textContent + ' ';
      }
  
      return transcript.trim();
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }
  
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTranscript") {
      getYoutubeTranscript().then(transcript => {
        sendResponse({ transcript });
      });
      return true; 
    }
  });