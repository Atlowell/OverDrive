class Group {
    constructor(name, users) {
        this.name = name;
        this.users = users;
    }
}

class Groups {
    constructor() {
        this.groups = [new Group("test", ["claytonhenrylewis@gmail.com", "bwong14@gmail.com"])];
        this.setUpEventListeners();
        this.displayGroups();
    }

    setUpEventListeners() {
        const newGroupBtn = document.querySelector(".new-group");
        const confirmBtn = document.querySelector(".confirm");
		const addBtn = document.querySelector(".add");
        newGroupBtn.addEventListener("click", (e) => this.showHideNewGroup(e));
        confirmBtn.addEventListener("click", (e) => this.handleNewGroup(e));
		//addBtn.addEventListener("click", (e) => this.handleAddUser(e));
    }

    showHideNewGroup(e) {
        e.preventDefault();
        var newGroupUI = document.querySelector(".new-group-ui");
        if (newGroupUI.style.display == "block") {
            newGroupUI.style.display = "none";
        } else {
            newGroupUI.style.display = "block";
        }
    }

    parseUsers() {
        const usersInput = document.querySelector('.users');
        const usersString = usersInput.value;
        console.log("email string: " + usersString);
        const userEmails = usersString.split(/[\s,;]+/);
        console.log("email array length " + userEmails.length);
        for(let i = 0; i < userEmails.length; i++) {
            console.log("email array [" + i + "] " + userEmails[i]);
            if(!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmails[i]))) { // Regex for emails taken from http://emailregex.com/
                console.log("\"" + userEmails[i] + "\" is not a valid email address");
                userEmails.splice(i, 1);
                i--;
            }
        }
        return userEmails;
    }

    getGroupName() {
        const groupNameInput = document.querySelector('.groupName');
        const groupName = groupNameInput.value;
        return groupName;
    }

    newGroup(groupName, users) {
        const group = new Group(groupName, users);
        return group;
    }

    handleNewGroup(e) {
        e.preventDefault();
        this.showHideNewGroup(e);
        const groupName = this.getGroupName();
        const users = this.parseUsers();
        this.groups.push(new Group(groupName, users));
        this.displayGroups();
    }
	


    handleAddUser (e) {
        e.preventDefault();
        this.showHideNewGroup(e);
        const groupName = this.getGroupName();
        const user = this.parseUsers();
		for (var i in this.groups) {
			if (this.groups[i].name == groupName) {
				for (var j in this.groups[i].users) {
					if (this.groups[i].users[j] = user){
						return;
					}
				}
				this.groups[i].users.push(user);
				return;
			}
		}
        this.displayGroups();
    }
	
	handleRemoveUser (e) {
        e.preventDefault();
        this.showHideNewGroup(e);
        const groupName = this.getGroupName();
        const user = this.parseUsers();
		for (var i in this.groups) {
			if (this.groups[i].name == groupName) {
				for (var j in this.groups[i].users) {
					if (this.groups[i].users[j] = user){
						this.groups[i].users.splice(j,1);
						this.displayGroups();
						return;
					}
				}
				return;
			}
		}
        this.displayGroups();
    }

    displayGroups() {
        var groupsList = document.querySelector("#groups-list");
        var groupsUI = "<div id='groups-list'><ul>";
        for (var i in this.groups) {
            groupsUI += "<li data-jstree='{\"icon\":\"fa fa-users\"}'>";
            groupsUI += this.groups[i].name;
            groupsUI += "<ul>";
            for (var j in this.groups[i].users) {
                groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user\"}'>";
                groupsUI += this.groups[i].users[j];
                groupsUI += "&emsp;<button class='remove' group='"
                groupsUI += this.groups[i].name;
                groupsUI += "' user='";
                groupsUI += this.groups[i].users[j];
                groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
                groupsUI += "</li>";
            }
            groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user-plus\"}'>Add User&emsp;<button class='add' group='";
            groupsUI += this.groups[i].name;
            groupsUI += "'><i class='fa fa-plus-circle'></i></button></li></ul></li>"
        }
        groupsUI += "</ul></div>";
        groupsList.outerHTML = groupsUI;
        $('#groups-list').jstree();
    }

}

var groups = new Groups();