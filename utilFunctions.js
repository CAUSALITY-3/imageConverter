import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import { ExifTool } from "exiftool-vendored";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const exiftool = new ExifTool();

export async function updateMetadata(
  input,
  output,
  inputExtentions = [".jpg", ".jpeg", ".png"],
  outputFormat = "webp"
) {
  try {
    const inputDir =
      input || "C:/Users/abinb/Documents/image_video_formatter/test"; // Change this to your directory
    const outputDir =
      output ||
      "C:/Users/abinb/Documents/image_video_formatter/imageConverter/output1"; // Directory to save WebP images

    const extentionsArray = inputExtentions;
    const updateFileMetadata = (inputFile, outputFile) => {
      try {
        const command = `exiftool -tagsFromFile ${inputFile} -Model -Orientation -ModifyDate -DateTimeOriginal -CreateDate -GPSAltitude -GPSLatitude -GPSLongitude -GPSPosition -overwrite_original ${outputFile}`;
        return new Promise((resolve, reject) =>
          exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              console.error(`Error: ${error.message}`);
              return;
            }
            if (stderr) {
              reject(stderr);
              console.error(`Stderr: ${stderr}`);
              return;
            }
            resolve(stdout);
            console.log(`Metadata updated successfully: ${stdout}`);
          })
        );
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
    };

    const files = await fs.readdir(inputDir);

    console.log({ files });
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (extentionsArray.includes(ext)) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(
          outputDir,
          `${path.basename(file, ext)}.${outputFormat}`
        );
        try {
          await update(inputPath, outputPath);
        } catch (error) {
          console.error(`Error updating metadata for ${inputPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

export async function copyFilesByName(
  source,
  destination,
  names = ["202406", "202407", "202408"]
) {
  try {
    const sourcePath =
      source ||
      "C:/Users/abinb/Documents/image_video_formatter/imageConverter/video_output"; // Change this to your directory
    const destinationPath =
      destination ||
      "C:/Users/abinb/Documents/image_video_formatter/imageConverter/video_output1"; // Directory to save WebP images

    const files = await fs.readdir(sourcePath);

    const copiableFiles = files.filter((file) =>
      names.find((name) => file.includes(name))
    );

    console.log(JSON.stringify(copiableFiles));

    for (const file of copiableFiles) {
      const filePath = path.join(sourcePath, file);

      const destFilePath = path.join(destinationPath, file);
      try {
        await fs.copyFile(filePath, destFilePath);
      } catch (error) {
        console.error(`Error copying file: ${error}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

export async function deleteFilesInDirectory(directory) {
  const files = await fs.readdir("./video_output"); // check files in this directory
  console.log(files);
  for (const file of files) {
    const filePath = path.join(
      directory, // delete files in this directory if file present in above directory
      file
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log(err);
    }
  }
}

export const deleteByComparingFolders = async (
  checkFolderPath,
  deleteFolderPath
) => {
  const checkFiles = await fs.readdir(checkFolderPath);
  const allFiles = await fs.readdir(deleteFolderPath);

  const presentFiles = allFiles.filter((file) => {
    return checkFiles.includes(file);
  });
  for (const file of presentFiles) {
    const filePath = path.join(
      deleteFolderPath, // delete files in this directory if file present in above directory
      file
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log(err);
    }
  }
};

export async function getFileByType(sourceDir = null, destDir) {
  const sourceDirectories = sourceDir || [
    `C:/Users/abinb/Downloads/takeout-20240830T090411Z-001/Takeout/Google Photos`,
  ];

  const imageDestination =
    destDir.imageDest ||
    "C:/Users/abinb/Documents/image_video_formatter/images";
  const videoDestination =
    destDir.videoDest ||
    "C:/Users/abinb/Documents/image_video_formatter/videos";
  const gifDestination =
    destDir.gifDest || "C:/Users/abinb/Documents/image_video_formatter/gif";

  const getFileType = (file) => {
    const ext = path.extname(file).toLowerCase();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"];
    const gifExtensions = [".gif"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".3gp"];

    if (imageExtensions.includes(ext)) return "image";
    if (gifExtensions.includes(ext)) return "gif";
    if (videoExtensions.includes(ext)) return "video";
    return null;
  };

  // Function to copy files based on type
  const copyFiles = async (srcDir) => {
    const filesd = await fs.readdir(srcDir);
    console.log({ filesd });
    for (const file of filesd) {
      const srcFilePath = path.join(srcDir, file);
      const stats = await fs.stat(srcFilePath);
      if (stats.isDirectory()) {
        // Recursively call the function for subdirectories
        await copyFiles(srcFilePath);
      } else {
        const fileType = getFileType(file);
        let destDir;

        switch (fileType) {
          case "image":
            destDir = imageDestination;
            break;
          case "gif":
            destDir = gifDestination;
            break;
          case "video":
            destDir = videoDestination;
            break;
          default:
            console.log(`Unsupported file type: ${file}`);
            continue;
        }

        const destFilePath = path.join(destDir, file);
        console.log({ destFilePath });
        try {
          await fs.copyFile(srcFilePath, destFilePath);
          console.log(`Copied: ${srcFilePath} to ${destFilePath}`);
        } catch (err) {
          console.error(`Error copying file: ${err}`);
        }
      }
    }
  };
  for (const i of [imageDestination, videoDestination, gifDestination]) {
    await ensureDirectoryExists(i);
  }
  // Start the process
  for (const dir of sourceDirectories) {
    await copyFiles(dir);
    console.log(`Copied files from directory: ${dir}`);
  }
}

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    console.log(`Directory ${dirPath} already exists.`);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dirPath);
      console.log(`Directory ${dirPath} created successfully.`);
    } else {
      console.error("Error checking directory:", error);
    }
  }
}

export async function getFileTags(filePath) {
  const tags = await exiftool.read(filePath);
  console.log("File tags:", tags);
  await exiftool.end();
  return tags;
}

export async function getCreateDate(filePath) {
  const tags = await getFileTags(filePath);
  return tags.CreateDate;
}

export async function convertImagesToWebP(src, dest) {
  const inputDir =
    src || "C:/Users/abinb/Documents/image_video_formatter/images"; // Change this to your directory
  const outputDir = dest || "./output"; // Directory to save WebP images

  await ensureDirectoryExists(outputDir);

  const files = await fs.readdir(inputDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(
        outputDir,
        `${path.basename(file, ext)}.webp`
      );
      try {
        await convertToWebP(inputPath, outputPath);
        await updateFileMetadata(inputPath, outputPath);
      } catch (err) {
        console.error(`Error converting ${inputPath}:`, err);
      }
    }
  }
}

export const convertToWebP = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    try {
      sharp(inputFile)
        .webp({ quality: 50 }) // Adjust quality as needed
        .toFile(outputFile, (err, info) => {
          if (err) {
            reject(err);
            console.error(`Error converting ${inputFile}:`, err);
          } else {
            resolve(info);
            console.log(
              `Converted ${inputFile} to ${outputFile} successfully, info: `,
              info
            );
          }
        });
    } catch (error) {
      reject(error);
    }
  });
};

export function updateFileMetadata(inputFile, outputFile) {
  try {
    const command = `exiftool -tagsFromFile ${inputFile} -Model -Orientation -DateTimeOriginal -CreateDate -GPSAltitude -GPSLatitude -GPSLongitude -GPSPosition -overwrite_original ${outputFile}`;
    // const command = `exiftool -tagsFromFile ${inputFile} -Model -Orientation -DateTimeOriginal -FileModificationDate/Time -overwrite_original ${outputFile}`;
    return new Promise((resolve, reject) =>
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(stderr);
          console.error(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout);
        console.log(`Metadata updated successfully: ${stdout}`);
      })
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return 0;
  }
}

export const convertToH265 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx265")
      .outputOptions("-c:v libx265") // Use H.265 codec
      .outputOptions("-crf 32") // Constant Rate Factor (adjust for quality)
      .outputOptions("-preset medium") // Preset (adjust for encoding speed/quality)
      .output(outputPath)
      .on("end", () => {
        resolve(`Converted ${inputPath} to ${outputPath}`);
        console.log(`Converted ${inputPath} to ${outputPath}`);
      })
      .on("error", (err) => {
        reject(`Error converting ${inputPath}:`, err.message);
        console.error(`Error converting ${inputPath}:`, err.message);
      })
      .run();
  });
};

export async function convertVideoToH265(inputDirectory, outputDirectory) {
  try {
    const inputDir =
      inputDirectory || "C:/Users/abinb/Documents/image_video_formatter/videos"; // Change this to your directory
    const outputDir = outputDirectory || "./video_output";

    await ensureDirectoryExists(outputDir);

    const files = await fs.readdir(inputDir);

    let i = 1;
    for (const file of files) {
      const startTime = Math.floor(Date.now() / 1000);
      const ext = path.extname(file).toLowerCase();
      if (
        ext === ".mp4" ||
        ext === ".avi" ||
        ext === ".mkv" ||
        ext === ".mov"
      ) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(
          outputDir,
          `${path.basename(file, ext)}.mp4`
        );

        try {
          await convertToH265(inputPath, outputPath);
          await updateFileMetadata(inputPath, outputPath);
        } catch (error) {
          console.error(`Error updating metadata for ${inputPath}:`, error);
        }
        console.log(
          "time taken to convert, item",
          file,
          " COUNT ",
          i,
          "is",
          Math.floor(Date.now() / 1000) - startTime,
          "seconds"
        );
      }
      i++;
    }
  } catch (error) {
    console.error(error);
  }
}

export const mergeVideos = async (inputPath, outputPath) => {
  const inputVideos = await fs.readdir(inputPath);
  const outputVideo = outputPath || "./mergedVideo.mp4";

  console.log("Merging videos:", inputVideos);
  const startTime = Math.floor(Date.now() / 1000);
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    inputVideos.forEach((video) => {
      const videoPath = path.join(inputPath, video);
      command.input(videoPath);
    });

    command
      .on("end", () => {
        console.log("Merging finished!");
        console.log(
          "time taken to merge is",
          Math.floor(Date.now() / 1000) - startTime
        );
        resolve();
      })
      .on("error", (err) => {
        console.error("Error:", err);
        reject(err);
      })
      .mergeToFile(outputVideo, path.dirname(outputVideo));
  });
};
