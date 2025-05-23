import { vi, beforeAll, afterAll } from "vitest";

// Define types for console output storage
type ConsoleOutputEntry = {
  type: "log" | "error" | "warn" | "info" | "debug";
  args: unknown[];
};

// Store console output in a module-level variable
let consoleOutput: ConsoleOutputEntry[] = [];

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Export a function to get console output
export function getConsoleOutput() {
  return consoleOutput;
}

// Export a function to clear console output
export function clearConsoleOutput() {
  consoleOutput = [];
}

// Mock picocolors to return the string as is
vi.mock("picocolors", () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
  },
}));

// Mock console methods globally but store their output
beforeAll(() => {
  // Initialize the storage
  consoleOutput = [];

  // Create spies that store the output but don't print it
  vi.spyOn(console, "log").mockImplementation((...args) => {
    consoleOutput.push({ type: "log", args });
  });
  vi.spyOn(console, "error").mockImplementation((...args) => {
    consoleOutput.push({ type: "error", args });
  });
  vi.spyOn(console, "warn").mockImplementation((...args) => {
    consoleOutput.push({ type: "warn", args });
  });
  vi.spyOn(console, "info").mockImplementation((...args) => {
    consoleOutput.push({ type: "info", args });
  });
  vi.spyOn(console, "debug").mockImplementation((...args) => {
    consoleOutput.push({ type: "debug", args });
  });
});

// Restore console methods after all tests
afterAll(() => {
  vi.restoreAllMocks();
  // Restore original console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});
