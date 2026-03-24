import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "cc-statusline");

export const CONFIG_PATH = join(CONFIG_DIR, "config.yaml");
export const OUTPUT_PATH = join(CONFIG_DIR, "statusline.sh");
export const SETTINGS_PATH = join(homedir(), ".claude", "settings.json");
