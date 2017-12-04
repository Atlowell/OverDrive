class Group {
    constructor(name, users) {
        this.name = name;
        this.users = users;
    }
}

class Groups {
    constructor() {
        this.groups = [];
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
        // e.preventDefault();
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
        for (let i = 0; i < userEmails.length; i++) {
            console.log("email array [" + i + "] " + userEmails[i]);
            if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmails[i]))) { // Regex for emails taken from http://emailregex.com/
                console.log("\"" + userEmails[i] + "\" is not a valid email address");
                userEmails.splice(i, 1);
                i--;
            }
        }
        return userEmails;
    }

    getGroupName() {
        const groupNameInput = document.querySelector('.groupName');
        var groupName = groupNameInput.value;
        if((/\s/g.test(groupName)) || (/\;/g.test(groupName)) || (/,/g.test(groupName))) {
            groupName = "";
        }
		for(let i = 0; i < this.groups.length; i++) {
			if(groupName == this.groups[i].name) {
				groupName = "";
				break;
			}
		}
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
		if(groupName == "") {
			alert("Invalid group name: Name is blank, contains invalid characters (whitespace, semicolon, or comma), or the group already exists");
			return;
		}
        const users = this.parseUsers();
        this.groups.push(new Group(groupName, users));
        this.updateGroups();
        this.updateStorage();
    }

    handleRemoveGroup(group) {
        console.log("Removing group " + group);
        //this.showHideNewGroup(e);
        //const group = this.getGroupName();
        // const users = this.parseUsers();

        for (var i in this.groups) {
            if (this.groups[i].name == group) {
                console.log(this.groups[i]);
                this.groups[i] = null;
                console.log(this.groups);

                this.groups = this.groups.filter(function(element) {
                    return element !== null;
                });
                console.log(this.groups);
                this.updateGroups();
                this.updateStorage();
                return;
            }
        }

        this.updateGroups();
        this.updateStorage();
    }



    handleAddUser(group) {


        this.showHideNewGroup();
        const user = this.parseUsers();
		if(user.length == 0) {
			alert("No valid users entered");
			return;
		}
        //const user = this.parseUsers();
        console.log("Adding " + user + " to " + group);

        for (var i in this.groups) {
            console.log(i);
            if (this.groups[i].name == group) {
                var u = 0;
                while (u < user.length) {
                    var j = 0;
                    var reset = 0;
                    while (j < this.groups[i].users.length) {
                        if (this.groups[i].users[j] == user[u]) {
                            reset = 1;

                        }
                        j++;
                    }
                    if (reset == 0) {
                        console.log("Added " + user[u] + " to " + group);
                        console.log(this.groups[i].users);
                        console.log(j);

                        this.groups[i].users[j] = user[u];
                        console.log(this.groups);

                        this.groups[i].users = this.groups[i].users.filter(function(element) {
                            return element !== undefined;
                        });
                        this.updateGroups();
                        this.updateStorage();
                    }
                    u++;
                }
                //this.updateGroups();
                //this.updateStorage();
                return;
            }
        }



    }

    handleRemoveUser(group, user) {
        //console.log(group);

        //this.showHideNewGroup(e);
        //console.log(this.groups[1].users[1]);
        console.log("Removing " + user + " from " + group);

        for (var i in this.groups) {
            //console.log(this.groups[i].name);
            if (this.groups[i].name == group) {

                var j = 0;
                while (j < this.groups[i].users.length) {

                    //console.log(user + " " + this.groups[i].users[j]);
                    if (this.groups[i].users[j] == user) {
                        console.log("Removed " + this.groups[i].users[j] + " from " + this.groups[i].name);
                        this.groups[i].users.splice(j, 1);
                        console.log(this);
                        this.updateGroups();
                        this.updateStorage();
                        return;
                    }
                    j++;
                }
                return;
            }
        }
        /*
        this.updateGroups();
		updateStorage();
		*/
    }
    // var groupsList = document.querySelector("#groups-list");
    // var btn = document.querySelector(button[group=groupname].add);'
    displayGroups(e) {
        //testStorage();
        var groupsList = document.querySelector("#groups-list");

        var groupsUI = "<div id='groups-list'><ul>";
        var that = this;

        chrome.storage.sync.get({
                list: [] //put defaultvalues if any
            },
            function(data) {
                console.log(data.list);
                //update(data.list)//storing the storage value in a variable and passing to update function
                console.log(data.list.length);
                var i = 0;
                while (i < data.list.length) {
                    var numargs = data.list[i];
                    i++;
                    var j = 0;
                    var groupName = data.list[i];

                    console.log(groupName);
                    i++;
                    j++;

                    var storedUsers = [];
                    while (j < numargs) {
                        storedUsers.push(data.list[i])
                        i++;
                        j++;

                    }
                    console.log(storedUsers);
                    if (numargs != 0) {
                        that.groups.push(new Group(groupName, storedUsers));
                    }
                }
                console.log(that);

                for (var i in that.groups) {
                    groupsUI += "<li data-jstree='{\"icon\":\"fa fa-users\"}' id='"
                    groupsUI += that.groups[i].name;
                    groupsUI += "'>";
                    groupsUI += that.groups[i].name;
                    groupsUI += "&emsp;<button class='remove-group' group='"
                    groupsUI += that.groups[i].name;
                    groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
                    groupsUI += "<ul>";


                    console.log(groupsUI);
                    //groupsUI += "&emsp;<button class="remove" group="test" ><i class="fa fa-minus-circle"></i></button>";
                    for (var j in that.groups[i].users) {

                        //var str = "";
                        //str += "Remove_"
                        //str += that.groups[i].name;
                        //str += "_"
                        //str += that.groups[i].users[j];
                        //console.log(str);	

                        groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user\"}'>";
                        groupsUI += that.groups[i].users[j];
                        groupsUI += "&emsp;<button class='remove' group='"
                        groupsUI += that.groups[i].name;
                        groupsUI += "' user='";
                        groupsUI += that.groups[i].users[j];
                        groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
                        groupsUI += "</li>";
                    }
                    groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user-plus\"}'>Add User&emsp;<button class='add' group='";
                    groupsUI += that.groups[i].name;
                    groupsUI += "'><i class='fa fa-plus-circle'></i></button></li></ul></li>"
                }
                console.log(that);
                groupsUI += "</ul></div>";
                groupsList.outerHTML = groupsUI;
                $('#groups-list').jstree();
                $("#groups-list").jstree("open_all");

                //console.log(document.querySelector("#groups-list "));
                //console.log(document.querySelector('#test_anchor'));
                //console.log(document.querySelector('button.add '));

                //var list2 = list.querySelector('#j1_2_anchor');
                //console.log(list2);
                //var list3 = list.querySelector('.remove');
                //console.log(list3);


                //sets up all buttons
                var list = document.querySelector("#groups-list");
                console.log(list);
                var first = "#j1_";
                var num = 1;
                var second = num.toString();
                var third = "_anchor";


                for (var i in that.groups) {

                    second = num.toString();
                    var req = first + second + third;
                    //console.log(req);
                    num++;
                    var list2;

                    // adding remove group button




                    console.log("Remove Buttons:");
                    for (var j in that.groups[i].users) {

                        function createRmvBtn() {
                            var btn;
                            second = num.toString();
                            req = first + second + third;
                            //console.log(req);
                            list2 = list.querySelector(req);
                            //console.log(list2);
                            btn = list2.querySelector('.remove');
                            console.log(btn);
                            console.log(btn.getAttribute('group'));
                            console.log(btn.getAttribute('user'));
                            btn.addEventListener("click", (e) => that.handleRemoveUser(btn.getAttribute('group'), btn.getAttribute('user')));
                        }
                        createRmvBtn();
                        num++;
                    }

                    function createAddBtn() {
                        var btn;
                        console.log("Add button");
                        second = num.toString();
                        req = first + second + third;
                        //console.log(req);
                        //console.log(list.querySelector(req));
                        list2 = list.querySelector(req)
                        btn = list2.querySelector('.add')
                        console.log(btn);
                        btn.addEventListener("click", (e) => that.handleAddUser(btn.getAttribute('group')));
                    }
                    createAddBtn();
                    num++;
                }
                var removeGroupBtns = document.querySelectorAll('.remove-group');
                i = 0;
                while (i < removeGroupBtns.length) {
                    function createRmvGrpBtn(btn) {

                        console.log(btn);
                        btn.addEventListener("click", (e) => that.handleRemoveGroup(btn.getAttribute('group')));
                        console.log(i);

                    }

                    createRmvGrpBtn(removeGroupBtns[i]);

                    i++;
                }


            }
        );
        console.log(this);

    }



    updateGroups() {
        var groupsList = document.querySelector("#groups-list");
        var groupsUI = "<div id='groups-list'><ul>";
        var that = this;
        for (var i in that.groups) {
            groupsUI += "<li data-jstree='{\"icon\":\"fa fa-users\"}' id='"
            groupsUI += that.groups[i].name;
            groupsUI += "'>";
            groupsUI += that.groups[i].name;
            groupsUI += "&emsp;<button class='remove-group' group='"
            groupsUI += that.groups[i].name;
            groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
            groupsUI += "<ul>";
            for (var j in that.groups[i].users) {
                groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user\"}'>";
                groupsUI += that.groups[i].users[j];
                groupsUI += "&emsp;<button class='remove' group='"
                groupsUI += that.groups[i].name;
                groupsUI += "' user='";
                groupsUI += that.groups[i].users[j];
                groupsUI += "'><i class='fa fa-minus-circle'></i></button>";
                groupsUI += "</li>";
            }
            groupsUI += "<li data-jstree='{\"icon\":\"fa fa-user-plus\"}'>Add User&emsp;<button class='add' group='";
            groupsUI += that.groups[i].name;
            groupsUI += "'><i class='fa fa-plus-circle'></i></button></li></ul></li>"
        }
        console.log(that);
        groupsUI += "</ul></div>";
        groupsList.outerHTML = groupsUI;
        $('#groups-list').jstree();
        $("#groups-list").jstree("open_all");


        //sets up all buttons
        numTrees++;
        var list = document.querySelector("#groups-list");
        console.log(list);
        var first = "#j" + numTrees.toString() + "_";
        var num = 1;
        var second = num.toString();
        var third = "_anchor";

        for (var i in that.groups) {

            second = num.toString();
            var req = first + second + third;
            console.log(req);
            num++;
            var list2;

            console.log("Remove Buttons:");
            for (var j in that.groups[i].users) {

                function createRmvBtn() {
                    var btn;
                    second = num.toString();
                    req = first + second + third;
                    //console.log(req);
                    list2 = list.querySelector(req)
                    //console.log(list2);
                    btn = list2.querySelector('.remove');
                    console.log(btn);
                    console.log(btn.getAttribute('group'));
                    console.log(btn.getAttribute('user'));
                    btn.addEventListener("click", (e) => that.handleRemoveUser(btn.getAttribute('group'), btn.getAttribute('user')));
                }
                createRmvBtn();
                num++;
            }

            function createAddBtn() {
                var btn;
                console.log("Add button");
                second = num.toString();
                req = first + second + third;
                //console.log(req);
                //console.log(list.querySelector(req));
                list2 = list.querySelector(req)
                btn = list2.querySelector('.add')
                console.log(btn);
                btn.addEventListener("click", (e) => that.handleAddUser(btn.getAttribute('group')));
            }
            createAddBtn();
            num++;
        }
    }

    updateStorage() {
        var arr = [];

        var i = 0;
        var j = 0;
        var k = 0;

        //console.log(this.groups.length);
        var that = this;
        for (var i in that.groups) {
            //console.log(i +  " " + j);
            j = 0;

            var count = that.groups[i].users.length + 1;
            arr.push(count);
            arr.push(that.groups[i].name);

            while (j < that.groups[i].users.length) {
                console.log(i + " " + j);
                console.log(that.groups[i].users[j]);
                arr.push(that.groups[i].users[j]);
                j++;
            }

            i++;

        }


        var removeGroupBtns = document.querySelectorAll('.remove-group');
        i = 0;
        while (i < removeGroupBtns.length) {
            function createRmvGrpBtn(btn) {

                console.log(btn);
                btn.addEventListener("click", (e) => that.handleRemoveGroup(btn.getAttribute('group')));
                console.log(i);

            }

            createRmvGrpBtn(removeGroupBtns[i]);

            i++;
        }

        console.log("Storage");
        console.log(arr);

        chrome.storage.sync.set({
            list: arr
        }, function() {
            console.log("added to list storage");
        });


    }

}


function testVals() {
    console.log("Vals");
    console.log(this.groups);
}

function testStorage() {
    var groupStorage = ["3", "Group1", "bwong14@gmail.com", "claytonhenrylewis@gmail.com", "3", "Group2", "atlowell42@gmail.com", "samrobf30@gmail.com", "0"];
    chrome.storage.sync.set({
        list: groupStorage
    }, function() {
        console.log("added to list");
    });


}



function testGet() {
    chrome.storage.sync.get({
            list: [] //put defaultvalues if any
        },
        function(data) {
            console.log(data.list);
            //update(data.list)//storing the storage value in a variable and passing to update function
        }
    );
}

function testMain() {

}



function update(array) {
    array.push("testAdd");
    //then call the set to update with modified value
    chrome.storage.sync.set({
        list: array
    }, function() {
        console.log("added to list with new values");
    });
}



var numTrees = 1;
var groups = new Groups();