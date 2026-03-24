import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { defineCommand } from "citty";
import { stringify } from "yaml";

import { DEFAULT_CONFIG } from "../config/defaults.ts";
import { CONFIG_PATH } from "../utils/paths.ts";

function configToYaml() {
  return stringify({
    theme: DEFAULT_CONFIG.theme,
    line1: {
      left: [...DEFAULT_CONFIG.line1.left],
      right: [...DEFAULT_CONFIG.line1.right],
    },
    line2: {
      left: [...DEFAULT_CONFIG.line2.left],
      right: [...DEFAULT_CONFIG.line2.right],
    },
    segments: {},
  });
}

export default defineCommand({
  meta: { name: "init", description: "Scaffold default config YAML" },
  args: {
    force: { type: "boolean", description: "Overwrite existing config", default: false },
  },
  run({ args }) {
    const configPath = CONFIG_PATH;

    if (existsSync(configPath) && !args.force) {
      console.error(`Config already exists: ${configPath}`);
      console.error("Use --force to overwrite");
      process.exit(1);
    }

    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, configToYaml(), "utf-8");
    console.log(`Config created: ${configPath}`);
  },
});
