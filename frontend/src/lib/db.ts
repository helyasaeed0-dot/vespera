// @ts-nocheck
/**
 * Safe database client fallback for legacy NextAuth adapters.
 * All real database operations are securely managed by the Express + Mongoose backend.
 */
const dummyFn = async (...args: any[]) => null;
const dummyArrayFn = async (...args: any[]) => [];

const handler = {
  get(target: any, prop: string) {
    if (prop === "$transaction") {
      return async (cb: any) => cb(proxyDb);
    }
    if (prop === "then") {
      return undefined;
    }
    return new Proxy(
      {},
      {
        get() {
          return dummyFn;
        },
      }
    );
  },
};

const proxyDb = new Proxy({}, handler);

export const db: any = proxyDb;
