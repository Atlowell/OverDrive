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
const mainPage = document.querySelector("#drive_main_page > div.a-qc-La.sd-we > div > div.a-s-tb-sc-Ja-Q.a-s-tb-sc-Ja-Q-Nm.a-s-tb-Pe-Q.a-D-Pe-Q > div > div");
mainPage.appendChild(wrapper);
var imgURL = chrome.extension.getURL("img/logo.png");
mainPage.querySelector("#logo").src = imgURL;
console.log("inject");