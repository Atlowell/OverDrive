function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild);
}

if (document.querySelector("#drive_main_page").querySelector("#over_drive_frame") == null) {
    var overDriveFrame = document.createElement("div");
    overDriveFrame.innerHTML = '<iframe id="over_drive_frame" class="over_drive_frame" width="100%" height="1024"></iframe>'
    prependChild(document.querySelector("#drive_main_page"), overDriveFrame);
    document.querySelector("#drive_main_page").querySelector("#over_drive_frame").src = chrome.extension.getURL("index.html");
} else if (document.querySelector("#drive_main_page").querySelector("#over_drive_frame").height > 0) {
    document.querySelector("#drive_main_page").querySelector("#over_drive_frame").height = 0;
} else if (document.querySelector("#drive_main_page").querySelector("#over_drive_frame").height == 0) {
    document.querySelector("#drive_main_page").querySelector("#over_drive_frame").height = 1024;
}