//$(document).foundation();

var count = 0;

// File structure
// No default values because every file needs a name and a file ID
class File{
	constructor(fid, name, folder) {
  	this.fid = fid;
    this.name = name;
	  this.folder = folder;
	  this.checked = false;
  }
}

// Node structure
// Default values: 
// File: null
// parent: null
// children: []
class Node{
  constructor(file, parent, children) {
    this.file = file;
    this.parent = parent;
    this.children = children;
  }
}

// Tree Root structure
// _root will always be the root node, with all default values.
class TreeRoot{
  constructor(nodes) {
    this._root = new Node(new File(), null, []);
    for (var i = 0; i < nodes.length; i++) {
    	this.insert(nodes[i], this._root)
    }
    this.isvalid = "it's the right one!";
  }

  // Recursive depth-first traversal. callback is intended as a function paremeter
  // calls callback with one parameter: the current node.
  DFtraversal(callback) {
    //declare and immediately call our recursive function on the current node
    (function recursive(currNode) {

        //iterate on its children and call our recursive function on them
        for (var i = 0; i < currNode.children.length; i++) {
          recursive(currNode.children[i]);
        }

        //call our callback function on the node once it has no more children to go to
        callback(currNode);
    })(this._root); //passing to recursive as initial parameter the _root node
  }
  
  // Insert a file as a child to a parent node
  // both file and parent are taken in assuming they're node objects
  insert(childnode, parentnode) {
    
	childnode.parent = parentnode;
	parentnode.children.push(childnode);
    //declaring necessary variables/functions
	//console.log("inserted " + file.name, + ", parent: " + );
    /*var cur_parent = null
    var callback = function(node) {
    //console.log(node)
    // console.log("node:" + node.file.fid + ", parent:" + parentid)
      if (node.file.fid === parentid.file.id) {
        cur_parent = node;
        //console.log("node:" + node.file.fid + ", parent:" + parentid)
      }
    };

    //DF traversal to find the parent
    this.DFtraversal(callback);

    //if parent was found, insert file into its children[]
    if (cur_parent) {
    	file.parent = cur_parent;
      cur_parent.children.push(file);
    } else {
       throw new Error('Cannot add node to a non-existent parent.');
    }*/
  }
  
  printTree(node, cnt) {
	//console.log("node = " + node);
	if(node == this._root) {
		console.log("Printing tree:")
	}
	else {
		var str = "";
		for(var i = 0; i < cnt; i++) {
			str = str + " ";
		}
		console.log(str + node.file.name);
	}
	for(var i = 0; i < node.children.length; i++) {
		this.printTree(node.children[i], cnt+1);
	}
  }
};

class OverDrive{
	
  //var tree;
	
  constructor(gapi) {
    this.gapi = gapi;
    this.tree = new TreeRoot([]);
    this.numrequests = 0;
    this.numcalls = 0;
      //this.startedtopopulate = false;
      //this.lockrequests = false;
      //this.lockitems = false;
      //console.log(this.tree);
    this.populateTree(); // ASYNC!
    this.setUpEventListeners();
    $('.permissions-box .file').jstree();
  }
  
  triggerDisplayTree() {
    //console.log("numrequests: " + this.numrequests + ", numcalls: " + this.numcalls);
    if((this.numrequests == 0) && (this.numcalls == 0)) {
      this.displayTree();
      this.setUpEventListeners();
    }
  }
  
  triggerAddUsers(args) {
    console.log("triggering add users check");
    //console.log(args);
    if((args.numrequests == 0) && (args.numcalls == 0)) {
        args.that.addUsers(args);
    }
  }
  
  //Add appropriate event listeners to action buttons
  setUpEventListeners() {
    const actionsForm = document.querySelector('form#actions');
    const addUsersBtn = actionsForm.querySelector('.add-users');
    const removeUsersBtn = actionsForm.querySelector('.remove-users');
    const changeOwnerBtn = actionsForm.querySelector('.change-owner');
    const changePermBtn = actionsForm.querySelector('.change-permissions');
    addUsersBtn.addEventListener('click', (e) => this.handleAddUsers(e));
    removeUsersBtn.addEventListener('click', (e) => this.handleRemoveUsers(e));
    changeOwnerBtn.addEventListener('click', (e) => this.handleChangeOwner(e));
    changePermBtn.addEventListener('click', (e) => this.handleChangePermissions(e));
    document.addEventListener('mousemove', (e) => this.displayPermissions(e));
  }
  
  displayPermissions(e) {
    e.preventDefault();
    const permissionsBox = document.querySelector('.permissions-box');
    permissionsBox.style.left = (e.pageX + 5) + 'px';
    permissionsBox.style.top = (e.pageY + 5) + 'px';
  }
  
  // Will only get permissions from files below those folders that are checked
  // permid - the permission id of the user you want to check
  // num - the array index of the tree array (see args.rt)
  // cb - the check function that is executed (example: triggerAddUsers)
  // args - an object containing arguments for the callback - some of these arguments are also used by this function, and thus must be defined:
        // args.numrequests - Counter detailing the number of currently pending requests sent.  Usually 0 at beginning
        // args.numcalls - Counter detailing the number of times the getPermissiontree has been called.  Usually the number of trees at the beginning
        // args.rt - array of trees.  It is assumed that args.rt[num] is not out of bounds
  getPermissionTree(permid, num, cb, args) {
    console.log("entering gpt");
    //console.log(args);
    var root = {
        parent: null,
        children: [],
        value: null
    }
    
    function gptRecurse(permid, node1, node2, initchk, cb, args) {
        console.log("entering gptrecurse");
        
        //console.log(args);
        for(let i = 0; i < node1.children.length; i++) {
            let tempnode = {
                parent: node2,
                children: [],
                value: undefined
            }
            node2.children.push(tempnode);
            // initchk checked
            // false false = nothing
            // false true = set initchk
            // true false = request (can set initchk)
            // true true = nothing (can set initchk)
            let initchk2 = initchk;
            if(node1.children[i].file.checked) {
                initchk2 = true;
            }
            else if(initchk) {
                identityAuth(function(token) {
                    console.log("getting permissions for " + node1.children[i].file.name);
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node1.children[i].file.fid) + "/permissions/" + encodeURIComponent(permid));
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.responseType = "json";
                    xhr.onload = function() {
                        if(xhr.status == 404) {
                            console.log("404 permission not found (file is not shared with user or invalid permid)");
                            tempnode.value = "none";
                        }
                        else {
                            if(xhr.status != 200) {
                                console.log(xhr.response);
                            }
                            tempnode.value = xhr.response.role;
                            if(tempnode.value == "reader") {
                                if(xhr.response.additionalRoles) {
                                    tempnode.value == "commenter";
                                }
                            }
                        }
                        args.numrequests--;
                        cb(args);
                    };
                    xhr.onerror = function() {
                        console.log(xhr.error);
                    };
                    xhr.send();
                });
                args.numrequests++;
            }
            gptRecurse(permid, node1.children[i], tempnode, initchk2, cb, args);
        }
    }
    
    gptRecurse(permid, this.tree._root, root, false, cb, args);
    args.rt[num] = root;
    args.numcalls--;
    cb(args);
  }
  
  addUsers(args) {
    var users = args.users;
    var userids = args.userids;
    var role = args.role;
    var rt = args.rt;
    var that = args.that;
	  /*var filelist = [];
    this.tree.DFtraversal(function(node) {
		  if(node.file.checked) {
			  filelist.push(node.file.fid);
		  }
	  });
    console.log(filelist);*/
	this.tree.DFtraversal(function(node) {
        if(node.file.name == "folder2") {
            node.file.checked = true;
        }
        else if(node.file.name == "file1") {
            node.file.checked = true;
        }
    });
    
	var newrole = role;
	var com = false;
	if(newrole == "commenter") {
		com = true;
		newrole = "reader";
	}
    
    //Initial values:
        // node = child of root
        // usernum = 0
        // chk = whether child of root is checked
        // initchk = false
        // perm = array of permission nodes for each user corresponding to node
    function userrecurse(node, perm, usernum, chk, initchk) {
        if(chk) {
            identityAuth(function(token) { 
                var xhr = new XMLHttpRequest();
                //console.log("fid: " + encodeURIComponent(filelist[i]));
                var body = {
                    'role': newrole,
                    'type': "user",
                    'value': users[usernum]
                }
                //Commenter role is not valid for a folder.  Give it reader instead
                if((com) && (!node.file.folder)) {
                    body.additionalRoles = ["commenter"];
                }
                
                xhr.open('POST', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions" + "?sendNotificationEmails=false");
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                xhr.responseType = "json";
                xhr.onload = function() {
                    if(xhr.status != 200) {
                        console.log(xhr.response);
                    }
                    console.log("permission added to " + node.file.name);
                    //console.log(xhr.response);
                    if(!initchk) {
                        if((usernum + 1) < users.length) {
                            userrecurse(node, perm, usernum + 1, chk, initchk);
                        }
                    }
                    for(let i = 0; i < node.children.length; i++) {
                        let chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        let permarr = [];
                        for(let j = 0; j < users.length; j++) {
                            permarr.push(perm[j].children[i]); 
                        }
                        userrecurse(node.children[i], permarr, usernum, chk2, true);
                    }
                };
                xhr.onerror = function() {
                    console.log(xhr.error);
                };
                xhr.send(JSON.stringify(body));
                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            });
        }
        else {
            // TODO: Restore the previous permissions
            if(initchk) {
                // oldrole:
                    // owner
                    // writer
                    // commenter
                    // reader
                    // none
                // newrole:
                    // writer
                    // commenter
                    // reader
                
                // Discard cases: oldrole newrole
                // same permissions - overwriting won't do anything
                    // writer writer
                    // commentor commenter
                    // viewer viewer
                // old > new - overwriting won't do anything
                    // owner writer
                    // owner commenter
                    // owner reader
                    // writer commenter
                    // writer viewer
                    // commenter viewer
                // viewer commenter - adding commenter to folders adds viewer, since commenter isn't a valid role for folders, thus it propogates changes like viewer
                    // viewer commenter
                
                // Remove cases: oldrole newrole
                // oldrole = none - Didn't already exist, so was just added
                    // none writer
                    // none commenter
                    // none viewer
                
                // Restore cases: oldrole newrole
                // new > old (excepting viewer commenter) - Overwritten by new role
                    // commenter writer
                    // viewer writer
                
                var oldrole = perm[usernum].value;
                if(oldrole == "none") {
                    // Remove
                    identityAuth(function(token) {
                        console.log("sending delete request on " + node.file.name);
                        var xhr = new XMLHttpRequest();
                        xhr.open('DELETE', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        xhr.responseType = "json";
                        xhr.onload = function() {
                            if(xhr.status != 200) {
                                console.log(xhr.response);
                            }
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                let permarr = [];
                                for(let j = 0; j < users.length; j++) {
                                    permarr.push(perm[j].children[i]); 
                                }
                                userrecurse(node.children[i], permarr, usernum, chk2, true);
                            }
                        };
                        xhr.onerror = function() {
                            console.log(xhr.error);
                        };
                        xhr.send();
                    });
                }
                else if((newrole == "writer") && ((oldrole == "reader") || (oldrole == "commenter"))) {
                    // Restore
                    identityAuth(function(token) {
                        
                        var body = {
                            role: oldrole
                        }
                        if(oldrole == "commenter") {
                            body.additionalRoles = ["commenter"];
                            body.role = "reader";
                        }
                        
                        var xhr = new XMLHttpRequest();
                        xhr.open('PUT', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                        xhr.responseType = "json";
                        xhr.onload = function() {
                            if(xhr.status != 200) {
                                console.log(xhr.response);
                            }
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                let permarr = [];
                                for(let j = 0; j < users.length; j++) {
                                    permarr.push(perm[j].children[i]); 
                                }
                                userrecurse(node.children[i], permarr, usernum, chk2, true);
                            }
                        };
                        xhr.onerror = function() {
                            console.log(xhr.error);
                        };
                        xhr.send(JSON.stringify(body));
                    });
                }
                else {
                    // No restore needed
                    for(let i = 0; i < node.children.length; i++) {
                        let chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        let permarr = [];
                        for(let j = 0; j < users.length; j++) {
                            permarr.push(perm[j].children[i]); 
                        }
                        userrecurse(node.children[i], permarr, usernum, chk2, true);
                    }
                }  
            }
            else {
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    let permarr = [];
                    for(let j = 0; j < users.length; j++) {
                        permarr.push(perm[j].children[i]); 
                    }
                    userrecurse(node.children[i], permarr, 0, chk2, false);
                }
            }
        }
    }
    
	//console.log(body);
    for(let i = 0; i < that.tree._root.children.length; i++) {
        let chk = false;
        if(that.tree._root.children[i].file.checked == true) {
            chk = true;
        }
        let permarr = [];
        for(let j = 0; j < users.length; j++) {
            permarr.push(rt[j].children[i]); 
        }
        userrecurse(that.tree._root.children[i], permarr, 0, chk, false);
    }
        /*for(var i = 0; i < filelist.length; i++) {
            for(var j = 0; j < users.length; j++) {
                //body.value = users[j];
                body.value = users[j];
                //console.log(users[j]); */
                /*var request = this.gapi.client.drive.permissions.insert({
                    'fid': filelist[i],
                    'resource': body,
                    'sendNotificationEmails': false
                });
                request.execute(function(reponse) {
                    if(response.error) {
                        console.log("Error with inserting permission");
                    }
                });*/

                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            /*}
        } */
  }
  
  handleAddUsers(e) {
    e.preventDefault();
    const users = this.parseUsers();
    for(var i = 0; i < users.length; i++) {
        console.log("user" + i + ": " + users[i]);
    }
    const role = this.getRoleFromUI();
    var that = this;
    var args = {
        users: users,
        userids: [],
        role: role,
        rt: [],
        numcalls: users.length,
        numrequests: 0,
        that: that
    }
    for(let i = 0; i < users.length; i++) {
        args.rt.push(undefined);
        args.userids.push(undefined);
        identityAuth(function(token) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://www.googleapis.com/drive/v2/permissionIds/" + encodeURIComponent(users[i]));
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.responseType = "json";
            xhr.onload = function() {
                if(xhr.status != 200) {
                    console.log(xhr.response);
                }
                //console.log(xhr.response);
                var permid = xhr.response.id; // = response permid
                args.userids[i] = permid;
                console.log("permid before entering: " + permid);
                that.getPermissionTree(permid, i, that.triggerAddUsers, args);
            };
            xhr.onerror = function() {
                console.log(xhr.error);
            };
            xhr.send();
        });
    }
  }

  handleRemoveUsers(e) {
    e.preventDefault();
    const users = this.parseUsers();
    const role = this.getRoleFromUI();
    var that = this;
    var filelist = [];
    this.tree.DFtraversal(function(node) {
        if(node.file.checked) {
		    filelist.push(node.file.fid);
	    }
    });
        
    //Initial values:
        // node = child of root
        // usernum = 0
        // chk = whether child of root is checked
        // initchk = false
    function userrecurse(node, usernum, chk, initchk) {
        if(chk) {
            identityAuth(function(token) { 
                var xhr = new XMLHttpRequest();
                //console.log("fid: " + encodeURIComponent(filelist[i]));
                var body = {
                    'role': newrole,
                    'type': "user",
                    'value': users[usernum]
                }
                var filetoremove = filelist.pop();
                xhr.open('DELETE', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(filetoremove.node.file.fid));
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                xhr.onload = function() {
                    //console.log(xhr.response);
                    //if(!initchk) {
                     //   if((usernum + 1) < users.length) {
                     //       userrecurse(node, usernum + 1, chk, initchk);
                      //  }
                  //  }
                    for(var i = 0; i < filetoremove.children.length; i++) {
                        var chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        userrecurse(node.children[i], usernum, chk2, true);
                    }
                };
                xhr.onerror = function() {
                    console.log(xhr.error);
                };
                xhr.send(JSON.stringify(body));
                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            });
        }
 
    }
    
	//console.log(body);
    

  }


  handleChangeOwner(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get checked file(s) from tree
    //call createOwner for given files and users
  }

  handleChangePermissions(e) {
    e.preventDefault();
    const users = this.parseUsers();
    for(var i = 0; i < users.length; i++) {
        console.log("user" + i + ": " + users[i]);
    }
    const role = this.getRoleFromUI();
    var that = this;
    var args = {
        users: users,
        userids: [],
        role: role,
        rt: [],
        numcalls: users.length,
        numrequests: 0,
        that: that
    }
    for(let i = 0; i < users.length; i++) {
        args.rt.push(undefined);
        args.userids.push(undefined);
        identityAuth(function(token) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://www.googleapis.com/drive/v2/permissionIds/" + encodeURIComponent(users[i]));
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.responseType = "json";
            xhr.onload = function() {
                if(xhr.status != 200) {
                    console.log(xhr.response);
                }
                //console.log(xhr.response);
                var permid = xhr.response.id; // = response permid
                args.userids[i] = permid;
                console.log("permid before entering: " + permid);
                that.getPermissionTree(permid, i, that.triggerChangePermissions, args);
            };
            xhr.onerror = function() {
                console.log(xhr.error);
            };
            xhr.send();
        });
    }
  }

  triggerChangePermissions(args) {
    console.log("triggering changePermissions check");
    //console.log(args);
    if((args.numrequests == 0) && (args.numcalls == 0)) {
        args.that.changePermissions(args);
    }
  }

  changePermissions(args) {
    var users = args.users;
    var userids = args.userids; //permissions ids
    var role = args.role;
    var rt = args.rt;
    var that = args.that;
	  /*var filelist = [];
    this.tree.DFtraversal(function(node) {
		  if(node.file.checked) {
			  filelist.push(node.file.fid);
		  }
	  });
    console.log(filelist);*/
	this.tree.DFtraversal(function(node) {
        if(node.file.name == "folder2") {
            node.file.checked = true;
        }
        else if(node.file.name == "file1") {
            node.file.checked = true;
        }
    });
    
	var newrole = role;
	var com = false;
	if(newrole == "commenter") {
		com = true;
		newrole = "reader";
	}
    
    //Initial values:
        // node = child of root
        // usernum = 0
        // chk = whether child of root is checked
        // initchk = false
        // perm = array of permission nodes for each user corresponding to node
    function userrecurse(node, perm, usernum, chk, initchk) {
        if(chk) {
            identityAuth(function(token) { 
                var xhr = new XMLHttpRequest();
                //console.log("fid: " + encodeURIComponent(filelist[i]));
                var body = {
                    'role': newrole,
                    'type': "user",
                    'value': users[usernum]
                }
                //Commenter role is not valid for a folder.  Give it reader instead
                if((com) && (!node.file.folder)) {
                    body.additionalRoles = ["commenter"];
                }
                
                xhr.open('PUT', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                xhr.responseType = "json";
                xhr.onload = function() {
                    if(xhr.status != 200) {
                        console.log(xhr.response);
                    }
                    console.log("permission added to " + node.file.name);
                    //console.log(xhr.response);
                    if(!initchk) {
                        if((usernum + 1) < users.length) {
                            userrecurse(node, perm, usernum + 1, chk, initchk);
                        }
                    }
                    for(let i = 0; i < node.children.length; i++) {
                        let chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        let permarr = [];
                        for(let j = 0; j < users.length; j++) {
                            permarr.push(perm[j].children[i]); 
                        }
                        userrecurse(node.children[i], permarr, usernum, chk2, true);
                    }
                };
                xhr.onerror = function() {
                    console.log(xhr.error);
                };
                xhr.send(JSON.stringify(body));
                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            });
        }
        else {
            // TODO: Restore the previous permissions
            if(initchk) {
                // oldrole:
                    // owner
                    // writer
                    // commenter
                    // reader
                    // none
                // newrole:
                    // writer
                    // commenter
                    // reader
                
                // Discard cases: oldrole newrole
                // same permissions - overwriting won't do anything
                    // writer writer
                    // commentor commenter
                    // viewer viewer
                // old > new - overwriting won't do anything
                    // owner writer
                    // owner commenter
                    // owner reader
                    // writer commenter
                    // writer viewer
                    // commenter viewer
                // viewer commenter - adding commenter to folders adds viewer, since commenter isn't a valid role for folders, thus it propogates changes like viewer
                    // viewer commenter
                
                // Remove cases: oldrole newrole
                // oldrole = none - Didn't already exist, so was just added
                    // none writer
                    // none commenter
                    // none viewer
                
                // Restore cases: oldrole newrole
                // new > old (excepting viewer commenter) - Overwritten by new role
                    // commenter writer
                    // viewer writer
                
                var oldrole = perm[usernum].value;
                if(oldrole == "none") {
                    // Remove
                    identityAuth(function(token) {
                        console.log("sending delete request on " + node.file.name);
                        var xhr = new XMLHttpRequest();
                        xhr.open('DELETE', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        xhr.responseType = "json";
                        xhr.onload = function() {
                            if(xhr.status != 200) {
                                console.log(xhr.response);
                            }
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                let permarr = [];
                                for(let j = 0; j < users.length; j++) {
                                    permarr.push(perm[j].children[i]); 
                                }
                                userrecurse(node.children[i], permarr, usernum, chk2, true);
                            }
                        };
                        xhr.onerror = function() {
                            console.log(xhr.error);
                        };
                        xhr.send();
                    });
                }
                else if((newrole == "writer") && ((oldrole == "reader") || (oldrole == "commenter"))) {
                    // Restore
                    identityAuth(function(token) {
                        
                        var body = {
                            role: oldrole
                        }
                        if(oldrole == "commenter") {
                            body.additionalRoles = ["commenter"];
                            body.role = "reader";
                        }
                        
                        var xhr = new XMLHttpRequest();
                        xhr.open('PUT', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                        xhr.responseType = "json";
                        xhr.onload = function() {
                            if(xhr.status != 200) {
                                console.log(xhr.response);
                            }
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                let permarr = [];
                                for(let j = 0; j < users.length; j++) {
                                    permarr.push(perm[j].children[i]); 
                                }
                                userrecurse(node.children[i], permarr, usernum, chk2, true);
                            }
                        };
                        xhr.onerror = function() {
                            console.log(xhr.error);
                        };
                        xhr.send(JSON.stringify(body));
                    });
                }
                else {
                    // No restore needed
                    for(let i = 0; i < node.children.length; i++) {
                        let chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        let permarr = [];
                        for(let j = 0; j < users.length; j++) {
                            permarr.push(perm[j].children[i]); 
                        }
                        userrecurse(node.children[i], permarr, usernum, chk2, true);
                    }
                }  
            }
            else {
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    let permarr = [];
                    for(let j = 0; j < users.length; j++) {
                        permarr.push(perm[j].children[i]); 
                    }
                    userrecurse(node.children[i], permarr, 0, chk2, false);
                }
            }
        }
    }
    
	//console.log(body);
    for(let i = 0; i < that.tree._root.children.length; i++) {
        let chk = false;
        if(that.tree._root.children[i].file.checked == true) {
            chk = true;
        }
        let permarr = [];
        for(let j = 0; j < users.length; j++) {
            permarr.push(rt[j].children[i]); 
        }
        userrecurse(that.tree._root.children[i], permarr, 0, chk, false);
    }
        /*for(var i = 0; i < filelist.length; i++) {
            for(var j = 0; j < users.length; j++) {
                //body.value = users[j];
                body.value = users[j];
                //console.log(users[j]); */
                /*var request = this.gapi.client.drive.permissions.insert({
                    'fid': filelist[i],
                    'resource': body,
                    'sendNotificationEmails': false
                });
                request.execute(function(reponse) {
                    if(response.error) {
                        console.log("Error with inserting permission");
                    }
                });*/

                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            /*}
        } */
  }

  parseUsers() {
    const usersInput = document.querySelector('.users');
    const usersString = usersInput.value;
    const userEmails = usersString.split(/[\s,;]+/);
    return userEmails;
  }

  getRoleFromUI() {
    const role = document.querySelector('input[name = "role"]:checked').value;
    return role;
  }
  
  // Assumes a fid for simplicity.  When implemented it might take a different argument
  getpermissions(fid) {
	  var permuserlist = {owner:undefined, canshare:undefined, editors:[], commentors:[], viewers:[], anyone:undefined};
	  
	  var request = this.gapi.client.drive.files.get({
		'fileId': fid,
		'fields': "writersCanShare"
	  });
	  request.execute(function(response) {
		  if(response.error) {
			  console.log("Error with file metadata writersCanShare get execution");
		  }
		  else {
			  canshare = response.writersCanShare;
		  }
	  });
	  
	  request = this.gapi.client.drive.permissions.list({
		  'fileId': fid
	  });
	  request.execute(function(response) {
		  if(response.error) {
			  console.log("Error with permission list execution");
		  }
		  else {
			  var permlist = response.items;
			  var npt = response.nextPageToken;
			  while(npt) {
				  request = this.gapi.client.drive.children.list({
					  'fileId': fid,
					  'pageToken': npt
				  });
				  request.execute(function(response) {
					  if(response.error) {
						  console.log("Error with extended permission list execution");
					  }
					  else {
						  permlist.concat(response.items);
						  npt = response.nextPageToken;
					  }
				  });
			  }
			  for(i = 0; i < permlist.length; i++) {
				  //Get type of thing here
				  if(permlist[i].type == "user") {
					  if(permlist[i].role == "reader") {
						  if(permlist[i].additionalRoles.length != 0) {
							  permuserlist.commentors.push(permlist[i].emailAddress);
						  }
						  else {
							  permuserlist.viewers.push(permlist[i].emailAddress);  
						  }
					  }
					  else if(permlist[i].role == "writer") {
						  permuserlist.editors.push(permlist[i].emailAddress);
					  }
					  else if(permlist[i].role == "owner") {
						  permuserlist.owner = permlist[i].emailAddress;
						  console.log("Owner found.  There should only be one of these");
					  }
					  else {
						  console.log("invalid user role");
					  }
				  }
				  else if(permlist[i].type == "group") {
					  // TODO: Work with groups
				  }
				  // Check if anyone with the link can ___
				  else if(permlist[i].type == "anyone") {
					  console.log("Anyone found.  Ther should only be one of these");
					  if(permlist[i].role == "reader") {
						  if(permlist[i].additionalRoles.length != 0) {
							  permuserlist.anyone = "comment";
						  }
						  else {
							  permuserlist.anyone = "view";
						  }
					  }
					  else if(permlist[i].role == "writer") {
						  permuserlist.anyone = "edit";
					  }
					  else {
						  console.log("invalid anyone role");
					  }
				  }
				  else {
					  // Domain - probably can ignore
				  }
			  }
		  }
	  })
	  permuserlist.organizers.sort();
	  permuserlist.editors.sort();
	  permuserlist.commentors.sort();
	  permuserlist.viewers.sort();
	  return permuserlist;
  }

  // NOTE: This function is asynchronous.  See populateTree() below for reasoning
  populateTreeRecurse(file, parent) {
    
    var that = this;
	var fid = file.id;
	var name = file.title;
    //console.log("Adding file " + name);
	var folder = false;
    // Check if the file is a folder
	if(file.mimeType == "application/vnd.google-apps.folder") {
		folder = true;
	}
    
    // create and insert node into tree
	var child = new File(fid, name, folder);
	var childnode = new Node(child, undefined, []);
    //console.log("tree = " + this.tree.isvalid);
	this.tree.insert(childnode, parent);
    
    // If it is a folder, deal with its children as well
	if (folder) {
        //console.log("is a folder");
        identityAuth(function(t) {
            var q = "'" + fid + "' in parents and trashed=false";
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://www.googleapis.com/drive/v2/files" + "?q=" + encodeURIComponent(q));
            xhr.setRequestHeader('Authorization', 'Bearer ' + t);
            xhr.responseType = "json";
            
            // On Success
            xhr.onload = function() {
                var childlist = xhr.response.items;
				var npt = xhr.response.nextPageToken;
                console.log("original child list length: " + childlist.length);
                //var readyflag = false;
                //var endflag = true;
                //if(npt) {
                //    endflag = false;
                //    readyflag = true;
                //}
                //var i = 0;
                
                // While there are more pages of results
                //while((!endflag) || (i < filelist.length)) {
                    // If the process has obtained the next npt and is ready to continue
                    //if(readyflag) {
                        //readyflag = false;
                        // If the next npt is still valid
                        //if(npt) {
                        //identityAuth(function(tok) {
                function getnpt() {                   
                    var xhr2 = new XMLHttpRequest();
                    xhr2.open('GET', "https://www.googleapis.com/drive/v2/files" + "?pageToken=" + encodeURIComponent(npt) + "&?q=" + encodeURIComponent(q));
                    xhr2.setRequestHeader('Authorization', 'Bearer ' + tok);
                    xhr2.setRequestHeader('pageToken', npt);
                    xhr2.responseType = "json";
                    xhr2.onload = function() {
                        // Update npt and filelist, mark ready for next request
                        console.log("got child from npt token - chain child succeeded");
                        npt = xhr2.response.nextPageToken;
                        var childlist2 = xhr2.response.items;
                        console.log("new child list: " + childlist2.length);
                        
                        if(npt) {
                            console.log("next child npt");
                            getnpt();
                        }
                        else {
                            //endflag = true;
                            console.log("no more child npts");
                        }
                        for(var j = 0; j < childlist2.length; j++) {
                            //console.log("Calling populatetreerecurse from populatetreerecurse");
                            that.numcalls++;
                            that.populateTreeRecurse(childlist2[j], childnode);
                        }
                        that.numrequests--;
                        that.triggerDisplayTree();
                    //readyflag = 1;
                    };
                    xhr2.onerror = function() {
                        console.log("Chain child failed");
                        console.log(xhr2.error);
                    };
                    xhr2.send();
                    that.numrequests++;
                };
                
                if(npt) {
                    //endflag = false;
                    //readyflag = true;
                    console.log("Initial child npt");
                    getnpt();
                }
                for(var i = 0; i < childlist.length; i++) {
                    //console.log("Calling populatetreerecurse from populatetreerecurse");
                    //console.log(this);
                    //console.log(childlist[i]);
                    that.numcalls++;
                    that.populateTreeRecurse(childlist[i], childnode);
                }
                that.numrequests--;
                that.triggerDisplayTree();
                
                        /*}
                        // The npt is no longer valid.  Flag for the end
                        else {
                            endflag = true;
                        }
                    }*/
                    // If there are children left that haven't been inserted, call populateTreeRecurse on them
                    /*if(i < childlist.length) {
                        populateTreeRecurse(childlist[i], childnode);
                        i++;
                    }*/
                //}
            };
            
            // On Error
            xhr.onerror = function() {
                console.log(xhr.error);
            };
            
            xhr.send();
            that.numrequests++;
			//console.log("numcalls should be decreased here");
			that.numcalls--;
			//Don't need to trigger display tree because it won't be valid
			//this.triggerDisplayTree();
        });
        
		/*var request = this.gapi.client.drive.children.list({
			'folderId': fid
		});
		request.execute(function(response){
			if(response.error) {
				console.log("Error with child list execution");
			}
			else {
				
			} 
		}); */
		
	}
	else {
		//console.log("numcalls should be decreased here");
		this.numcalls--;
		this.triggerDisplayTree();
	}
    //console.log("returning from populatetreerecurse: " + name);
	
  }
  
  // This function is asynchronous.  There is no guarantee that when it returns the tree will be completely populated.  This is due to the ansynchronous nature of XMLHttpRequests
  populateTree() {
	// Get list of top-level files from user
	//console.log(this.gapi);
	//this.gapi.client.load('drive', 'v2', function() {
		/*var request = this.gapi.client.drive.files.list({
			'q': query
		});
		request.execute(function(response) { 
			if(response.error) {
				console.log("Error with file list execution");
			}
			else { */
    var that = this;
    //console.log(this);
    identityAuth(function(token) {
        //Search term to get all top-level files
        var q = "'root' in parents and trashed=false";
        //var q2 = "name contains 'shgdfh'";
        //var q3 = "invalid search 5435";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "https://www.googleapis.com/drive/v2/files" + "?q=" + encodeURIComponent(q));
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        //xhr.setRequestHeader('q', q3);
        //xhr.setRequestHeader('maxResults', 460);
        xhr.responseType = "json";
        
        
        // On success
        xhr.onload = function() {
            //console.log("Successful get of files");
            //console.log(xhr.response);
            var filelist = xhr.response.items;
            //console.log(xhr.response.items);
            console.log("original file list: " + filelist.length);
            var npt = xhr.response.nextPageToken;
            //console.log("npt: " + npt);
            //var readyflag = false;
            //var endflag = true;
            
            function getnpt() {
                var xhr2 = new XMLHttpRequest();
                xhr2.open('GET', "https://www.googleapis.com/drive/v2/files" + "?pageToken=" + encodeURIComponent(npt) + "&q=" + encodeURIComponent(q));
                xhr2.setRequestHeader('Authorization', 'Bearer ' + token);
                //xhr2.setRequestHeader('pageToken', npt);
                //xhr2.setRequestHeader('maxResults', 460);
                xhr2.responseType = "json";
                xhr2.onload = function() {
                    console.log("Got list from npt token- chain list succeeded");
                    //console.log(xhr2.response);
                    // Update npt and filelist, mark ready for next request
                    npt = xhr2.response.nextPageToken;
                    //console.log("list npt: " + npt);
                    var filelist2 = xhr2.response.items;
                    console.log("new file list: " + filelist2.length);
                    //readyflag = true;
                    if(npt) {
                        console.log("next list npt");
                        getnpt();
                    }
                    else {
                        //endflag = true;
                        console.log("no more list npts");
                    }
                    for(var j = 0; j < filelist2.length; j++) {
                        //console.log("Calling populatetreerecurse");
                        that.numcalls++;
                        that.populateTreeRecurse(filelist2[j], that.tree._root);
                    }
                    that.numrequests--;
                    that.triggerDisplayTree();
                };
                xhr2.onerror = function() {
                    console.log("chain list returned with error");
                    console.log(xhr2.error);
                };
                xhr2.send();
                that.numrequests++;
                //console.log("xhr2 was sent: " + xhr2.readyState);
            }
            
            if(npt) {
                //endflag = false;
                //readyflag = true;
                console.log("Initial list npt");
                getnpt();
            }
            for(var i = 0; i < filelist.length; i++) {
                //console.log("Calling populatetreerecurse");
                //console.log(that);
				//console.log("numcalls increase");
				//console.log("numcalls before: " + that.numcalls);
                that.numcalls++;
				//console.log("numcalls after: " + that.numcalls);
                that.populateTreeRecurse(filelist[i], that.tree._root);
            }
            //var i = 0;
            that.numrequests--;
            that.triggerDisplayTree();
            
            //console.log("npt: " + npt);
            
            // While there are more pages of results or while we haven't finished processing the list
            //while((!endflag) || (i < filelist.length)) {
                //var xhr2 = undefined;
                //console.log("endflag: " + endflag + ", i: " + i);
                //console.log("About to enter next identityAuth");
                // If the process has obtained the next npt and is ready to continue
                /*if(readyflag) {
                    readyflag = false;
                    // If the next npt is still valid
                    if(npt) {
                        console.log("npt: " + npt);
                        //identityAuth(function(tok) {
                            //console.log("is my identity function screwing stuff up?");
                            
                        //});
                    }
                    // The npt is no longer valid.  Flag for the end
                    else {
                        console.log("No more npt tokens");
                        endflag = true;
                    }
                }*/
            /*while(!endflag) {    
                // If there are files left that haven't been inserted, call populateTreeRecurse on them
                if(i < filelist.length) {
                    console.log("Calling populatetreerecurse");
                    //console.log(that.tree);
                    //that.populateTreeRecurse(filelist[i], that.tree._root);
                    i++;
                }
                setTimeout(function() {}, 1000);
            }*/
            //}
            //console.log("Finished top-level populate tree recursion");
            
        };
        
        //On failure
        xhr.onerror = function() {
            console.log(xhr.error);
        };
        
        xhr.send();
        that.numrequests++;
        //that.startedtopopulate = true;
    });
				/*
					request = this.gapi.client.drive.files.list({
						'pageToken': npt
					});
					request.execute(function(response) {
						if(response.error) {
							console.log("Error with extended file list execution");
						}
						else {
							npt = resp.nextPageToken;
							filelist.concat(response.items);
						}
					});
			}
		});
	//}); */
  }
  

  
  displayTree() {
	console.log(this.tree._root.children);
    this.tree.printTree(this.tree._root, 0);
    fileBrowserUI = '';
  //fileBrowserUI += '<ul>';
  
  //recursive function to create the nested unordered list in the html variable
  (function recursive(currNode) {
        
        if (currNode.file.fid) {
        	fileBrowserUI += '<li>' + currNode.file.name;		
        }
        if (currNode.children.length != 0) {
        	fileBrowserUI += '<ul>'
        }
        for (var i = 0; i < currNode.children.length; i++) {
          recursive(currNode.children[i]);
          fileBrowserUI += '</li>'
        }
        if (currNode.children.length != 0) {
        	fileBrowserUI += '</ul>'
        }
        
    })(this.tree._root); //passing to recursive as initial parameter the _root node
  
    console.log("displaytree");
    console.log(fileBrowserUI);

    document.getElementById('file-browser').innerHTML = fileBrowserUI;
    $('#file-browser').jstree({
      "plugins" : ["checkbox"]
    });
    console.log("jstree happened")
  }
  
  displayTreeRecurse(node) {
    //Add file to tree UI
    //Call displayTreeRecurse() on each child
	/*for(int i = 0; i < node.children.length; i++) {
		displayTreeRecurse(node.children[i]);
	}*/
  }
}


function listFiles(){
  var root = DriveApp.getFolderById(folderId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var files = root.getFiles();
  while (files.hasNext()) {
      var childFile = files.next();
      data = [ 
      root.getName() + "/" + childFile.getName()
      ];
      sheet.appendRow(data);
      count = count + 1;
    }   
  
  
  
  getChildFiles(root.getName(), root, sheet);
  sheet.appendRow([count.toString()]);
};

function listFolders(){
  var root = DriveApp.getFolderById(folderId);
  var sheet = SpreadsheetApp.getActiveSheet(); 
  sheet.clear();
  getChildFolders(root.getName(), root, sheet);
  sheet.appendRow([count.toString()]);
};

function listItems(){
  var root = DriveApp.getFolderById(folderId);
  var sheet = SpreadsheetApp.getActiveSheet();
  var data;
  sheet.clear();
  var childFolders = root.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    data = [ 
      root + "/" + childFolder.getName()
    ];
    sheet.appendRow(data);
  count = count + 1;
  }
  var files = root.getFiles();
  while (files.hasNext()) {
      var childFile = files.next();
      data = [ 
        root + "/" + childFolder.getName() + "/" + childFile.getName(),   
      ];
      sheet.appendRow(data);
      count = count + 1;
    }   
  sheet.appendRow([count.toString()]);
};

function getChildFiles(parentName, parent, sheet) {
  var childFolders = parent.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    data = [ 
      parentName + "/" + childFolder.getName()
    ];
    sheet.appendRow(data);
    var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var childFile = files.next();
      data = [ 
        parentName + "/" + childFolder.getName() + "/" + childFile.getName(),   
      ];
      sheet.appendRow(data);
      count = count + 1;
    }   
    getChildFiles(parentName + "/" + childFolder.getName(), childFolder, sheet);  
  }
};

function getChildFolders(parentName, parent, sheet) {
  var childFolders = parent.getFolders();
  var data;
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    data = [ 
      parentName + "/" + childFolder.getName()
    ];
    sheet.appendRow(data);
    var files = childFolder.getFiles();
    count = count + 1;
    getChildFolders(parentName + "/" + childFolder.getName(), childFolder, sheet, count);  
  }
};

function addUserFile() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  if (email == '') { 
    data = [ 
      "Error: No User Given"
    ];
    sheet.appendRow(data);
    return;
  }
  if (fileID == '') { 
    data = [ 
      "Error: No File Given"
    ];
    sheet.appendRow(data);
    return;
  }
  addUserToFile(email,fileID,sheet);
}

function addUserToFile(userID, fileID, sheet) { 
  var file = DriveApp.getFileById(fileID);
  data = [ 
    file.getOwner()
  ];
  sheet.appendRow(data);
  if (file.getOwner() == userID) {
    data = [ 
      userID + " already in file :" + fileID
    ];
    sheet.appendRow(data);
    return;
  }
  
  var editors = file.getEditors();
  for (var i = 0; i < editors.length; i++) {
    data = [ 
        (editors[i].getEmail())
      ];
      sheet.appendRow(data);
    if ((editors[i].getEmail()) == userID) {
      data = [ 
        userID + " already in file :" + fileID
      ];
      sheet.appendRow(data);
      return;
    }
  }
  

  
  var viewers = file.getViewers();
  for (var i = 0; i < viewers.length; i++) {
    data = [ 
        (viewers[i].getEmail())
      ];
      sheet.appendRow(data);
    if ((viewers[i].getEmail()) == userID) {
      data = [ 
        userID + " already in file :" + fileID
      ];
      sheet.appendRow(data);
      return;
    }
  }
  
  file.addViewer(userID);
  data = [ 
    userID + " added to file :" + fileID
    ];
  sheet.appendRow(data);
};

function addUserFolder() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  if (email == '') { 
    data = [ 
      "Error: No User Given"
    ];
    sheet.appendRow(data);
    return;
  }
  if (fileID == '') { 
    data = [ 
      "Error: No File Given"
    ];
    sheet.appendRow(data);
    return;
  }
  addUserToFolder(email,fileID,sheet);
}


function addUserToFolder(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileID);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var folder = DriveApp.getFolderByID(fileID);
  folder.addViewer(UserID);

  var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var file = files.next();
      addUserToFile(userID,file,sheet);
      count = count + 1;
      data = [ 
        "Added user to : " + file
      ];
      sheet.appendRow(data);
    }  
  
  var childFolders = root.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var childFile = files.next();
      addUserToFile(userID,childFolder,sheet);
    }   
    addUsersToFolder(userID, childFolder, sheet);  
  }
};

function removeUserFile() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  if (email == '') { 
    data = [ 
      "Error: No User Given"
    ];
    sheet.appendRow(data);
    return;
  }
  if (fileID == '') { 
    data = [ 
      "Error: No File Given"
    ];
    sheet.appendRow(data);
    return;
  }
  removeUserFromFile(email,fileID,sheet);
}


function removeUserFromFile(userID, fileID, sheet) {
  var file = DriveApp.getFileById(fileID);
  var file = DriveApp.getFileById(fileID);
  data = [ 
    file.getOwner()
  ];
  sheet.appendRow(data);
  if (file.getOwner() == userID) {
    file.removeViewer(userID);
    data = [ 
      userID + " removed from file :" + fileID
    ];
    sheet.appendRow(data);
    return;
  }
  
  var editors = file.getEditors();
  for (var i = 0; i < editors.length; i++) {
    data = [ 
      (editors[i].getEmail())
      ];
      sheet.appendRow(data);
    if ((editors[i].getEmail()) == userID) {
      file.removeViewer(userID);
      data = [ 
        userID + " removed from file :" + fileID
      ];
      sheet.appendRow(data);
      return;
    }
  }
  
  var viewers = file.getViewers();
  for (var i = 0; i < viewers.length; i++) {
    data = [ 
      (viewers[i].getEmail())
    ];
    sheet.appendRow(data);
    if ((viewers[i].getEmail()) == userID) {
      file.removeViewer(userID);
      data = [ 
        userID + " removed from file :" + fileID
      ];
      sheet.appendRow(data);
      return;
    }
  }

  data = [ 
    userID + " not in file :" + fileID
  ];
  sheet.appendRow(data);
};
function removeUserFromFolder(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  file.removeViewer(fileID);
  
  var childFolders = root.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var childFile = files.next();
      childFile.addViewer(userID)
    }   
    removeUserFromFolder(userID, childFolder, sheet);  
  }
};

function removeUserFromFile(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  file.removeViewer(fileID);
};

function removeUserFromFolder(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  file.removeViewer(fileID);
  
  var childFolders = root.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var childFile = files.next();
      childFile.addViewer(userID)
    }   
    removeUserFromFolder(userID, childFolder, sheet);  
  }
};

function newOwner() {
  createOwner(userID, fileID, sheet);
}

function createOwner(userID, fileID, sheet){
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  root.setOwner(userID)
}

// variable to contain the HTML for the file broswer UI
var fileBrowserUI = '';
var overDrive;


function setupOverDrive() {
	overDrive = new OverDrive(gapi);
}
