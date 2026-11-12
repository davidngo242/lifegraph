// Sandbox context for "Nếu như…": code running inside runInSandbox() draws random numbers from a private
// { seed, n } stream and may not write to the real session (db.js writes throw / no-op via assertNotSandbox).
import { AsyncLocalStorage } from 'node:async_hooks';

export const sandboxContext = new AsyncLocalStorage();
export const inSandbox = () => !!sandboxContext.getStore();
export function runInSandbox(rngState, fn) { return sandboxContext.run({ rng: rngState }, fn); }
export function assertNotSandbox(op) {
  if (inSandbox()) throw new Error(`Sandbox "Nếu như…" không được ghi vào phiên thật (${op}).`);
}
