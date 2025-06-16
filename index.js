import { Command } from "commander";
import ignore from "ignore";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .argument("[rootDir]", "root directory to scan", ".")
  .option("-i, --include-hidden", "include hidden files", false)
  .option("-g, --ignore-gitignore", "list all files even if they are in .gitignore", false)
  .option("-t, --no-tree", "don't print directory tree")
  .option(
    "-e, --exclude <pattern>",
    "additional glob or path pattern to ignore (can be passed multiple times)",
    (pattern, memo) => {
      memo.push(pattern);
      return memo;
    },
    [],
  )
  .parse(process.argv);

const rootDir = path.resolve(program.args[0] || ".");
const { includeHidden, ignoreGitignore, tree, exclude } = program.opts();

const ig = ignore();
const gitignore = path.join(rootDir, ".gitignore");
if (fs.existsSync(gitignore) && !ignoreGitignore) {
  ig.add(fs.readFileSync(gitignore, "utf8").split(/\r?\n/));
}
ig.add(".git");

if (exclude && exclude.length > 0) {
  exclude.forEach((pattern) => {
    ig.add(pattern.replace(/^\.\//, ""));
  });
}

function isTextFile(filePath) {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytes; i++) {
      if (buf[i] === 0) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function printTree(dir, base = "", prefix = "") {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((ent) => includeHidden || !ent.name.startsWith("."))
    .filter((ent) => !ig.ignores(path.join(base, ent.name)));

  entries.forEach((ent, idx) => {
    const isLast = idx === entries.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    console.log(prefix + pointer + ent.name);

    if (ent.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      printTree(path.join(dir, ent.name), path.join(base, ent.name), newPrefix);
    }
  });
}

function walk(dir, base = "") {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, ent.name);

    if (!includeHidden && ent.name.startsWith(".")) continue;
    if (ig.ignores(rel)) continue;

    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, rel);
    } else if (ent.isFile()) {
      if (isTextFile(full)) {
        printFile(full, rel);
      } else {
        printPath(full, rel);
        console.log("Binary file\n");
      }
    }
  }
}

function printPath(fullPath, relPath) {
  console.log("=".repeat(48));
  console.log(`FILE: ${relPath}`);
  console.log("=".repeat(48));
}

function printFile(fullPath, relPath) {
  const content = fs.readFileSync(fullPath, "utf8");
  printPath(fullPath, relPath);
  console.log(content);
  console.log();
}

if (tree) {
  console.log("Directory structure:");
  console.log(path.basename(rootDir));
  printTree(rootDir);
  console.log();
}
console.log("File contents:");
walk(rootDir);
