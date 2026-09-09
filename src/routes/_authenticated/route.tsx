import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { initUserStore } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void initUserStore(user.id).finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <p className="text-sm text-muted-foreground" role="status">
          Loading your workspace…
        </p>
      </div>
    );
  }

  return <Outlet />;
}
