import { DEFAULT_STATE, LOCAL_USER_ID } from "./defaults";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const STATE_KEYS = Object.keys(DEFAULT_STATE);

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "local-state.json");

let writeQueue = Promise.resolve();

export function assertStateKey(key) {
  if (!STATE_KEYS.includes(key)) {
    throw new Error(`Unsupported state key: ${key}`);
  }
}

function withRuntimeDefaults(key, value) {
  if (key === "config") {
    return {
      ...DEFAULT_STATE.config,
      startDate: new Date().toISOString(),
      ...(value || {}),
    };
  }
  return value ?? DEFAULT_STATE[key];
}

async function readStore() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return {};
  }
}

async function writeStore(store) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

function userBucket(store, userId) {
  if (!store[userId]) {
    store[userId] = {};
  }
  return store[userId];
}

export async function getState(key, userId = LOCAL_USER_ID) {
  assertStateKey(key);
  const store = await readStore();
  const bucket = userBucket(store, userId);

  if (!(key in bucket)) {
    const value = withRuntimeDefaults(key, DEFAULT_STATE[key]);
    await setState(key, value, userId);
    return value;
  }

  return withRuntimeDefaults(key, bucket[key]);
}

export async function setState(key, value, userId = LOCAL_USER_ID) {
  assertStateKey(key);
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    userBucket(store, userId)[key] = value;
    await writeStore(store);
  });
  await writeQueue;
  return value;
}
