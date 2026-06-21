import process from "node:process";
import { ensureEnvValid } from "./env-validation.server";

export function getServerConfig() {
  ensureEnvValid();

  return {
    nodeEnv: process.env.NODE_ENV,
  };
}
