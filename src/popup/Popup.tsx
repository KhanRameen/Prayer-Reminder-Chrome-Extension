export default function Popup() {

    const changeColor = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || tab.url?.startsWith("chrome://")) return;

        chrome.tabs.sendMessage(tab.id, { action: "changeColor" });
    };

    return (
        <div className="w-[350px] h-[200px] bg-pink-700 p-4 flex flex-col items-center justify-center">
            <h1 className="text-lg font-bold mb-4">Hello React Popup!</h1>
            <button onClick={changeColor} className="font-black px-8 py-10">
                Change Background Color
            </button>
        </div>
    );
};

