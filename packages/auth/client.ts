import { createAuthClient } from "better-auth/react";

// biome-ignore lint: type annotation not portable across better-auth internals
export const authClient: any = createAuthClient();

export const { signIn, signOut, signUp, useSession } = authClient;
