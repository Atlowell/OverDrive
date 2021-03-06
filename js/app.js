var count = 0;
var	numFiles = -1;
var	numFolders = 0;
var	numFilesChecked = 0;
var	numFoldersChecked = 0;
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
  
  DFtraversalNode(callback, startNode) {
       (function recursive(currNode) {

        //iterate on its children and call our recursive function on them
        for (var i = 0; i < currNode.children.length; i++) {
          recursive(currNode.children[i]);
        }

        //call our callback function on the node once it has no more children to go to
        callback(currNode);
    })(startNode); //passing to recursive as initial parameter the _root node
  }
  
  // Insert a file as a child to a parent node
  // both file and parent are taken in assuming they're node objects
  insert(childnode, parentnode) {
    
	childnode.parent = parentnode;
	parentnode.children.push(childnode);

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
    this.currentName = null;
    this.currentFid = null;
    this.currentPermissions = null;
	this.useremail = "Not retrieved";
    //this.startedtopopulate = false;
    //this.lockrequests = false;
    //this.lockitems = false;
    //console.log(this.tree);
    this.populateTree(); // ASYNC!
    this.setUpEventListeners();
	this.getUserEmail();

    //permissions box
    //$('.permissions-box .file').jstree();
    const permissionsBox = document.querySelector('.permissions-box');
    permissionsBox.style.left = (-500) + 'px';
    permissionsBox.style.top = (-500) + 'px';
  }
  
  getUserEmail() {
	  var that = this;
	  chrome.identity.getProfileUserInfo(function(email) {
		  that.useremail = email.email;
		  console.log("Email retrieved: " + that.useremail);
	  });
  }
  
  triggerDisplayTree() {
    if((this.numrequests == 0) && (this.numcalls == 0)) {
        console.log("Tree before cleanup:");
        console.log(this.tree._root.children);
        this.cleanupTree();
        console.log("Tree after cleanup:");
        console.log(this.tree._root.children);
        this.displayTree();
        //this.setUpEventListeners();
    }
  }
  
  cleanupTree() {
    console.log("Tree cleanup");
    for(let i = 0; i < this.tree._root.children.length; i++) {
        for(let j = 0; j < this.tree._root.children.length; j++) {
            var done = false;
            if(i != j) {
                var that = this;
                this.tree.DFtraversalNode(function(node) {
                    if(!done) {
                        if(that.tree._root.children[i].file.fid == node.file.fid) {
                            console.log("removing " + node.file.name);
                            console.log("removing " + node.file.name);
                            that.tree._root.children.splice(i, 1);
                            i--;
                            done = true;
                        }
                    }
                }, this.tree._root.children[j]);
                if(done) {
                    break;
                }
            }
        }
    }
  }
  // NOT USED
  triggerAddUsers(args) {
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
    const fileBrowser = document.querySelector('div#file-browser');
    const checkBox_fileIcon_fileName = document.querySelectorAll('.jstree-anchor');
    const groupsBtn = document.querySelector('.groups');
    const editorSharingBtn = document.querySelector('.change-editor-sharing');
    const helpBtn = document.querySelector('.help');
    const requestOwnerBtn = document.querySelector('.request-ownership');
    const searchBtn = document.querySelector('.search-files');
    addUsersBtn.addEventListener('click', (e) => this.handleAddUsers(e));
    removeUsersBtn.addEventListener('click', (e) => this.handleRemoveUsers(e));
    changeOwnerBtn.addEventListener('click', (e) => this.handleChangeOwner(e));
    changePermBtn.addEventListener('click', (e) => this.handleChangePermissions(e));
    fileBrowser.addEventListener('contextmenu', (e) => this.displayPermissions(e));
    groupsBtn.addEventListener('click', (e) => this.showGroups(e));
    editorSharingBtn.addEventListener('click', (e) => this.handleEditorSharing(e));
    helpBtn.addEventListener('click', (e) => this.handleHelp(e));
    requestOwnerBtn.addEventListener('click', (e) => this.handleRequestOwner(e));
    searchBtn.addEventListener('click', (e) => this.handleSearchFiles(e));


    // These are all the tutorial buttons

    const closeTutBtn = document.querySelector('#close-tut');
    closeTutBtn.addEventListener('click', (e) => this.handleCloseTut(e));

    const tut0_1 = document.querySelector('#tut0-1');
    const tut1_0 = document.querySelector('#tut1-0');
    tut0_1.addEventListener('click', (e) => this.handle0_1(e));
    tut1_0.addEventListener('click', (e) => this.handle1_0(e));

    const tut1_2 = document.querySelector('#tut1-2');
    const tut2_1 = document.querySelector('#tut2-1');
    tut1_2.addEventListener('click', (e) => this.handle1_2(e));
    tut2_1.addEventListener('click', (e) => this.handle2_1(e));

    const tut2_3 = document.querySelector('#tut2-3');
    const tut3_2 = document.querySelector('#tut3-2');
    tut2_3.addEventListener('click', (e) => this.handle2_3(e));
    tut3_2.addEventListener('click', (e) => this.handle3_2(e));

    const tut3_4 = document.querySelector('#tut3-4');
    const tut4_3 = document.querySelector('#tut4-3');
    tut3_4.addEventListener('click', (e) => this.handle3_4(e));
    tut4_3.addEventListener('click', (e) => this.handle4_3(e));

    const tut4_5 = document.querySelector('#tut4-5');
    const tut5_4 = document.querySelector('#tut5-4');
    tut4_5.addEventListener('click', (e) => this.handle4_5(e));
    tut5_4.addEventListener('click', (e) => this.handle5_4(e));

    const tut5_6 = document.querySelector('#tut5-6');
    const tut6_5 = document.querySelector('#tut6-5');
    tut5_6.addEventListener('click', (e) => this.handle5_6(e));
    tut6_5.addEventListener('click', (e) => this.handle6_5(e));

    const tut6_7 = document.querySelector('#tut6-7');
    const tut7_6 = document.querySelector('#tut7-6');
    tut6_7.addEventListener('click', (e) => this.handle6_7(e));
    tut7_6.addEventListener('click', (e) => this.handle7_6(e));

    const tut7_8 = document.querySelector('#tut7-8');
    const tut8_7 = document.querySelector('#tut8-7');
    tut7_8.addEventListener('click', (e) => this.handle7_8(e));
    tut8_7.addEventListener('click', (e) => this.handle8_7(e));

    const tut8_85 = document.querySelector('#tut8-85');
    const tut85_8 = document.querySelector('#tut85-8');
    tut8_85.addEventListener('click', (e) => this.handle8_85(e));
    tut85_8.addEventListener('click', (e) => this.handle85_8(e));

    const tut85_9 = document.querySelector('#tut85-9');
    const tut9_85 = document.querySelector('#tut9-85');
    tut85_9.addEventListener('click', (e) => this.handle85_9(e));
    tut9_85.addEventListener('click', (e) => this.handle9_85(e));

    const tutEnd = document.querySelector('#tut-end');
    tutEnd.addEventListener('click', (e) => this.handleTutEnd(e));

    /*for (var ele of checkBox_fileIcon_fileName) {
        ele.addEventListener('click', (e) => {
            e.preventDefault;
            console.dir(ele)
            var pos = ele.innerHTML.lastIndexOf('</i>');
            console.log(pos)
            pos += 4;
            var fileName = ele.innerHTML.slice(pos);
            console.log("filename: " + fileName)
            this.tree.DFtraversal(function(node) {
            console.log("from: " + node.file.checked)
            if (fileName == node.file.name) {
                node.file.checked = !node.file.checked;
            }
            console.log("to: " + node.file.checked)
            })
        })
        //console.log(ele.innerHTML)
    }*/
  }

  showGroups(e) {
    console.log(this.tree._root.children);
    var win = window.open(chrome.extension.getURL("groups.html"), '_blank');
    win.focus();
  }
  
  //Move permissions window
  displayPermissions(e) {
    e.preventDefault();
    if (e.target.classList.contains("jstree-anchor")) {
        //Clicked item is file
        const fid = e.target.id.slice(0, e.target.id.lastIndexOf("_anchor"));
        const permissionsBox = document.querySelector('.permissions-box');
        console.log(e.target.innerHTML);
        const fileName = e.target.innerHTML.slice(e.target.innerHTML.lastIndexOf('</i>') + 4);
        if (fid === this.currentFid) {
            permissionsBox.style.left = (-500) + 'px';
            permissionsBox.style.top = (-500) + 'px';
            this.currentFid = 0;
        } else {
            permissionsBox.querySelector('.file').innerHTML = fileName;
            //$('.permissions-box .file').jstree();
            permissionsBox.style.left = (e.pageX + 15) + 'px';
            permissionsBox.style.top = (e.pageY + 5) + 'px';
            this.currentFid = fid;
            this.getPermissions(fid);
        }
    }
  }

  //Populate permissions box with data
  populatePermissions() {
    const permissionsBox = document.querySelector('.permissions-box');
    if (this.currentPermissions.canshare)
        permissionsBox.querySelector('.editorsCanShare').innerHTML = 'Editors can share: Yes';
    else
        permissionsBox.querySelector('.editorsCanShare').innerHTML = 'Editors can share: No';
    if (this.currentPermissions.anyone)
        permissionsBox.querySelector('.anyone').innerHTML = 'Anyone can ' + this.currentPermissions.anyone;
    else
        permissionsBox.querySelector('.anyone').innerHTML = 'Specific access only';
    permissionsBox.querySelector('.owner').innerHTML = '<strong>Owner: </strong>' + this.currentPermissions.owner;
    permissionsBox.querySelector('.writers').innerHTML = '';
    for (let i = 0; i < this.currentPermissions.editors.length; i++) {
        permissionsBox.querySelector('.writers').innerHTML += '<li>' + this.currentPermissions.editors[i] + '</li>';
    }
    permissionsBox.querySelector('.commenters').innerHTML = '';
    for (let i = 0; i < this.currentPermissions.commenters.length; i++) {
        permissionsBox.querySelector('.commenters').innerHTML += '<li>' + this.currentPermissions.commenters[i] + '</li>';
    }
    permissionsBox.querySelector('.readers').innerHTML = '';
    for (let i = 0; i < this.currentPermissions.viewers.length; i++) {
        permissionsBox.querySelector('.readers').innerHTML += '<li>' + this.currentPermissions.viewers[i] + '</li>';
    }
  }
  
  // NOT USED
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
            console.log("file is checked: " + node1.children[i].file.checked);
            console.log("initchk: " + initchk);
            if(node1.children[i].file.checked) {
                console.log(node1.children[i].file.name + "is checked");
                initchk2 = true;
            }
            else if(initchk) {
                console.log("sending permissions request for " + node1.children[i].file.name);
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
  
  handleHelp(e) {
      e.preventDefault;
      //$('#tut0').css('display', 'inline-block');
      $('#tut0').show();
      $('#overlay').show();
      $('#close-tut').show();
      
  }

  handleCloseTut(e) {
      e.preventDefault;
      $('.tutorial').hide();
      $('#overlay').hide();
      $('#close-tut').hide();

      //resetting z-indexes
      $('#filebrowser-callout').css('z-index', 'auto');
      $('#actions').css('z-index', 'auto');

      //resetting the beautiful yellow borders
      $('#file-browser').css('box-shadow', 'none');
      $('.counts').css('box-shadow', 'none');
      $('#input-potato').css('box-shadow', 'none');
      $('#input-users-potato').css('border', 'none');
      $("#tut6-area-bot").css('border', 'none');
      $("#tut6-area-top").css('border', 'none');
      $('#change-permissions-potato').css('border', 'none');
      $('#change-permissions-ticks-potato').css('border', 'none');
      $('#change-editor-potato').css('border', 'none');
      $('#change-editor-tick-potato').css('border', 'none');
      $('#tut-groups').css('border', 'none')
  }

  handle0_1(e) {
      e.preventDefault;
      $('#tut0').hide();
      $('#tut1').show();
      $('#filebrowser-callout').css('z-index', 1002);
      $('#file-browser').css('box-shadow', '0px 0px 5px 5px #fff700');
  }
  
  handle1_0(e) {
      e.preventDefault;
      $('#tut1').hide();
      $('#tut0').show();
      $('#filebrowser-callout').css('z-index', 'auto');
      $('#file-browser').css('box-shadow', 'none');
  }

  handle1_2(e) {
      e.preventDefault;
      $('#tut1').hide();
      $('#tut2').show();
      $('#file-browser').css('box-shadow', 'none');
      $('.counts').css('box-shadow', '0px 0px 5px 5px #fff700');
  }

  handle2_1(e) {
      e.preventDefault;
      $('#tut2').hide();
      $('#tut1').show();

      $('#file-browser').css('box-shadow', '0px 0px 5px 5px #fff700');
      $('.counts').css('box-shadow', 'none');
  }

  handle2_3(e) {
      e.preventDefault;
      $('#tut2').hide();
      $('#tut3').show();

      $('#input-potato').css('box-shadow', '0px 0px 5px 5px #fff700')
      $('.counts').css('box-shadow', 'none');
  }

  handle3_2(e) {
      e.preventDefault;
      $('#tut3').hide();
      $('#tut2').show();

      $('#input-potato').css('box-shadow', 'none');
      $('.counts').css('box-shadow', '0px 0px 5px 5px #fff700');
  }

  handle3_4(e) {
      e.preventDefault;
      $('#tut3').hide();
      $('#tut4').show();

      $('#input-potato').css('box-shadow', 'none');
      $('#filebrowser-callout').css('z-index', 'auto');
      $('#actions').css('z-index', 1002);
  }

  handle4_3(e) {
      e.preventDefault;
      $('#tut4').hide();
      $('#tut3').show();

      $('#input-potato').css('box-shadow', '0px 0px 5px 5px #fff700');
      $('#filebrowser-callout').css('z-index', 1002);
      $('#actions').css('z-index', 'auto');
  }

  handle4_5(e) {
      e.preventDefault;
      $('#tut4').hide();
      $('#tut5').show();

      $('#input-users-potato').css('border', '5px solid #faff0e');
  }

  handle5_4(e) {
      e.preventDefault;
      $('#tut5').hide();
      $('#tut4').show();

      $('#input-users-potato').css('border', 'none');
  }

  handle5_6(e) {
      e.preventDefault;
      $('#tut5').hide();
      $('#tut6').show();

      $('#input-users-potato').css('border', 'none');
      $("#tut6-area-bot").css({'border':'5px solid #faff0e',
                               'border-top':'0px solid #faff0e'})
      $("#tut6-area-top").css({'border':'5px solid #faff0e',
                               'border-bottom':'0px solid #faff0e'});
  }

  handle6_5(e) {
      e.preventDefault;
      $('#tut6').hide();
      $('#tut5').show();

      $('#input-users-potato').css('border', '5px solid #faff0e');
      $("#tut6-area-bot").css('border', 'none');
      $("#tut6-area-top").css('border', 'none');
  }

  handle6_7(e) {
      e.preventDefault;
      $('#tut6').hide();
      $('#tut7').show();

      $("#tut6-area-bot").css('border', 'none');
      $("#tut6-area-top").css('border', 'none');
      $('#change-permissions-potato').css({'border':'5px solid #faff0e',
                                           'border-bottom':'0px solid #faff0e'});

      $('#change-permissions-ticks-potato').css({'border':'5px solid #faff0e',
                                           'border-top':'0px solid #faff0e'});
  }

  handle7_6(e) {
      e.preventDefault;
      $('#tut7').hide();
      $('#tut6').show();

      $('#change-permissions-potato').css('border', 'none');
      $('#change-permissions-ticks-potato').css('border', 'none');
      $("#tut6-area-bot").css({'border':'5px solid #faff0e',
                               'border-top':'0px solid #faff0e'})
      $("#tut6-area-top").css({'border':'5px solid #faff0e',
                               'border-bottom':'0px solid #faff0e'});
  }
  
  handle7_8(e) {
      e.preventDefault;
      $('#tut7').hide();
      $('#tut8').show();

      $('#change-permissions-potato').css('border', 'none');
      $('#change-permissions-ticks-potato').css('border', 'none');
      $('#change-editor-potato').css({'border':'5px solid #faff0e',
                                           'border-bottom':'0px solid #faff0e'});

      $('#change-editor-tick-potato').css({'border':'5px solid #faff0e',
                                           'border-top':'0px solid #faff0e'});

  }

  handle8_7(e) {
      e.preventDefault;
      $('#tut8').hide();
      $('#tut7').show();

      $('#change-permissions-potato').css({'border':'5px solid #faff0e',
                                           'border-bottom':'0px solid #faff0e'});

      $('#change-permissions-ticks-potato').css({'border':'5px solid #faff0e',
                                           'border-top':'0px solid #faff0e'});

      $('#change-editor-potato').css('border', 'none');
      $('#change-editor-tick-potato').css('border', 'none');
  }

  handle8_85(e) {
      e.preventDefault;
      $('#tut8').hide();
      $('#tut85').show();

      $('#change-editor-potato').css('border', 'none');
      $('#change-editor-tick-potato').css('border', 'none');
      $('#tut-groups').css('border', '5px solid #faff0e')
  }

  handle85_8(e) {
      e.preventDefault;
      $('#tut85').hide();
      $('#tut8').show();

      $('#change-editor-potato').css({'border':'5px solid #faff0e',
                                           'border-bottom':'0px solid #faff0e'});

      $('#change-editor-tick-potato').css({'border':'5px solid #faff0e',
                                           'border-top':'0px solid #faff0e'});

      $('#tut-groups').css('border', 'none')
  }

  handle85_9(e) {
      e.preventDefault;
      $('#tut85').hide();
      $('#tut9').show();
      
      $('#tut-groups').css('border', 'none')
      $('#actions').css('z-index', 'auto');
  }

  handle9_85(e) {
      e.preventDefault;
      $('#tut9').hide();
      $('#tut85').show();

      $('#tut-groups').css('border', '5px solid #faff0e')
      $('#actions').css('z-index', 1002);
  }

  handleTutEnd(e) {
      $('#tut9').hide();
      $('#overlay').hide();
      $('#close-tut').hide();
  }

  handleAddUsers(e) {
    e.preventDefault();
    var that = this;
    this.parseUsers(function(array) {
        const users = array;
        if(users.length == 0) {
            alert("No valid emails entered");
            return;
        }
        const role = that.getRoleFromUI();
        if(!role) {
            alert("No role selected");
            return;
        }
        var numchecked = that.handleNumChecked();
        if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
            alert("No files selected");
            return;
        }
        var args = {
            users: users,
            role: role,
            that: that
        }
        that.addUsers(args);
        //that.addUsersBatch(users, role);
    });
    
  }
  
  addUsers(args) {
    var users = args.users;
    var role = args.role;
    var that = args.that;
    
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
    function userrecurse(node, usernum, chk, initchk) {
        if(chk) {
            console.log("initiating add request for " + node.file.name);
            identityAuth(function(token) { 
                var body = {
                    'role': newrole,
                    'type': "user",
                    'value': users[usernum]
                }
                //Commenter role is not valid for a folder.  Give it reader instead
                if((com) && (!node.file.folder)) {
                    body.additionalRoles = ["commenter"];
                }
                
                
                function addRequest(retries) {
                
					function continueRequest() {
						if(!initchk) {
                            if((usernum + 1) < users.length) {
                                userrecurse(node, usernum + 1, true, false);
                            }
                        }
                        for(let i = 0; i < node.children.length; i++) {
							let chk2 = false;
							if(node.children[i].file.checked) {
								chk2 = true;
							}
							userrecurse(node.children[i], usernum, chk2, true);
						}
					}
                    var xhr = new XMLHttpRequest();
                    //console.log("fid: " + encodeURIComponent(filelist[i]));
                    xhr.open('POST', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions" + "?sendNotificationEmails=false");
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                    xhr.responseType = "json";
                    xhr.onload = function() {
                        if(xhr.status == 200) {
                            console.log("permission added to " + node.file.name);
                            //console.log(xhr.response);
                            continueRequest();
                        }
                        else {
							console.log("Error with add request in addusers");
                            console.log(xhr.response);
							let retry = false;
							if(xhr.status == 500) {
								retry = true;
							}
							else if(xhr.status == 403) {
								let ret = true;
								for(let i = 0; i < xhr.response.error.errors.length; i++) {
									let err = xhr.response.error.errors[i].reason;
									if((err != "rateLimitExceeded") && (err != "userRateLimitExceeded")) {
										ret = false;
									}
								}
								if(ret) {
									retry = true;
								}
							}
							else if(xhr.status == 400) {
                                for(let i = 0; i < xhr.response.error.errors.length; i++) {
                                    if(xhr.response.error.errors[i].reason == "invalidSharingRequest") {
                                        alert("Insufficient permissions to share " + node.file.name + " with " + users[usernum]);
                                    }
                                }
                            }
							if(retry) {
								console.log("Retrying " + (retries) + " more times");
								if(retries > 0) {
									setTimeout(function() {
										addRequest(retries - 1);
									}, Math.floor(Math.random() * 500) + 501);
								}
								else {
									alert("Giving up retrying addusers: " + node.file.name);
									//Continue on anyways
									continueRequest();
								}
							}
							else {
								continueRequest();
							}
						}
                    };
                    xhr.onerror = function() {
                        console.log(xhr.error);
                    };
                    xhr.send(JSON.stringify(body));
                    //console.log(body);
                    //console.log(JSON.stringify(body));
                    //console.log("sent request");
                }
                addRequest(1);
            });
        }
        else {
            // This condition should never be reached
            if(initchk) {
                console.log("Problem with checkboxes or filetree: initcheck is checked but chk is false.  File name: " + node.file.name);
            }
            else {
                console.log("No action needed for " + node.file.name);
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    let permarr = [];
                    userrecurse(node.children[i], 0, chk2, false);
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
        userrecurse(that.tree._root.children[i], 0, chk, false);
    }
  }
  
  // An experiment in batching - Let's see if it's faster
  // Problem: Sending many requests has a ton of overhead with response
  // Solution: Batching, sending many requests at once
  // Problem: Cannot have multiple concurrent permissions operations on a file, so can't batch all users for 1 file
  // Solution: Batch for multiple files with 1 user
  // Other considerations: We could potentially be smart and figure out which requests actually need to be send (because of propogation)
		// Problem: Development cost for this is high - Have to design system to know whether to propogate
		// Problem: This requires sending requests to retrieve permissions for all relevant files - can be done via batching
		// Tradeoff: We send less post/delete requests overall, but we also send many more get requests
			// Potential Solution: Retrieve entire permissions tree at beginning, update per file
			// Tradeoff: High upfront overhead and high storage need, but makes permissions requests (both get and add/remove/change) faster
			// Question: How much faster?  Is it worth it?
  // Decision: Try basic batching.  If this takes too long, may have to resort to choosing which requests to send
  addUsersBatch(users, role) {
	var newrole = role;
	var com = false;
	if(newrole == "commenter") {
		com = true;
		newrole = "reader";
	}
	
	//BFS
	var fulltreearray = [];
	var checkedtreearray = [];
	for(let i = 0; i < this.tree._root.children.length; i++) {
		fulltreearray.push(this.tree._root.children[i]);
		if(fulltreearray[i].file.checked) {
			checkedtreearray.push(fulltreearray[i]);
		}
	}
	for(let i = 0; i < fulltreearray.length; i++) {
		for(let j = 0; j < fulltreearray[i].children.length; j++) {
			fulltreearray.push(fulltreearray[i].children[j]);
			if(fulltreearray[i].children[j].file.checked) {
				checkedtreearray.push(fulltreearray[i].children[j]);
			}
		}
	}
	
	identityAuth(function(token) {
		for(let i = 0; i < users.length; i++) {
			//TODO: SEND A BATCH REQUEST FOR EACH USER WITH ALL FILES IN checkedtreearray (MAX 100 AT A TIME)
			
			var xhr = new XMLHttpRequest();
			var sep = "\n--BOUNDARY\n";
			var end = "\n--BOUNDARY--";
			
			var body = "";
			for(let j = 0; j < checkedtreearray.length; j++) {
				let bdy = {
					'role': newrole,
					'type': "user",
					'value': users[i]
				}
				if(com && !(checkedtreearray[j].file.folder)) {
					bdy.additionalRoles = ["commenter"];
				}
				
				body = body + sep + "Content-Type: application/http\n\n" + "POST https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(checkedtreearray[j].file.fid) + "/permissions" + "?sendNotificationEmails=false" + "\nAuthorization: Bearer " + token + "\nContent-Type: application/json\n\n";
				body = body + JSON.stringify(bdy);
			}
			body = body + end;
			console.log("\nREQUEST\n");
			console.log(body);
			xhr.open("POST", "https://www.googleapis.com/batch", false);
			xhr.setRequestHeader("Content-Type", "multipart/mixed; boundary=" + "BOUNDARY");
			xhr.onload = function() {
				console.log("\nRESPONSE:\n");
				console.log(xhr.response);
			};
			xhr.onerror = function() {
				console.log("\nERROR:\n");
				console.log(xhr.error);
			};
			xhr.send(body);
		}
	});
  }
  

  handleRemoveUsers(e) {
	 console.log("Removing");
    e.preventDefault();
    var that = this;
    this.parseUsers(function(array) {
        const users = array;
        if(users.length == 0) {
            alert("No valid emails entered");
            return;
        }
        var numchecked = that.handleNumChecked();
        if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
            alert("No files selected");
            return;
        }
     
        that.getIdsforUsers(users, function(userids) {
            var args = {
                users: users,
                userids: userids,
                role: role,
                that: that
            }
            that.removeUsers(args);
        });
    });
  }
  

	

 
  removeUsers(args) {
	var users = args.users;
    var userids = args.userids;
    var role = args.role;
    var that = args.that;

	
	function userrecurse(node, usernum, chk, initchk) {
		if(chk) {
		//console.log("userrecurse");
		console.log(usernum);
		//var permid;
        identityAuth(function(token) { 
            function removeRequest(retries) {
                function continueRequest() {
                    if(!initchk) {
                        if((usernum + 1) < users.length) {
                            userrecurse(node, usernum + 1, true, false);
                        }
                    }
                    for(let i = 0; i < node.children.length; i++) {
                        let chk2 = false;
                        if(node.children[i].file.checked) {
                            chk2 = true;
                        }
                        userrecurse(node.children[i], usernum, chk2, true);
                    }
                }
                
                //console.log("Removing file: " + fileid + " with permid: " + permid);
                var xhr = new XMLHttpRequest();
                //console.log("fid: " + encodeURIComponent(filelist[i]));
                //console.log("https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(fileid) + "/permissions/" + encodeURIComponent(permid));
                xhr.open('DELETE', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                xhr.responseType = "json";
                xhr.onload = function() {
                    if(xhr.status == 204) {
                        console.log("User removed from " + node.file.name);
                        //console.log(xhr.response);
                        continueRequest();
                    }
                    else {
                        console.log("Error with remove request in removeusers");
                        console.log(xhr.response);
                        let retry = false;
                        if(xhr.status == 500) {
                            retry = true;
                        }
                        else if(xhr.status == 403) {
                            let ret = true;
                            for(let i = 0; i < xhr.response.error.errors.length; i++) {
                                let err = xhr.response.error.errors[i].reason;
                                if((err != "rateLimitExceeded") && (err != "userRateLimitExceeded")) {
                                    ret = false;
                                    if(err == "forbidden") {
                                        alert("Insufficient permissions to share " + node.file.name + " with " + users[usernum]);
                                    }
                                }
                            }
                            if(ret) {
                                retry = true;
                            }
                        }
                        else if(xhr.status == 400) {
                            for(let i = 0; i < xhr.response.error.errors.length; i++) {
                                if(xhr.response.error.errors[i].reason == "invalidSharingRequest") {
                                    alert("Insufficient permissions to share " + node.file.name + " with " + users[usernum]);
                                }
                            }
                        }
                        else if(xhr.status == 404) {
                            console.log("Permission not found: " + node.file.name + ", " + users[usernum]);
                        }
                        if(retry) {
                            console.log("Retrying " + (retries) + " more times");
                            if(retries > 0) {
                                setTimeout(function() {
                                    removeRequest(retries - 1);
                                }, Math.floor(Math.random() * 500) + 501);
                            }
                            else {
                                alert("Giving up retrying removeusers: " + node.file.name);
                                //Continue on anyways
                                continueRequest();
                            }
                        }
                        else {
                            continueRequest();
                        }
                    }

                };
                xhr.onerror = function() {
                    console.log(xhr.error);
                };
                xhr.send();
                //console.log(body);
                //console.log(JSON.stringify(body));
                //console.log("sent request");
            }
            /*function getpermid(node) {
            
                //console.log("Getting permid");
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "https://www.googleapis.com/drive/v2/permissionIds/" + encodeURIComponent(users[usernum]));
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.responseType = "json";
                xhr.onload = function() {
                    if(xhr.status != 200) {
                        console.log(xhr.response);
                    }
                    console.log(xhr.response.id);
                    permid = xhr.response.id; 
                    //console.log("Permid :" +permid);
                    removeRequest(node.file.fid, permid, 2);
                    //console.log("Permid");
                    //console.log(permid);
                };
                xhr.onerror = function() {
                    console.log(xhr.error);
                }
            
                xhr.send();
                //console.log(permid);
            
            }*/
            //removeRequest(node.file.fid,"04201321183946580125");
            //getpermid(node);
            removeRequest(2);
        });
        
			
		}
		else {
            // This condition should never be reached
            if(initchk) {
                console.log("Problem with checkboxes or filetree: initcheck is checked but chk is false.  File name: " + node.file.name);
            }
            else {
                console.log("No action needed for " + node.file.name);
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    let permarr = [];
                    userrecurse(node.children[i], 0, chk2, false);
                }
            }
        }
	}
	for(let i = 0; i < that.tree._root.children.length; i++) {
        let chk = false;
        if(that.tree._root.children[i].file.checked == true) {
            chk = true;
        }
        userrecurse(that.tree._root.children[i], 0, chk, false);
    }
 }
 



  handleChangeOwner(e) {
    e.preventDefault();
    var that = this;
    this.parseUsers(function(array) {
        const users = array;
        if(users.length == 0) {
            alert("No valid emails entered");
            return;
        }
        if(users.length > 1) {
            alert("Too many emails entered.  There can only be one owner");
            return;
        }
        var numchecked = that.handleNumChecked();
        if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
            alert("No files selected");
            return;
        }
        that.changeOwners(users[0]);
    });
  }
  
  changeOwners(user) {
	
	function userrecurse(node, chk, initchk) {
        if(chk) {
            console.log("initiating owner request for " + node.file.name);
            identityAuth(function(token) { 
                var body = {
                    'role': "owner",
                    'type': "user",
                    'value': user
                }
                
                
                function ownerRequest(retries) {
					
					function continueRequest() {
						for(let i = 0; i < node.children.length; i++) {
							let chk2 = false;
							if(node.children[i].file.checked) {
								chk2 = true;
							}
							userrecurse(node.children[i], chk2, true);
						}
					}
				
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions" + "?sendNotificationEmails=false");
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                    xhr.responseType = "json";
                    xhr.onload = function() {
                        if(xhr.status == 200) {
                            console.log("Owner changed for " + node.file.name);
                            //console.log(xhr.response);
                            continueRequest();
                        }
						else {
							console.log("Error with change request in changeowners");
                            console.log(xhr.response);
							let retry = false;
							if(xhr.status == 500) {
								retry = true;
							}
							else if(xhr.status == 403) {
								let ret = true;
								for(let i = 0; i < xhr.response.error.errors.length; i++) {
									let err = xhr.response.error.errors[i].reason;
									if((err != "rateLimitExceeded") && (err != "userRateLimitExceeded")) {
										ret = false;
									}
								}
								if(ret) {
									retry = true;
								}
							}
							else if(xhr.status == 400) {
                                for(let i = 0; i < xhr.response.error.errors.length; i++) {
                                    if(xhr.response.error.errors[i].reason == "invalidSharingRequest") {
                                        alert("You are not the owner of " + node.file.name);
                                    }
                                }
                            }
							if(retry) {
								console.log("Retrying " + (retries) + " more times");
								if(retries > 0) {
									setTimeout(function() {
										ownerRequest(retries - 1);
									}, Math.floor(Math.random() * 500) + 501);
								}
								else {
									alert("Giving up retrying changeowners: " + node.file.name);
									//Continue on anyways
									continueRequest();
								}
							}
							else {
								continueRequest();
							}
						}
                    };
                    xhr.onerror = function() {
                        console.log(xhr.error);
                    };
                    xhr.send(JSON.stringify(body));
                    //console.log(body);
                    //console.log(JSON.stringify(body));
                    //console.log("sent request");
                }
                ownerRequest(2);
            });
        }
        else {
            // This condition should never be reached
            if(initchk) {
                console.log("Problem with checkboxes or filetree: initcheck is checked but chk is false.  File name: " + node.file.name);
            }
            else {
                console.log("No action needed for " + node.file.name);
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    userrecurse(node.children[i], chk2, false);
                }
            }
        }
    }
	
	for(let i = 0; i < this.tree._root.children.length; i++) {
        let chk = false;
        if(this.tree._root.children[i].file.checked == true) {
            chk = true;
        }
        userrecurse(this.tree._root.children[i], chk, false);
    }
	
  }

  handleChangePermissions(e) {
    e.preventDefault();
    var that = this;
    this.parseUsers(function(array) {
        const users = array;
        if(users.length == 0) {
            alert("No valid emails entered");
            return;
        }
        const role = that.getRoleFromUI();
        if(!role) {
            alert("No role selected");
            return;
        }
        var numchecked = that.handleNumChecked();
        if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
            alert("No files selected");
            return;
        }
        that.getIdsforUsers(users, function(userids) {
            var args = {
                users: users,
                userids: userids,
                role: role,
                that: that
            }
            that.changePermissions(args);
        });
    });
  }

  triggerDone(args, numrequests, donesending, cb) {
	  console.log("checking trigger done");
	  if(donesending && (numrequests == 0)) {
		  console.log("trigger done");
		  cb(args);
	  }
  }
  
  getIdsforUsers(users, callback) {
	var that = this;
	identityAuth(function(token) {
		var numrequests = 0;
		var donesending = false;
		var userids = [];
        for(let i = 0; i < users.length; i++) {
            userids.push(undefined);
        }
        
        function sendRequest(id) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://www.googleapis.com/drive/v2/permissionIds/" + encodeURIComponent(users[id]));
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.responseType = "json";
            xhr.onload = function() {
                if(xhr.status != 200) {
                    console.log(xhr.response);
                }
                //console.log(xhr.response);
                userids[id] = xhr.response.id;
				numrequests--;
                that.triggerDone(userids, numrequests, donesending, callback);
            };
            xhr.onerror = function() {
                console.log(xhr.error);
            };
			xhr.send();
			numrequests++;
        }
        
		for(let i = 0; i < users.length; i++) {
			sendRequest(i);
		}
		donesending = true;
		that.triggerDone(userids, numrequests, donesending, callback);
	});
  }
  
  changePermissions(args) {
    var users = args.users;
	var userids = args.userids;
    var role = args.role;
    var that = args.that;
    
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
                //Commenter role is not valid for a folder.  Give it reader instead
                if((com) && (!node.file.folder)) {
                    body.additionalRoles = ["commenter"];
                }
				
				function changeRequest(retries) {
					
					function continueRequest() {
						if(!initchk) {
							if((usernum + 1) < users.length) {
								userrecurse(node, usernum + 1, chk, initchk);
							}
						}
						for(let i = 0; i < node.children.length; i++) {
							let chk2 = false;
							if(node.children[i].file.checked) {
								chk2 = true;
							}
							userrecurse(node.children[i], usernum, chk2, true);
						}
					}
					
					xhr.open('PUT', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid) + "/permissions/" + encodeURIComponent(userids[usernum]));
					xhr.setRequestHeader('Authorization', 'Bearer ' + token);
					xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
					xhr.responseType = "json";
					xhr.onload = function() {

						if(xhr.status == 200) {
							console.log("permission changed for " + node.file.name);
							//console.log(xhr.response);
							continueRequest();
						}
						else {
							console.log("Error with change request in changepermissions");
							console.log(xhr.response);
							let retry = false;
							if(xhr.status == 500) {
								retry = true;
							}
							else if(xhr.status == 403) {
								let ret = true;
								for(let i = 0; i < xhr.response.error.errors.length; i++) {
									let err = xhr.response.error.errors[i].reason;
									if((err != "rateLimitExceeded") && (err != "userRateLimitExceeded")) {
										ret = false;
                                        if(err == "forbidden") {
											alert("Insufficient permissions to share " + node.file.name + " with " + users[usernum]);
										}
									}
								}
								if(ret) {
									retry = true;
								}
							}
							else if(xhr.status == 400) {
								for(let i = 0; i < xhr.response.error.errors.length; i++) {
									if(xhr.response.error.errors[i].reason == "invalidSharingRequest") {
										alert("Insufficient permissions to share " + node.file.name + " with " + users[usernum]);
									}
								}
							}
							else if(xhr.status == 404) {
								console.log("Permission not found: " + node.file.name + ", " + users[usernum]);
							}
							if(retry) {
								console.log("Retrying " + (retries) + " more times");
								if(retries > 0) {
									setTimeout(function() {
										changeRequest(retries - 1);
									}, Math.floor(Math.random() * 500) + 501);
								}
								else {
									alert("Giving up retrying changepermissions: " + node.file.name);
									//Continue on anyways
									continueRequest();
								}
							}
							else {
								continueRequest();
							}
						}
					
					};
					xhr.onerror = function() {
						console.log(xhr.error);
					};
					xhr.send(JSON.stringify(body));
					//console.log(body);
					//console.log(JSON.stringify(body));
					//console.log("sent request");
				}
				changeRequest(2);
            });
        }
        else {
			// This condition should never be reached
            if(initchk) {
                console.log("Problem with checkboxes or filetree: initcheck is checked but chk is false.  File name: " + node.file.name);
            }
            else {
                console.log("No action needed for " + node.file.name);
                for(let i = 0; i < node.children.length; i++) {
                    let chk2 = false;
                    if(node.children[i].file.checked) {
                        chk2 = true;
                    }
                    userrecurse(node.children[i], 0, chk2, false);
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
        userrecurse(that.tree._root.children[i], 0, chk, false);
    }
  }

  handleEditorSharing(e) {
    e.preventDefault();
    const editorsCanShare = document.querySelector('.editor-sharing').checked;
    
	var numchecked = this.handleNumChecked();
	if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
		alert("No files selected");
		return;
	}
    var that = this;
    var args = {
        writersCanShare: editorsCanShare,
        that: that
    }
    this.changeEditorSharing(args);
  }

  changeEditorSharing(args) {
    const writersCanShare = args.writersCanShare;
    const that = args.that;

    function userrecurse(node, chk) {
        if(chk) {
            identityAuth(function(token) { 
                var body = {
                    'writersCanShare': writersCanShare
                }
                
                var numretries = 1;
                
                function changeEditorSharingRequest() {
                
                    var xhr = new XMLHttpRequest();
                    xhr.open('PUT', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(node.file.fid));
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
                    xhr.responseType = "json";
                    xhr.onload = function() {
                        if(xhr.status == 200) {
                            console.log("editor sharing changed for " + node.file.name);
                            //console.log(xhr.response);
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                userrecurse(node.children[i], chk2);
                            }
                        }
                        else if(xhr.status == 500) {
                            console.log("Error with request in changeEditorSharing");
                            console.log(xhr.response);
                            console.log("Retrying " + numretries + " more times");
                            numretries--;
                            if(numretries >= 0) {
                                setTimeout(function() {
                                    changeEditorSharingRequest();
                                }, 200);
                            }
                            else {
                                console.log("Giving up retrying changeEditorSharing: " + node.file.name);
                                //Continue on anyways
                                for(let i = 0; i < node.children.length; i++) {
                                    let chk2 = false;
                                    if(node.children[i].file.checked) {
                                        chk2 = true;
                                    }
                                    userrecurse(node.children[i], chk2);
                                }
                            }
                        }
                        else {
                            console.log("Error with request in changeEditorSharing");
                            console.log(xhr.response);
                            console.log(xhr.response.error.message);
                            if(xhr.status == 403) {
                                for(let i = 0; i < xhr.response.error.errors.length; i++) {
                                    if(xhr.response.error.errors[i].reason == "forbidden") {
                                        console.log("Insufficient permissions for " + node.file.name);
                                        alert("Insufficient permissions for " + node.file.name);
                                    }
                                }
                            }
                            // Continue on with other files anyways
                            for(let i = 0; i < node.children.length; i++) {
                                let chk2 = false;
                                if(node.children[i].file.checked) {
                                    chk2 = true;
                                }
                                userrecurse(node.children[i], chk2);
                            }
                        }
                    };
                    xhr.onerror = function() {
                        console.log(xhr.error);
                    };
                    xhr.send(JSON.stringify(body));
                    //console.log(body);
                    //console.log(JSON.stringify(body));
                    //console.log("sent request");
                }
                changeEditorSharingRequest();
            });
        }
        else {
            console.log("No action needed for " + node.file.name);
            for(let i = 0; i < node.children.length; i++) {
                let chk2 = false;
                if(node.children[i].file.checked) {
                    chk2 = true;
                }
                let permarr = [];
                userrecurse(node.children[i], chk2);
            }
        }
    }
    
	//console.log(body);
    for(let i = 0; i < that.tree._root.children.length; i++) {
        let chk = false;
        if(that.tree._root.children[i].file.checked == true) {
            chk = true;
        }
        userrecurse(that.tree._root.children[i], chk);
    }
  }
  
  handleRequestOwner(e) {
    e.preventDefault();
    
	var numchecked = this.handleNumChecked();
	if((!numchecked.numFilesChecked) && (!numchecked.numFoldersChecked)) {
		alert("No files selected");
		return;
	}
	if(this.parseName() == "") {
		alert("Please enter you name into the users bar");
		return;
	}
    this.requestOwner();
  }
  
  requestOwner() {
	var that = this;
    var checkedFiles = [];
    this.tree.DFtraversal(function(node) {
        if(node.file.checked) {
            checkedFiles.push(node);
        }
    });
	var fileinfo = [];
	var userarray = [];
	var hasfinished = false;
	var numrequests = 0;
    identityAuth(function(token) {
		for(let i = 0; i < checkedFiles.length; i++) {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(checkedFiles[i].file.fid));
			xhr.setRequestHeader('Authorization', 'Bearer ' + token);
			xhr.responseType = "json";
			xhr.onload = function() {
				if(xhr.status == 200) {
					var ownername = xhr.response.owners[0].displayName;
					var owneremail = xhr.response.owners[0].emailAddress;
					var filename = xhr.response.title;
					var filelink = xhr.response.alternateLink;
					var isin = false;
					for(let j = 0; j < userarray.length; j++) {
						if(userarray[j].email == owneremail) {
							isin = true;
							break;
						}
					}
					if(!isin) {
						userarray.push({
							email: owneremail,
							name: ownername
						});
					}
					
					var bodystring = "Name: " + filename + "\nLink: " + filelink + "\nParent: ";
					var parentlink;
					if((xhr.response.parents.length) && (!xhr.response.parents[0].isRoot)) {
						var xhr2 = new XMLHttpRequest();
						xhr2.open('GET', xhr.response.parents[0].parentLink);
						xhr2.setRequestHeader('Authorization', 'Bearer ' + token);
						xhr2.responseType = "json";
						xhr2.onload = function() {
							if(xhr2.status == 200) {
								parentlink = xhr2.response.alternateLink;
								bodystring += parentlink + "\n\n";
								fileinfo.push({
									txt: bodystring,
									email: owneremail
								});
								numrequests--;
								that.triggerSendEmails(numrequests, hasfinished, userarray, fileinfo, that);
							}
							else {
								console.log("error with get request on parent in requestOwner()");
								console.log(xhr2.response);
							}
						};
						xhr2.onerror = function() {
							console.log(xhr2.error);
						}
						xhr2.send();
					}
					else {
						parentlink = "Parent is root or the requesting user does not have access to it";
						bodystring += parentlink + "\n\n";
						fileinfo.push({
							txt: bodystring,
							email: owneremail
						});
						numrequests--;
						that.triggerSendEmails(numrequests, hasfinished, userarray, fileinfo, that);
					}
				}
				else {
					console.log("error with get request in requestOwner()");
					console.log(xhr.response);
				}
			};
			xhr.onerror = function() {
				console.log(xhr.error);
			};
			xhr.send();
			numrequests++;
		}
		hasfinished = true;
		that.triggerSendEmails(numrequests, hasfinished, userarray, fileinfo, that);
    });
  }
  
  triggerSendEmails(numrequests, hasfinished, userarray, fileinfo, that) {
	if((!numrequests) && (hasfinished)) {
		that.sendEmails(userarray, fileinfo, that);
	}
  }
  
  sendEmails(userarray, fileinfo, that) {
	for(let i = 0; i < userarray.length; i++) {
		if(userarray[i].email == that.useremail) {
			if(userarray.length == 1) {
				alert("You cannot request ownership from yourself.");
				return;
			}
			else {
				alert("Found request to file(s) you are the owner of.  Skipping and sending the rest");
			}
		}
		else {
			var urlstring = "mailto:" + userarray[i].email + "?subject=Google Drive Ownership Request&body=Hello " + userarray[i].name +"!\nI would like to request ownership of the following files!\n\n";
			for(let j = 0; j < fileinfo.length; j++) {
				if(fileinfo[j].email == userarray[i].email) {
					urlstring += fileinfo[j].txt;
				}
			}
			urlstring += "Thank you,\n" + that.parseName();
			var url = encodeURI(urlstring);
			var win = window.open(url, '_blank');
			//win.focus();
		}
	}
  }

  parseUsers(callback) {
    const usersInput = document.querySelector('.users');
    const usersString = usersInput.value;
    console.log("email string: " + usersString);
    const userEmails = usersString.split(/[\s,;]+/);
    console.log("email array length " + userEmails.length);
    chrome.storage.sync.get({
        list: [] //put defaultvalues if any
    },
    function(data) {
        console.log("Groups list:");
        console.log(data.list);
        console.log(data.list.length);
        
        var len = userEmails.length;
        for(let cnt = 0; cnt < userEmails.length; cnt++) {
            console.log("email array [" + cnt + "] " + userEmails[cnt]);
            if(!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmails[cnt]))) { // Regex for emails taken from http://emailregex.com/
                console.log("\"" + userEmails[cnt] + "\" is not a valid email address");
                if(cnt < len) { // In the original list.  Prevents chaining this on users added from groups        
                    var i = 0;
                    while (i < data.list.length) {
                        var numargs = data.list[i];
                        if(numargs == 0) {
                            break;
                        }
                        i++;
                        var j = 0;
                        var groupName = data.list[i];

                        console.log(groupName);
                        i++;
                        j++;
                        
                        // Group matches
                        if(userEmails[cnt] == groupName) {
                            console.log("Matching group found");
                            while(j < numargs) {
                                userEmails.push(data.list[i]);
                                i++;
                                j++;
                            }
                            break;
                            // Will not check if name is already in list, so could end up with a list of repeats, but you could already do that.  Should not break the functionality
                            // Assumes groups do not contain the name of groups
                        }
                        
                        // Group doesn't match.  Continue
                        i += numargs - 1;
                    }
                }
                
                userEmails.splice(cnt, 1);
                cnt--;
                len--;
            }
        }
        callback(userEmails);
    });
            // TODO: Retrieve groups from extension data folder (once they are saved there in the first place)
            /*for(let j = 0; j < groups.groups.length; j++) {
                if(userEmails[i] == groups.groups[j].name) {
                    for(let k = 0; k < groups.groups[j].users.length; k++) {
                        
                        userEmails.push(groups.groups[j].users[k]);
                    }
                    console.log("Found a group: " + userEmails[i]);
                    break;
                }
            }*/
            
  }
  
  parseName() {
	const usersInput = document.querySelector('.users');
	const usersString = usersInput.value;
	return usersString;
  }
  
  parseSearch() {
    const searchInput = document.querySelector('.searchbar');
    const searchString = searchInput.value;
    return searchString;
  }

  getRoleFromUI() {
    const roleElement = document.querySelector('input[name = "role"]:checked');
    if(roleElement == null) {
        return undefined;
    }
    const role = roleElement.value;
    return role;
  }
  
  // async
  getPermissions(fid) {
	var getflag = false;
	var listflag = false;
	var permuserlist = {
		owner:undefined,
		canshare:undefined,
		editors:[],
		commenters:[],
		viewers:[],
		anyone:undefined
	}
	function triggercompletion() {
		if((getflag) && (listflag)) {
            console.log(permuserlist);
            // TODO: Clayton set what you want to call here - use permuserList
            overDrive.currentPermissions = permuserlist;
            overDrive.populatePermissions();
		}
	}
	
	identityAuth(function(token) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(fid));
		xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.responseType = "json";
        xhr.onload = function() {
			if(xhr.status != 200) {
				console.log(xhr.response);
			}
			else {
				permuserlist.canshare = xhr.response.writersCanShare;
				getflag = true;
				triggercompletion();
			}
		};
		xhr.onerror = function() {
			console.log(xhr.error);
		};
		xhr.send();
		
		var xhr2 = new XMLHttpRequest();
		xhr2.open('GET', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(fid) + "/permissions");
		xhr2.setRequestHeader('Authorization', 'Bearer ' + token);
		xhr2.responseType = "json";
		xhr2.onload = function() {
			if(xhr2.status != 200) {
				console.log(xhr2.response);
			}
			else {
				var npt = xhr2.response.nextPageToken;
				var permlist = xhr2.response.items;
				// Async
				function nptcheck() {
					if(npt) {
						var xhr3 = new XMLHttpRequest();
						xhr3.open('GET', "https://www.googleapis.com/drive/v2/files/" + encodeURIComponent(fid) + "/permissions?pageToken=" + encodeURIComponent(npt));
						xhr3.setRequestHeader('Authorization', 'Bearer ' + token);
						xhr3.onload = function() {
							if(xhr3.status != 200) {
								console.log(xhr3.response);
							}
							else {
								npt = xhr3.response.nextPageToken;
								permlist.concat(xhr3.response.items);
								nptcheck();
							}
						};
						xhr3.onerror = function() {
							console.log(xhr.error);
						};
						xhr3.send();
					}
					else {
						// Compile data
						for(let i = 0; i < permlist.length; i++) {
							//Get type of thing here
							if(permlist[i].type == "user") {
								if(permlist[i].role == "reader") {
									if(permlist[i].additionalRoles) {
										permuserlist.commenters.push(permlist[i].emailAddress);
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
								console.log("Anyone found.  There should only be one of these");
								if(permlist[i].role == "reader") {
									if(permlist[i].additionalRoles) {
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
						
						// Sort output
						permuserlist.editors.sort();
						permuserlist.commenters.sort();
						permuserlist.viewers.sort();
						
						listflag = true;
						triggercompletion();
					}
				}
				nptcheck();
			}
		};
		xhr2.onerror = function() {
			console.log(xhr2.error);
		};
		xhr2.send();
	});
  }

  handleSearchFiles(e) {
    e.preventDefault();
    console.log("Searching");
    // Clear tree
    this.tree = new TreeRoot([]);
    // Clear filebrowser
    $('#file-browser').jstree("destroy");
    var query = this.parseSearch();
    if(query != "") {
        this.populateTree(true, query);
    }
    else {
        this.populateTree(false);
    }
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
            function listrequest(retries) {
                var q = "'" + fid + "' in parents and trashed=false";
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "https://www.googleapis.com/drive/v2/files" + "?q=" + encodeURIComponent(q));
                xhr.setRequestHeader('Authorization', 'Bearer ' + t);
                xhr.responseType = "json";
                
                // On Success
                xhr.onload = function() {
                    if(xhr.status != 200) {
                        console.log(xhr.status);
                        console.log("List error in recurse");
                        if(xhr.status == 403) {
                            if((xhr.response.error.errors[0].reason == "userRateLimitExceeded") || (xhr2.response.error.errors[0].reason == "rateLimitExceeded")) {
                                setTimeout(function() {
                                    if(retries > 0) {
                                        console.log("retrying children of " + name);
                                        listrequest(retries -  1);
                                    }
                                    else {
                                        console.log("Giving up retrying children of " + name);
                                    }
                                    that.numrequests--;
                                    that.triggerDisplayTree();
                                }, Math.floor(Math.random() * 500) + 501);
                            }
                            else {
                                that.numrequests--;
                                that.triggerDisplayTree();
                            }
                        }
                    }
                    else {
                        console.log(xhr.response);
                        var childlist = xhr.response.items;
                        var npt = xhr.response.nextPageToken;
                 
                        function getnpt() {     
                            if(npt) {
                                var xhr2 = new XMLHttpRequest();
                                xhr2.open('GET', "https://www.googleapis.com/drive/v2/files" + "?pageToken=" + encodeURIComponent(npt) + "&?q=" + encodeURIComponent(q));
                                xhr2.setRequestHeader('Authorization', 'Bearer ' + t);
                                //xhr2.setRequestHeader('pageToken', npt);
                                xhr2.responseType = "json";
                                xhr2.onload = function() {
                                    if(xhr2.status != 200) {
                                        console.log(xhr2.status);
                                        console.log("npt list error in recurse");
                                    }
                                    else {
                                        // Update npt and filelist, mark ready for next request
                                        console.log("got child from npt token in recurse - chain child succeeded");
                                        npt = xhr2.response.nextPageToken;
                                        var childlist2 = xhr2.response.items;
                                        console.log("new child list: " + childlist2.length);
                                        childlist.concat(childlist2);
                                        
                                        getnpt();
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
                            }
                            else {
                                for(let i = 0; i < childlist.length; i++) {
                                    
                                    //console.log("Calling populatetreerecurse from populatetreerecurse");
                                    //console.log(this);
                                    //console.log(childlist[i]);
                                    that.numcalls++;
                                    that.populateTreeRecurse(childlist[i], childnode);
                                }
                            }
                        };
                        
                        getnpt();
                        
                        that.numrequests--;
                        that.triggerDisplayTree();
                    }
                };
                
                // On Error
                xhr.onerror = function() {
                    console.log(xhr.error);
                };
                
                xhr.send();
                that.numrequests++;
            }
            
            listrequest(2);
            that.numcalls--;
            that.triggerDisplayTree();
        });
	}
	else {
		//console.log("numcalls should be decreased here");
		this.numcalls--;
		this.triggerDisplayTree();
	}
    //console.log("returning from populatetreerecurse: " + name);
	
  }
  
  // This function is asynchronous.  There is no guarantee that when it returns the tree will be completely populated.  This is due to the ansynchronous nature of XMLHttpRequests
  populateTree(search, searchtext) {
    var that = this;
    //console.log(this);
    identityAuth(function(token) {
        
        //Search term to get all top-level files
        var q;
        if(search) {
            q = "title contains '" + searchtext + "' and trashed=false";
        }
        else {
            var q = "('root' in parents) and trashed=false";
        }
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
            if(xhr.status != 200) {
                console.log(xhr.status);
                console.log("List error");
            }
            else {
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
                    if(npt) {
                        console.log("npt found.  Getting next list");
                        var xhr2 = new XMLHttpRequest();
                        xhr2.open('GET', "https://www.googleapis.com/drive/v2/files" + "?pageToken=" + encodeURIComponent(npt) + "&q=" + encodeURIComponent(q));
                        xhr2.setRequestHeader('Authorization', 'Bearer ' + token);
                        //xhr2.setRequestHeader('pageToken', npt);
                        //xhr2.setRequestHeader('maxResults', 460);
                        xhr2.responseType = "json";
                        xhr2.onload = function() {
                            if(xhr2.status != 200) {
                                console.log(xhr2.response);
                                console.log("Error in npt list response");
                            }
                            else {
                                console.log("Got list from npt token- chain list succeeded");
                                //console.log(xhr2.response);
                                // Update npt and filelist, mark ready for next request
                                npt = xhr2.response.nextPageToken;
                                //console.log("list npt: " + npt);
                                var filelist2 = xhr2.response.items;
                                console.log("new file list: " + filelist2.length);
                                filelist.concat(filelist2);
                                //readyflag = true;
                                
                                getnpt();
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
                    // Last of files
                    else {
                        if(!search) {
                            var q2 = "(sharedWithMe = true) and trashed=false";
                            var xhr3 = new XMLHttpRequest();
                            xhr3.open('GET', "https://www.googleapis.com/drive/v2/files" + "?q=" + encodeURIComponent(q2));
                            xhr3.setRequestHeader('Authorization', 'Bearer ' + token);
                            xhr3.responseType = "json";
                            
                            xhr3.onload = function() {
                                if(xhr3.status != 200) {
                                    console.log(xhr2.status);
                                    console.log("List2 error");
                                }
                                else {
                                    var sharelist = xhr3.response.items;
                                    console.log("original share list: " + sharelist.length);
                                    npt = xhr3.response.nextPageToken;
                                    
                                    function getnpt2() {
                                        if(npt) {
                                            console.log("npt found.  Getting next list2");
                                            var xhr4 = new XMLHttpRequest();
                                            xhr4.open('GET', "https://www.googleapis.com/drive/v2/files" + "?pageToken=" + encodeURIComponent(npt) + "&q=" + encodeURIComponent(q2));
                                            xhr4.setRequestHeader('Authorization', 'Bearer ' + token);
                                            xhr4.responseType = "json";
                                            xhr4.onload = function() {
                                                if(xhr4.status != 200) {
                                                    console.log(xhr4.response);
                                                    console.log("Error in npt list2 response");
                                                }
                                                else {
                                                    console.log("Got list2 from npt token- chain list2 succeeded");
                                                    npt = xhr4.response.nextPageToken;
                                                    var sharelist2 = xhr4.response.items;
                                                    console.log("new share list: " + sharelist2.length);
                                                    sharelist.concat(sharelist2);
                                                    
                                                    getnpt2();
                                                }
                                                that.numrequests--;
                                                that.triggerDisplayTree();
                                            };
                                            xhr4.onerror = function() {
                                                console.log("chain list 2 returned with an error");
                                                console.log(xhr4.error);
                                            };
                                            xhr4.send();
                                            that.numrequests++;
                                        }
                                        else {
                                            for(let i = 0; i < sharelist.length; i++) {
                                                if(sharelist[i].parents.length == 0) {
                                                    filelist.push(sharelist[i]);
                                                }
                                            }
                                            for(let i = 0; i < filelist.length; i++) {
                                                that.numcalls++;
                                                that.populateTreeRecurse(filelist[i], that.tree._root);
                                            }
                                        }
                                    }
                                    
                                    getnpt2();
                                    
                                }
                                that.numrequests--;
                                that.triggerDisplayTree();
                            };
                            var onerror = function() {
                                console.log(xhr3.error);
                            }
                            xhr3.send();
                            that.numrequests++;
                        }
                        // Search.  Don't need to get sharedwithme because search already covers it
                        else {
                            for(let i = 0; i < filelist.length; i++) {
                                that.numcalls++;
                                that.populateTreeRecurse(filelist[i], that.tree._root);
                            }
                        }
                    }
                }
                
                getnpt();
                
            }
            that.numrequests--;
            that.triggerDisplayTree();
			
        };
        
        //On failure
        xhr.onerror = function() {
            console.log(xhr.error);
        };
        
        xhr.send();
        that.numrequests++;
        //that.startedtopopulate = true;
    });
  }
  

  
  displayTree() {
	console.log(this.tree._root.children);
    this.tree.printTree(this.tree._root, 0);
    fileBrowserUI = '';
  //fileBrowserUI += '<ul>';
  
  //recursive function to create the nested unordered list in the html variable
  (function recursive(currNode) {
        //console.log(currNode)
        if (currNode.file.fid) {
        	fileBrowserUI += '<li id="' + currNode.file.fid + '"';
            if (!currNode.file.folder) {
                fileBrowserUI += '" data-jstree=\'{"icon":"jstree-file"}\''
            }
            fileBrowserUI += '>' + currNode.file.name;		
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
  
    //console.log("displaytree");
    //console.log(fileBrowserUI);
    
    document.getElementById('file-browser').innerHTML = fileBrowserUI;
    var fileTree = $('#file-browser');
    fileTree.jstree({
        "checkbox" : {
            "tie_selection" : false
        },
      "plugins" : ["checkbox", "sort"],
    });

    fileTree.on("check_node.jstree", function(event, data) {
        console.log("CHECKED:" + data.node.text)
        
        console.log(this.tree);
        this.tree.DFtraversal(function(node) {
            if (data.node.text == node.file.name) {
                node.file.checked = true;
                if (node.file.folder) {
                    this.tree.DFtraversalNode(function(cNode) {
                        cNode.file.checked = true
                    }, node)
                }
            }
        }.bind(this))
        console.log(this.tree);
        var ret = this.handleNumChecked();
        document.getElementById('fileCount').innerHTML = ret.numFilesChecked;
        document.getElementById('folderCount').innerHTML = ret.numFoldersChecked;
    }.bind(this))

    fileTree.on("uncheck_node.jstree", function(event, data) {
        console.log("UNCHECKED:" + data.node.text)
        
        console.log(this.tree)
        this.tree.DFtraversal(function(node) {
            if (data.node.text == node.file.name) {
                node.file.checked = false;
                if (node.file.folder) {
                    this.tree.DFtraversalNode(function(cNode) {
                        cNode.file.checked = false
                    }, node)
                }

                (function recurse(node) {
                    if (node.parent) {
                        node.parent.file.checked = false;
                        recurse(node.parent);
                    } else {
                        return;
                    }
                })(node);
            }
        }.bind(this))
        console.log(this.tree)
    //console.log("jstree happened")
        this.handleNumChecked();
        var ret = this.handleNumChecked();
        document.getElementById('fileCount').innerHTML = ret.numFilesChecked;
        document.getElementById('folderCount').innerHTML = ret.numFoldersChecked;
    }.bind(this))

let tot = this.handleFileCount();
console.log("counting happened" + tot.numFiles + tot.numFolders)
document.getElementById('fileCountTotal').innerHTML = tot.numFiles;
document.getElementById('folderCountTotal').innerHTML = tot.numFolders;
}
 
 
 handleOneFileCount(node) {
	numFiles = -1;
	numFolders = 0;
	function fileCount(node) {
		
			if(node.file.folder) {
				numFolders++;
			}
			else {
				numFiles++;
			}
			
			console.log(node.file.name);
		
	
		
	}
	for(var i = 0; i < node.children.length; i++) {
			fileCount(node.children[i]);
	}
	console.log("Files " + numFiles + "Folders : " + numFolders);
	var ret = {
        numFiles: numFiles,
        numFolders: numFolders,

    }
	return ret;
}


 handleFileCount(node) {
	numFiles = -1;
	numFolders = 0;
	function fileCount(node) {
		
			if(node.file.folder) {
				numFolders++;
			}
			else {
				numFiles++;
			}
			
			console.log(node.file.name);
		
	
		for(var i = 0; i < node.children.length; i++) {
			fileCount(node.children[i]);
		}
	}
	fileCount(this.tree._root);
	console.log("Files " + numFiles + "Folders : " + numFolders);
	var ret = {
        numFiles: numFiles,
        numFolders: numFolders,

    }
	return ret;
}

handleNumChecked() {
	numFilesChecked = 0;
	numFoldersChecked = 0;
	function numChecked(node) {

		if (node.file.checked) {
			if(node.file.folder) {
				numFoldersChecked++;
			}
			else {
				numFilesChecked++;
			}
			console.log(node.file.name);
		}
		
		
	
		for(var i = 0; i < node.children.length; i++) {
			numChecked(node.children[i]);
		}
	}
	numChecked(this.tree._root);
	console.log("Files " + numFilesChecked + "Folders : " + numFoldersChecked);
	var ret = {
        numFilesChecked: numFilesChecked,
        numFoldersChecked: numFoldersChecked,

    }
	return ret;
}



 
 
  displayTreeRecurse(node) {
    //Add file to tree UI
    //Call displayTreeRecurse() on each child
	/*for(int i = 0; i < node.children.length; i++) {
		displayTreeRecurse(node.children[i]);
	}*/
  }
  
  
  
  //overdrive class ends
}




// variable to contain the HTML for the file broswer UI
var fileBrowserUI = '';
var overDrive;


function setupOverDrive() {
	overDrive = new OverDrive(gapi);
}
