function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild);
}

const mainPage = document.querySelector("#drive_main_page");
var overDriveFrame = document.createElement("div");
overDriveFrame.innerHTML = '<iframe id="over_drive_frame" class="over_drive_frame" width="100%" height="512"></iframe>'
prependChild(mainPage, overDriveFrame);
var frameURL = chrome.extension.getURL("index.html");
mainPage.querySelector("#over_drive_frame").src = frameURL;