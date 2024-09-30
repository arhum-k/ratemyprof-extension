chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")
        const urlParameters = new URLSearchParams(queryParameters)
        console.log(urlParameters)

        // send message to content script -- could be anything
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("V")
        })
    }
})