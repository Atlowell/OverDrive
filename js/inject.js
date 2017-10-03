function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild);
}

var wrapper = document.createElement("div");
wrapper.innerHTML = '\
  <div class="grid-container">\
  <div class="grid-x grid-padding-x">\
      <div class="large-12 cell">\
          <img id="logo" height="128">\
      </div>\
  </div>\
  </div>\
';
const mainPage = document.querySelector("#drive_main_page");
//mainPage.appendChild(wrapper);
prependChild(mainPage, wrapper);
var imgURL = chrome.extension.getURL("img/logo.png");
mainPage.querySelector("#logo").src = imgURL;
console.log("inject");