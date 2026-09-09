import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Account = {
  user: User | null;
  displayName: string;
  loading: boolean;
};

export function initialsOf(name: string, email: string | undefined) {
  const source = name.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]!.toUpperCase());
  return letters.join("") || "U";
}

/** Current signed-in person plus their profile display name. */
export function useAccount(): Account {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (id: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", id)
        .maybeSingle();
      if (active) setDisplayName(data?.display_name ?? "");
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
      if (data.user) void loadProfile(data.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
      if (session?.user) void loadProfile(session.user.id);
      else setDisplayName("");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, displayName, loading };
}
