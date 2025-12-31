import { useEffect } from "react";
import { Settings } from "../components/Settings";
import { MainScreen } from "@/components/MainScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import useChangeScreen from "@/hooks/useChangeScreen";

export default function Popup() {

    const { screen, setScreen, settings, setSettings } = useChangeScreen()

    useEffect(() => {
        console.log("popup prayer setting use effect")
        chrome.storage.local.get("prayerSettings", (res) => {
            if (!res.prayerSettings) {
                setScreen("settings")
            }
            else {
                setScreen("main")
            }
        })
    }, [settings])


    return (
        <div className="w-100 h-130 p-4 bg-[url('/background.svg')] bg-cover bg-center">
            <div className="m-0.5 bg-white/15 p-3 rounded-sm h-full transition-opacity duration-200">

                {(screen === "loading" && <LoadingScreen />) || (screen === "settings" &&
                    <Settings setSettings={setSettings} />) || (screen === "main" && <MainScreen settings={settings!} setSettings={setSettings} />)}
            </div>

        </div>
    );
};


