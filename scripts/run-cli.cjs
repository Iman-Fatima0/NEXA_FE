const { spawnSync } = require("node:child_process");
const path = require("node:path");

const [tool, ...toolArgs] = process.argv.slice(2);
const npmNode = process.env.npm_node_execpath || process.execPath;

const bins = {
  next: path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
  tsc: path.resolve(process.cwd(), "node_modules", "typescript", "bin", "tsc"),
};

const selectedBin = bins[tool];
if (!selectedBin) {
  console.error(`run-cli: unknown tool "${tool}"`);
  process.exit(1);
}

const result = spawnSync(npmNode, [selectedBin, ...toolArgs], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
