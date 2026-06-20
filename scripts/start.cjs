const { spawnSync } = require("node:child_process");
const path = require("node:path");

const port = process.env.PORT?.trim() || "3001";
const npmNode = process.env.npm_node_execpath || process.execPath;
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(npmNode, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
