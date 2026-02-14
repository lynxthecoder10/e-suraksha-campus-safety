// Mock backend for frontend development without local replica
export const createActor = (canisterId, options = {}) => {
    const agent = options.agent || new HttpAgent({ ...options.agentOptions });

    if (options.agent && options.agent.fetchRootKey) {
        options.agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }

    // Return a proxy that logs all calls and returns dummy promises
    return new Proxy({}, {
        get: (target, prop) => {
            return async (...args) => {
                console.log(`[MOCK BACKEND] Called ${String(prop)} with args:`, args);

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Return mock data based on method name
                if (prop === 'getCallerUserProfile') return null;
                if (prop === 'getCallerUserRole') return { 'user': null };
                if (prop === 'getAllUsers') return [];
                if (prop === 'getAccountStatus') return true;
                if (prop === 'createUserSession') return { role: 'user', expiresAt: BigInt(Date.now() + 3600000) * 1000000n, sessionId: 'mock-session' };
                if (prop === 'validateStoredSession') return true;
                if (prop === 'getDashboardSummary') return {
                    activeAlerts: 0n,
                    activeResponders: 0n,
                    totalUsers: 0n,
                    systemHealth: { 'optimal': null },
                    recentIncidents: 0n
                };

                return null;
            };
        }
    });
};

export const canisterId = process.env.CANISTER_ID_BACKEND || "mock-backend-id";
