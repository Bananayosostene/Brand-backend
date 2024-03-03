import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {},
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

export default config;
