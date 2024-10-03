# Perspective Plus

Perspective Plus is a Firefox extension that verifies the accuracy of medical content in YouTube videos. It provides a summary of the video content and an assessment of its medical accuracy.

## Features

- Extracts transcripts from YouTube videos
- Analyzes medical content for accuracy using AI
- Provides a summary of the video content
- Offers a detailed breakdown of content accuracy by chunks
- Presents an overall accuracy score and interpretation

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/heilcheng/perspective-plus.git
   ```
2. Open Firefox and navigate to `about:debugging`
3. Click on "This Firefox" in the left sidebar
4. Click on "Load Temporary Add-on"
5. Navigate to the cloned repository and select the `manifest.json` file

## Usage

1. Navigate to a YouTube video with medical content
2. Click on the Perspective Plus icon in your browser toolbar
3. Click the "Verify Medical Content" button
4. View the summary, accuracy score, and detailed analysis

## Technologies Used

- JavaScript
- Firefox WebExtensions API
- Hugging Face Inference API
  - facebook/bart-large-mnli (for content verification)
  - facebook/bart-large-cnn (for summary generation)
- YouTube Transcript API (for extracting video transcripts)

## Setup for Development

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file in the root directory and add your Hugging Face API key:
   ```
   API_KEY=your_api_key_here
   ```
3. Load the extension in Firefox as described in the Installation section

## Contributing

Contributions to Perspective Plus are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Create a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This extension is for educational purposes only. Always consult with a qualified healthcare professional for medical advice.
