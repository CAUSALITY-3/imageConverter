import {
  convertVideoToH265,
  getFileByType,
  mergeVideos,
  convertImagesToWebP,
} from "./utilFunctions.js";
import fs from "fs/promises";
import path from "path";

await getFileByType(["E:/PICS/unni"], {});
convertImagesToWebP();
