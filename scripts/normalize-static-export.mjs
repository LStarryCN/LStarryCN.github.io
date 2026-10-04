import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
let copied = 0;
for (const file of fs.readdirSync(root, { recursive: true }).map(String)) {
  if (!file.endsWith(".txt")) continue;
  const parts = file.split(path.sep);
  const index = parts.findIndex((part) => part.startsWith("__next."));
  if (index < 0 || index === parts.length - 1) continue;
  // Next 16.3's exporter passes Windows backslashes to a slash-only filename encoder.
  // Keep the emitted files and add the exact flattened filenames requested by the client.
  const target = path.join(root, ...parts.slice(0, index), parts.slice(index).join("."));
  fs.copyFileSync(path.join(root, file), target);
  copied += 1;
}
console.log(`Static export: ${copied} segment filenames normalized`);
