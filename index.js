const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Directory containing JPEG images
const inputDir = "./images"; // Change this to your directory
const outputDir = "./output"; // Directory to save WebP images

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to convert JPEG to WebP
const convertToWebP = (inputPath, outputPath) => {
  sharp(inputPath)
    .webp({ quality: 20 }) // Adjust quality as needed
    .toFile(outputPath, (err, info) => {
      if (err) {
        console.error(`Error converting ${inputPath}:`, err);
      } else {
        console.log(`Converted ${inputPath} to ${outputPath}`);
      }
    });
};

// Read all files in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(
        outputDir,
        `${path.basename(file, ext)}.webp`
      );
      convertToWebP(inputPath, outputPath);
    }
  });
});
