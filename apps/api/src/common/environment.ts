/** Railway does not guarantee NODE_ENV, but it always injects RAILWAY_* vars. */
export function isDeployedEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    Object.keys(process.env).some((key) => key.startsWith("RAILWAY_"))
  );
}
