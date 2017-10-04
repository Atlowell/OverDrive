function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild);
}

var wrapper = document.createElement("div");
wrapper.innerHTML = '\
  <div class="grid-container">\
  <div class="grid-x grid-padding-x">\
      <div class="large-12 cell">\
          <img id="logo" height="64">\
      </div>\
  </div>\
  </div>\
';
wrapper.innerHTML = '<iframe id="extFrame" class="over_drive_frame" width="100%"></iframe>'
const mainPage = document.querySelector("#drive_main_page");
//mainPage.appendChild(wrapper);
prependChild(mainPage, wrapper);
//var imgURL = chrome.extension.getURL("img/logo.png");
//mainPage.querySelector("#logo").src = imgURL;
var frameURL = chrome.extension.getURL("index.html");
mainPage.querySelector("#extFrame").src = frameURL;
console.log("inject");