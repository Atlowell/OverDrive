function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild);
}
var height = window.innerHeight;
if (document.querySelector("#drive_main_page").querySelector("#over_drive_frame") == null) {
    var overDriveFrame = document.createElement("div");
    overDriveFrame.innerHTML = '<iframe id="over_drive_frame" class="over_drive_frame" width="100%" height="' + height + '" scrolling="yes"></iframe>'
    prependChild(document.querySelector("#drive_main_page"), overDriveFrame);
    document.querySelector("#drive_main_page").querySelector("#over_drive_frame").src = chrome.extension.getURL("index.html");
} else  {
    window.location.reload(false); 
}