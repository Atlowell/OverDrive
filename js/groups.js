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
    groupsUI += "&emsp;<button class='remove' group='"
    groupsUI += group.name;
    groupsUI += "' user='";
    groupsUI += group.users[i];
    groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
    groupsUI += "</li>";
}
groupsUI += "<li>Add User&emsp;<button class='add' group='";
groupsUI += group.name;
groupsUI += "'><i class='fa fa-plus-circle'></i></button></li></ul></li></ul>";
groupsList.innerHTML = groupsUI;
$('#groups-list').jstree();