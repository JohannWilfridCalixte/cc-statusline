#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import generate from "./commands/generate.ts";
import init from "./commands/init.ts";
import preview from "./commands/preview.ts";

const main = defineCommand({
  meta: {
    name: "cc-statusline",
    version: "0.1.0",
    description: "Generate a customizable Claude Code statusline script",
  },
  subCommands: { init, generate, preview },
});

runMain(main);
