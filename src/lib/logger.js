export const logDev = (message, ...optionalParams) => {
  // If we're on the client side without NEXT_PUBLIC_LOGLEVEL, fallback to checking if it's explicitly set.
  // Next.js exposes NEXT_PUBLIC_* to the browser. Server-side can access process.env.LOGLEVEL.
  const logLevel = process.env.LOGLEVEL || process.env.NEXT_PUBLIC_LOGLEVEL;
  
  if (logLevel === 'dev') {
    console.log(`[DEV] ${message}`, ...optionalParams);
  }
};
