function sendMessageToContentScript() {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {

      const activeTab = tabs[0];

      const urlRegex = /^https?:\/\/(?:[\w-]+\.)+[\w-]+(?:\/[\w-./?%&=]*)?$/;
      if (!urlRegex.test(tabs[0].url)) {
        return false
      }

      if (activeTab && activeTab.id) {
        browser.tabs.sendMessage(activeTab.id, { action: "getSource" })
          .then(response => {
            regexIng(response.source);
          })
          .catch(error => {
            console.error("Error sending message:", error);
          });
      } else {
        console.error("Error getting active tab");
      }
    })
    .catch(error => {
      console.error("Error querying tabs:", error);
    });
}



// run function every url loaded
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    browser.tabs.executeScript(tabId, { file: "popup/run-script.js" })
      .then(() => {
        sendMessageToContentScript(); // sending to run script
      })
      .catch(error => {
        console.error("Error executing content script:", error);
      });
  }
});


// parsing regex into array
const regexIng = code => {
    browser.storage.local.get("data", result => {
      var data = result.data

      // check data is define or not
      if (data == undefined) {
        return false
      }

      let newData = []

      // parsing regex
      data.forEach(item => {
        const domain = Object.keys(item)[0];
        let regex = item[domain].regex
        let list = item[domain].list

        regex = new RegExp(regex, "g")
        
        let newObj = {}

        // push parse regex to list witn no duplicate
        function pushNoDuplicate(list, element) {
        
          if (!list.includes(element)) {
            list.push(element);
          }
        }

        while ((match = regex.exec(code)) !== null) {
            pushNoDuplicate(list, match[1])
        }


        newObj[domain] = {
          "regex": regex,
          "list": list
        }

        
        newData.push(newObj)
        
      });

      // set new data
      browser.storage.local.set({"data": newData})
    })
  }