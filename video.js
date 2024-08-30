const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require("fs");
const path = require("path");

// Directory containing the input videos
const inputDir = "./videos"; // Change this to your directory
const outputDir = "./video_output"; // Directory to save converted videos

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to convert video to H.265
const convertToH265 = (inputPath, outputPath) => {
  ffmpeg(inputPath)
    .videoCodec("libx265")
    .outputOptions("-c:v libx265") // Use H.265 codec
    .outputOptions("-crf 32") // Constant Rate Factor (adjust for quality)
    .outputOptions("-preset medium") // Preset (adjust for encoding speed/quality)
    .output(outputPath)
    .on("end", () => {
      console.log(`Converted ${inputPath} to ${outputPath}`);
    })
    .on("error", (err) => {
      console.error(`Error converting ${inputPath}:`, err.message);
    })
    .run();
};

// Read all files in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (ext === ".mp4" || ext === ".avi" || ext === ".mkv" || ext === ".mov") {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(
        outputDir,
        `${path.basename(file, ext)}.mp4`
      );
      convertToH265(inputPath, outputPath);
    }
  });
});
