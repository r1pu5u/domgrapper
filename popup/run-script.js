
// Listen for the "message" event and show catch regex
browser.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(message) {
  if (Array.isArray(message)) {
    const receivedArray = message;
    receivedArray.forEach(item => {
      console.log(item)
    })
  }
}

// get source HTML
function getPageSource() {
  return document.documentElement.outerHTML;
}

// send back get source HTML to background.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSource") {
    let source = ""

    source += document.documentElement.innerHTML;

    source += getPageSource();
    sendResponse({source: source});
  }
})
