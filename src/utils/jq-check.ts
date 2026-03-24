import { spawnSync } from "node:child_process";

export function checkJq() {
  const result = spawnSync("jq", ["--version"], {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (result.error || result.status !== 0) {
    return {
      ok: false as const,
      error: "jq is not installed. Install it: brew install jq (macOS) or apt install jq (Linux)",
    };
  }

  return { ok: true as const, version: result.stdout.trim() };
}
