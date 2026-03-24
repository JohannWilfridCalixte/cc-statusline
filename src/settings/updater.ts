import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function updateSettings(scriptPath: string, settingsPath: string) {
  let settings: Record<string, unknown> = {};

  if (existsSync(settingsPath)) {
    try {
      const content = readFileSync(settingsPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        settings = parsed as Record<string, unknown>;
      }
    } catch {
      console.error(`Warning: could not parse ${settingsPath}, creating new file`);
    }
  }

  settings["statusLine"] = {
    type: "command",
    command: scriptPath,
  };

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
}
