import { useEffect, useState } from "react";
import { SelectLocation } from "../components/SelectLocation";

export default function Popup() {
    const [mainScreen, setMainScreen] = useState(false)
    const [data, setData] = useState("")



    useEffect(() => {
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
        chrome.storage.local.get(["apiResult", "apiError"], ({ apiResult, apiError }) => {
            if (apiError) {
                setData("no")
            }
            setData("data")

        })
    }, [mainScreen])


    return (
        <div className="w-110 h-140 p-4 bg-[url('/background.svg')] bg-cover bg-center">
            <div className="m-0.5 bg-white/15 p-3 rounded-sm">

                <h1 className="text-lg font-bold mb-4">Prayer Notification</h1>
                {!mainScreen ? <SelectLocation /> : <> {data}</>}
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
