"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode, useState } from "react";
import { RecoilRoot } from "recoil";

const reactAny = React as unknown as {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: { current: { useSyncExternalStore?: typeof React.useSyncExternalStore } };
    ReactCurrentOwner?: { currentDispatcher?: { useSyncExternalStore?: typeof React.useSyncExternalStore } };
  };
};

if (!reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
}

const secretInternals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

if (!secretInternals.ReactCurrentDispatcher) {
  secretInternals.ReactCurrentDispatcher = { current: {} } as {
    current: { useSyncExternalStore?: typeof React.useSyncExternalStore };
  };
}

if (!secretInternals.ReactCurrentOwner) {
  secretInternals.ReactCurrentOwner = { currentDispatcher: {} } as {
    currentDispatcher?: { useSyncExternalStore?: typeof React.useSyncExternalStore };
  };
}

secretInternals.ReactCurrentDispatcher.current.useSyncExternalStore ??=
  React.useSyncExternalStore?.bind(React);

if (secretInternals.ReactCurrentOwner.currentDispatcher) {
  secretInternals.ReactCurrentOwner.currentDispatcher.useSyncExternalStore ??=
    React.useSyncExternalStore?.bind(React);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RecoilRoot>
  );
}
