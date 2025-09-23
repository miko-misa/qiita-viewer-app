"use client";

import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

type QiitaSettings = {
  apiKey: string;
};

const { persistAtom } = recoilPersist({
  key: "qiita-viewer-settings",
  storage: typeof window === "undefined" ? undefined : window.localStorage,
});

export const qiitaSettingsState = atom<QiitaSettings>({
  key: "qiitaSettingsState",
  default: {
    apiKey: "",
  },
  effects_UNSTABLE: [persistAtom],
});
