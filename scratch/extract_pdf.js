const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:/Users/bipla/.gemini/antigravity-ide/brain/39a15809-41c4-4d27-b3a3-801d7f6f9ad9/.user_uploaded/media_1787512719253.pdf';
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  fs.writeFileSync('C:/Users/bipla/Downloads/github/github-profile-generator/scratch/raw_pdf_text.txt', data.text);
  console.log("PDF text extracted to scratch/raw_pdf_text.txt");
}).catch(console.error);
