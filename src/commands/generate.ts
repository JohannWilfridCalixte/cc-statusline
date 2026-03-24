import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { defineCommand } from "citty";

import { loadConfig } from "../config/loader.ts";
import { generateScript } from "../generator/script.ts";
import { updateSettings } from "../settings/updater.ts";
import { checkJq } from "../utils/jq-check.ts";
import { CONFIG_PATH } from "../utils/paths.ts";

export default defineCommand({
  meta: { name: "generate", description: "Generate statusline shell script" },
  args: {
    config: { type: "string", description: "Path to config YAML" },
    output: { type: "string", description: "Output script path" },
    "skip-settings": { type: "boolean", description: "Skip settings.json update", default: false },
  },
  run({ args }) {
    const jqResult = checkJq();
    if (!jqResult.ok) {
      console.error(jqResult.error);
      process.exit(1);
    }
    console.log(`jq found: ${jqResult.version}`);

    const configPath = args.config ?? CONFIG_PATH;
    const configResult = loadConfig(configPath);
    if (!configResult.ok) {
      console.error(`Config error: ${configResult.error.message}`);
      process.exit(1);
    }

    const config = configResult.value;
    const outputPath = args.output ?? config.output_path;
    const script = generateScript(config);

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, script, "utf-8");
    chmodSync(outputPath, 0o755);
    console.log(`Script generated: ${outputPath}`);

    if (!args["skip-settings"]) {
      updateSettings(outputPath, config.settings_json_path);
      console.log(`Settings updated: ${config.settings_json_path}`);
    }
  },
});
