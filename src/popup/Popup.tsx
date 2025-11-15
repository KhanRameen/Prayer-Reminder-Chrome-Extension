export default function Popup() {

    const changeColor = async () => {
        console.log("Sending message to content.js");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || tab.url?.startsWith("chrome://")) return
        chrome.tabs.sendMessage(tab.id, { action: "changeColor" });
    };
    const submitData = async () => {

    }

    return (
        <div className="w-80 min-h-60 bg-amber-100 p-4">
            <h1 className="text-lg font-bold mb-4">Prayer Notification</h1>
            {/* <form onSubmit={submitData} className="w-full"> */}
            {/* <input type="text" placeholder="Country"></input> */}
            {/* <input type="text" placeholder="City"></input>
                <input type="number" placeholder="Method"></input>
                <label > School
                </label>
                <input type="radio" value={0}>Shafi</input>
                <input type="radio" value={1}>Hanafi</input>
                <button type="submit"></button> */}
            {/* </form> */}

        </div>
    );
};

