// Polyfill for crypto.randomUUID in older Node.js versions
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('crypto');
  
  // Add minimal crypto implementation for compatibility
  (globalThis as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
    subtle: undefined,
    getRandomValues: (array: any) => crypto.getRandomValues(array),
  };
}
