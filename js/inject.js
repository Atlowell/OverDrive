var wrapper = document.createElement("div");
wrapper.innerHTML = '\
  <div class="grid-container">\
  <div class="grid-x grid-padding-x">\
      <div class="large-12 cell">\
          <img id="logo">\
      </div>\
  </div>\
  </div>\
';
document.body.appendChild(wrapper);
var imgURL = chrome.extension.getURL("img/logo.png");
document.getElementById("logo").src = imgURL;
console.log("inject");