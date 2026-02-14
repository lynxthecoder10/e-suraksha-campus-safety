import { Actor, HttpAgent } from "@dfinity/agent";
import { useQuery } from "@tanstack/react-query";
import { useInternetIdentity } from "./useInternetIdentity";
// Assuming declarations are mapped correctly in vite.config.js or tsconfig.json
// If not, this path might need adjustment based on where dfx generates files
import { createActor } from "../../../declarations/backend";

export const useActor = () => {
    const { identity } = useInternetIdentity();

    const { data: actor, isLoading: isFetching } = useQuery({
        queryKey: ["actor", identity],
        queryFn: async () => {
            const agent = new HttpAgent({ identity: identity ?? undefined });

            if (process.env.DFX_NETWORK !== "ic") {
                await agent.fetchRootKey();
            }

            return createActor(process.env.CANISTER_ID_BACKEND || "", {
                agent,
            });
        },
        enabled: !!identity,
    });

    return { actor, isFetching };
};
