import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  base: {
    env: process.env.NODE_ENV,
  },
});

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
