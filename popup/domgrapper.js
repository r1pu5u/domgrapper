const toggleBtn = document.getElementById('add');
const formInput = document.querySelector('.form-input');

const popup = document.getElementById('popup-content')


toggleBtn.addEventListener('click', () => {
  if (formInput.style.display === 'none') {
    formInput.style.display = 'block';
    toggleBtn.textContent = 'Close';
    toggleBtn.classList.remove('add-btn');
    toggleBtn.classList.add('close-btn');
  } else {
    formInput.style.display = 'none';
    toggleBtn.textContent = 'add';
    toggleBtn.classList.remove('close-btn');
    toggleBtn.classList.add('add-btn');
  }
});

const save = document.getElementById('save')

save.addEventListener('click', () => {
  var domain = document.getElementById('domain').value
  var regex = document.getElementById('regex').checked

  const pattern = `(https?:\\/\\/(.+?\\.)?${domain}(\\/[A-Za-z0-9\\-._~:/?#[\\]@!$&'()*+,;=]*)?)`;

  if (regex == "regex") {
    regex = domain
  } else {
    regex = pattern
  }

  document.getElementById('domain').value = ""

  browser.storage.local.get("data", result => {
    let data = []
    const res = result.data

    if (res != undefined) {
      data = res
    }
  
    let myObj = {}
    myObj[domain] = {
      "regex": regex,
      "list": []
    }

    data.push(myObj)
    

    browser.storage.local.set({"data": data})
    loopButton()
  })

})

const popupContent = document.querySelector("#popup-content");
popupContent.addEventListener("click", (event) => {
  if (event.target.classList.contains("count-btn")) {
    const url = event.target.getAttribute("data-domain");
    
    browser.storage.local.get("data", result => {
      data = result.data

      data.forEach(item => {
        const domain = Object.keys(item)[0];
        if (domain != url) {
          return false
        }

        let list = item[domain].list

        if (list.length == 0) {
          return false
        }

        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
          browser.tabs.sendMessage(tabs[0].id, list);
        });
        
      })
    })
  }
});

function sanitize(value) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return String(value).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

const loopButton = () => {

  browser.storage.local.get("data", result => {
    data = result.data

    if (data == undefined) {
      return false
    }
    let button = ""

    data.forEach(item => {
      const domain = Object.keys(item)[0];
      let list = item[domain].list

      button += `<button class="count-btn" data-domain="${sanitize(domain)}">
      ${sanitize(domain)}<span class="count-badge">${list.length}</span>`
    })

    popup.innerHTML = button
  })
}

const resets = document.getElementById("resets")

resets.addEventListener('click', () => {
  browser.storage.local.set({"data": undefined})
  popup.innerHTML = ""
})

// Call the function every second using setInterval()
var intervalID = setInterval(loopButton, 1000);

function shutdown() {
  clearInterval(intervalID);
}

if (browser.runtime) {
  browser.runtime.onMessage.addListener(function(message) {
    if (message === "shutdown") {
      shutdown();
    }
  });
}


