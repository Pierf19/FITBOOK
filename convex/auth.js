import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          name: params.name,
          role: params.role || "user",
          email: params.email,
          createdAt: Date.now(),
        };
      },
    }),
  ],
});
