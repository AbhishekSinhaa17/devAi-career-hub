import pino from "pino";

// Define a structured logger. It is disabled in test environments or if no transport is needed,
// but for production it logs in JSON format.
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Add a base object to every log
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * Returns a child logger with a specific context (like a correlation ID)
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
