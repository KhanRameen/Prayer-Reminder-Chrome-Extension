import { useEffect, useState } from "react";
import { SelectLocation } from "../components/SelectLocation";
import { MainScreen } from "@/components/MainScreen";

export default function Popup() {
    const [mainScreen, setMainScreen] = useState(false)
    const [data, setData] = useState("")

    useEffect(() => {
        console.log("popup prayer setting use effect")
        chrome.storage.local.get("prayerSettings", (res) => {
            if (!res.prayerSettings) {
                setMainScreen(false)
            }
            else {
                setMainScreen(true)
            }
        })
    }, [])

    useEffect(() => {
        console.log("popup api use effect")
        chrome.storage.local.get(["apiResult", "apiError"], ({ apiResult, apiError }) => {
            if (apiError) {
                setData("no")
            }
            setData("data")

        })
    }, [mainScreen])


    return (
        <div className="w-110 h-140 p-4 bg-[url('/background.svg')] bg-cover bg-center">
            <div className="m-0.5 bg-white/15 p-3 rounded-sm h-full">
                {/* todo: maintain state/ find a way to show main screen when you hit save.. currently not showing */}
                {!mainScreen ? <SelectLocation /> : <> <MainScreen /></>}
                {/* <MainScreen /> */}
            </div>

        </div>
    );
};
//todo: add a name to the extention



//flow
//Data needed...
// prayer time (object) => data.timings,
// Hijri Date => data.hijri.date,
//Islamic Month =>data.month.en
//Show City => user's Data => store in local storage
