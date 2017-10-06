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
// constructor at the moment inserts the first set of child nodes, needs adjusting
// for dealing with any initial file structure
class TreeRoot{
  constructor(nodes) {
    this._root = new Node(new File(null, null, null), null, []);
    for (var i = 0; i < nodes.length; i++) {
    	this.insert(nodes[i], this._root)
    }
    this.isvalid = "its the right one!";
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
  insert(file, parent) {
    
    //declaring necessary variables/functions
    /*var cur_parent = null
    var callback = function(node) {
      if (node.file.id === parent.file.id) {
        cur_parent = node;
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
	file.parent = parent;
	parent.children.push(file);
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
  }
  
  triggerDisplayTree() {
    console.log("numrequests: " + this.numrequests + ", numcalls: " + this.numcalls);
    if((this.numrequests == 0) && (this.numcalls == 0)) {
        this.displayTree();
        this.setUpEventListeners();
    }
  }
  
  //Add appropriate event listeners to action buttons
  setUpEventListeners() {
    const actionsForm = document.querySelector('form#actions');
    const addUsersBtn = actionsForm.querySelector('.add-users');
    const removeUsersBtn = actionsForm.querySelector('.remove-users');
    const addOwnersBtn = actionsForm.querySelector('.add-owners');
    const removeOwnersBtn = actionsForm.querySelector('.remove-owners');
    const changePermBtn = actionsForm.querySelector('.change-permissions');
    addUsersBtn.addEventListener('click', (e) => this.handleAddUsers(e));
    removeUsersBtn.addEventListener('click', (e) => this.handleRemoveUsers(e));
    addOwnersBtn.addEventListener('click', (e) => this.handleAddOwners(e));
    removeOwnersBtn.addEventListener('click', (e) => this.handleRemoveOwners(e));
    changePermBtn.addEventListener('click', (e) => this.handleChangePermissions(e));
  }
  
  handleAddUsers(e) {
    e.preventDefault();
    const users = this.parseUsers();
    const role = this.getRoleFromUI();
	var filelist = [];
    this.tree.DFtraversal(function(node) {
		if(node.checked) {
			filelist.push(node.fid);
		}
	});
	
	var newrole = role;
	var com = false;
	if(newrole == "commenter") {
		com = true;
		newrole = "reader";
	}
	var body = {
		'value': undefined,
		'type': "user",
		'role': newrole
	}
	if(com) {
		body.additonalRoles = ["commenter"];
	}
	console.log(body);
	
	for(i = 0; i < filelist.length; i++) {
		for(j = 0; j < user.length; j++) {
			body.value = user[j];
			var request = this.gapi.client.drive.permissions.insert({
				'fid': filelist[i],
				'resource': body,
				'sendNotificationEmails': false
			});
			request.execute(function(reponse) {
				if(response.error) {
					console.log("Error with inserting permission");
				}
			});
		}
	}
    //call addToFile for given files, users, role
  }

  handleRemoveUsers(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get checked file(s) from tree
    //call removeFromFile for given files and users
  }

  handleAddOwners(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get checked file(s) from tree
    //call addOwners for given files and users
  }

  handleRemoveOwners(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get checked file(s) from tree
    //call removeOwners for given files and users
  }

  handleChangePermissions(e) {
    e.preventDefault();
    const users = this.parseUsers();
    const role = this.getRoleFromUI();
    //get checked file(s) from tree
    //call addToFile for given files and users
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
    console.log("Adding file " + name);
	var folder = false;
    // Check if the file is a folder
	if(file.mimeType == "application/vnd.google-apps.folder") {
		folder = true;
	}
    
    // create and insert node into tree
	var child = new File(fid, name, folder);
	var childnode = new Node(child, null, []);
    //console.log("tree = " + this.tree.isvalid);
	this.tree.insert(childnode, parent);
    
    // If it is a folder, deal with its children as well
	if (folder) {
        console.log("is a folder");
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
                            console.log("Calling populatetreerecurse from populatetreerecurse");
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
                    console.log("Calling populatetreerecurse from populatetreerecurse");
                    //console.log(this);
                    console.log(childlist[i]);
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
    
    this.numcalls--;
    this.triggerDisplayTree();
    console.log("returning from populatetreerecurse: " + name);
	
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
                        console.log("Calling populatetreerecurse");
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
                console.log("Calling populatetreerecurse");
                //console.log(that);
                that.numcalls++;
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
    //Clear current tree UI
    //For each toplevel file in tree, call displayTreeRecurse
	/*for(i = 0; i < tree.root.length; i++) {
		displayTreeRecurse(tree.root[i]);
	}*/
    console.log("displaytree");
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




function addUserToFile(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  file.addViewer(fileID);
 
};
function addUserToFolder(userID, fileID, sheet) {
  var root = DriveApp.getFolderById(fileId);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  var file = DriveApp.getFileByID(fileID);
  file.addViewer(fileID);
 
  
  var childFolders = root.getFolders();
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    var files = childFolder.getFiles();
    count = count + 1;
    while (files.hasNext()) {
      var childFile = files.next();
      childFile.addViewer(userID)
    }   
    addUsersToFolder(userID, childFolder, sheet);  
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

function addOwners(users, file) {
}

function removeOwners(users, file) {
}

var overDrive;

function setupOverDrive() {
	overDrive = new OverDrive(gapi);
}

$('#file-browser').jstree();