import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defineCommand } from "citty";

import { loadConfig } from "../config/loader.ts";
import { generateScript } from "../generator/script.ts";
import { checkJq } from "../utils/jq-check.ts";
import { MOCK_CC_JSON } from "../utils/mock-data.ts";
import { CONFIG_PATH } from "../utils/paths.ts";

export default defineCommand({
  meta: { name: "preview", description: "Preview statusline with mock data" },
  args: {
    config: { type: "string", description: "Path to config YAML" },
  },
  run({ args }) {
    const jqResult = checkJq();
    if (!jqResult.ok) {
      console.error(jqResult.error);
      process.exit(1);
    }

    const configPath = args.config ?? CONFIG_PATH;
    const configResult = loadConfig(configPath);
    if (!configResult.ok) {
      console.error(`Config error: ${configResult.error.message}`);
      process.exit(1);
    }

    const script = generateScript(configResult.value);
    const tempDir = join(tmpdir(), "cc-statusline");
    mkdirSync(tempDir, { recursive: true });
    const tempScript = join(tempDir, "preview.sh");

    writeFileSync(tempScript, script, { mode: 0o755 });

    const result = spawnSync("bash", [tempScript], {
      input: JSON.stringify(MOCK_CC_JSON),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (result.stderr) {
      console.error(result.stderr);
    }

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }

    try {
      unlinkSync(tempScript);
    } catch {
      /* ignore */
    }
  },
});
