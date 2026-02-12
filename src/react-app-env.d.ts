/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_FAST_API_HOST?: string;
  }
}
declare const process: { env: NodeJS.ProcessEnv };
