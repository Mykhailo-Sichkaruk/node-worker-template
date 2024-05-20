import env from "#config/env.js";
import pino from "pino";

const devTargets = [
  {
    level: "trace",
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  },
];

export const log = pino({
  customLevels: {
    system: 100,
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
  },
  level: "debug",
  transport: {
    targets: [ ...devTargets ],
  },
});
