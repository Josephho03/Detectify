import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const supabaseServer = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // ✅ READ cookies is allowed in a Server Component
        get(name: string) {
          return cookieStore.get(name)?.value;
        },

        // ❌ Writing cookies is NOT allowed here in Next 15,
        // so we make these no-ops to avoid the runtime error.
        set(name: string, value: string, options: CookieOptions) {
          // no-op on the server component side
        },
        remove(name: string, options: CookieOptions) {
          // no-op on the server component side
        },
      },
    }
  );
};
