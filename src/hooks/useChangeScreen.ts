import type { PrayerSettingsForm } from "@/components/types/types";
import { useEffect, useState } from "react";

export default function useChangeScreen() {
  const [screen, setScreen] = useState<"loading" | "settings" | "main">(
    "loading"
  );
  const [settings, setSettings] = useState<PrayerSettingsForm|null>(null);

  useEffect(()=>{
    chrome.storage.local.get("prayerSettings", ({prayerSettings})=>{
        if(!prayerSettings){
            setScreen("settings")
        }else{
            setSettings(prayerSettings)
            setScreen("main")
        }
    })
  },[])

  return {
    screen, setScreen , settings, setSettings
  }
}
