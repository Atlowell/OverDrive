class Group {
    constructor(name, users) {
        this.name = name;
        this.users = users;
    }
}

var group = new Group("test1", ["claytonhenrylewis@gmail.com", "bwong14@gmail.com"]);

var groupsList = document.querySelector("#groups-list");
var groupsUI = "<ul>";
groupsUI += "<li>";
groupsUI += group.name;
groupsUI += "<ul>";
for (i in group.users) {
    groupsUI += "<li>";
    groupsUI += group.users[i];
    groupsUI += "</li>";
}
groupsUI += "</ul></li>";
groupsUI += "</ul>";
groupsList.innerHTML = groupsUI;
$('#groups-list').jstree();