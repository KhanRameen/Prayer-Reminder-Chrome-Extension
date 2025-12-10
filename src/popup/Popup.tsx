import { SelectLocation } from "../components/SelectLocation";

export default function Popup() {

    // const changeColor = async () => {
    //     console.log("Sending message to content.js");
    //     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    //     if (!tab?.id || tab.url?.startsWith("chrome://")) return
    //     chrome.tabs.sendMessage(tab.id, { action: "changeColor" });
    // };
    // const submitData = async () => {

    // }

    return (
        <div className="w-110 h-140 p-4 bg-[url('/background.svg')] bg-cover bg-center">
            <div className="m-0.5 bg-white/15 p-3 rounded-sm">

                <h1 className="text-lg font-bold mb-4">Prayer Notification</h1>
                <SelectLocation />
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
