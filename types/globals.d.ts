/**
 * Injected at build time by webpack's DefinePlugin
 * (see webpack.config.js). Resolves to the package version.
 */
declare const ANALYTICS_VERSION: string;

/**
 * Minimal ambient declaration for the build-time environment variable
 * used to switch analytics endpoints. Replaced by webpack's DefinePlugin
 * in the browser bundle; declared here so the source type-checks without
 * pulling in the full @types/node surface.
 */
declare const process: {
  env: {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};
