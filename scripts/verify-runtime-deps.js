/**
 * Checks that everything production actually loads can be resolved against a
 * production-only dependency tree.
 *
 * The server installs with --omit=dev, so a package that runtime code imports
 * but that is listed under devDependencies resolves fine in CI and on a
 * developer machine, then throws MODULE_NOT_FOUND on boot in production.
 *
 * This walks out from the entry points rather than scanning all of dist/,
 * because tsc also compiles the specs and the bdd suite into dist/ and those
 * legitimately require devDependencies.
 *
 * A resolution landing outside the project counts as a failure: node walks up
 * past the project root looking for node_modules, which in a git worktree finds
 * the parent checkout's tree and hides the very problem this looks for.
 *
 * Run after `npm run prepublishOnly` and `npm install --omit=dev`.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const entryPoints = ["src/start.js", "src/cli.js"].map(f => path.join(distDir, f));

for (const entryPoint of entryPoints) {
  if (!fs.existsSync(entryPoint)) {
    console.error(`Missing ${path.relative(projectRoot, entryPoint)}. Run \`npm run prepublishOnly\` first.`);
    process.exit(1);
  }
}

const problems = new Set();
const visited = new Set();
const queue = [...entryPoints];

while (queue.length > 0) {
  const file = queue.pop();

  if (visited.has(file)) {
    continue;
  }

  visited.add(file);

  const requires = fs.readFileSync(file, "utf8").matchAll(/require\(\s*"([^"]+)"\s*\)/g);
  const where = path.relative(distDir, file);

  for (const [, specifier] of requires) {
    if (Module.isBuiltin(specifier)) {
      continue;
    }

    let resolved;

    try {
      resolved = Module.createRequire(file).resolve(specifier);
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") {
        throw e;
      }

      problems.add(`${where} requires ${specifier}, which cannot be resolved`);
      continue;
    }

    if (!resolved.startsWith(projectRoot + path.sep)) {
      problems.add(`${where} requires ${specifier}, found only outside the project at ${resolved}`);
    } else if (specifier.startsWith(".") && resolved.endsWith(".js")) {
      queue.push(resolved);
    }
  }
}

if (problems.size > 0) {
  console.error("Not resolvable from a production install:\n");

  for (const problem of problems) {
    console.error("  " + problem);
  }

  console.error("\nIf the package is in devDependencies, move it to dependencies in package.json.");
  process.exit(1);
}

console.log(`${visited.size} modules reachable from the entry points, every require resolves.`);
