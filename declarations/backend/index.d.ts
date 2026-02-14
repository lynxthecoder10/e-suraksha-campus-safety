// Re-export all types from the generated declarations
export * from './backend.did.d.ts';

// Re-export the createActor function and canisterId
export declare const createActor: (canisterId: string, options?: any) => any;
export declare const canisterId: string;
