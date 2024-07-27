import { promises as fs } from "fs";
import path from "path";

export async function loadJson(filePath) {
  const absolutePath = path.resolve(filePath);
  const data = await fs.readFile(absolutePath, "utf-8");
  return JSON.parse(data);
}
