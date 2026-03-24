import { OUTPUT_PATH, SETTINGS_PATH } from "../utils/paths.ts";
import type { Config } from "./schema.ts";

export const DEFAULT_CONFIG: Config = {
  theme: "default",
  line1: {
    left: ["os_icon", "directory", "git_branch", "git_status"],
    right: ["model", "agent_name", "vim_mode"],
  },
  line2: {
    left: ["cost", "duration", "lines_changed"],
    right: ["context_bar", "rate_limits", "time"],
  },
  segments: {},
  settings_json_path: SETTINGS_PATH,
  output_path: OUTPUT_PATH,
};
