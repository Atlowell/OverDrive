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
	this.populateTree();
    this.displayTree();
	this.setUpEventListeners();
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
    //get file(s) from UI
    //call removeFromFile for given files and users
  }

  handleAddOwners(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get file(s) from UI
    //call addOwners for given files and users
  }

  handleRemoveOwners(e) {
    e.preventDefault();
    const users = this.parseUsers();
    //get file(s) from UI
    //call removeOwners for given files and users
  }

  handleChangePermissions(e) {
    e.preventDefault();
    const users = this.parseUsers();
    const role = this.getRoleFromUI();
    //get file(s) from UI
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
  
  populateTree() {
	// Get list of top-level files from user
	console.log(this.gapi);
	//this.gapi.client.load('drive', 'v2', function() {
		var q = "'root' in parents and trashed=false";
		var request = this.gapi.client.drive.files.list({
			'q': query
		});
		request.execute(function(response) {
			if(response.error) {
				console.log("Error with file list execution");
			}
			else {
				var filelist = response.items;
				var npt = response.nextPageToken;
				while(npt) {
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
				
				for(i = 0; i < filelist.length; i++) {
					populateTreeRecurse(filelist[i], this.tree._root);
				}
				
				console.log(filelist);
			}
		});
	//});
	//For each file, call populateTreeRecurse
  }
  
  populateTreeRecurse(file, parent) {
	fid = file.id;
	name = file.title;
	folder = false;
	if(file.mimeType == "application/vnd.google-apps.folder") {
		folder = true;
	}
	child = new File(fid, name, folder);
	childnode = new Node(child, null, []);
	this.tree.insert(childnode, parent);
	if (folder) {
		var request = this.gapi.client.drive.children.list({
			'folderId': fid
		});
		request.execute(function(response){
			if(response.error) {
				console.log("Error with child list execution");
			}
			else {
				childlist = response.items;
				npt = response.nextPageToken;
				while(npt) {
					request = this.gapi.client.drive.children.list({
						'folderId': fid,
						'pageToken': npt
					});
					request.execute(function(response) {
						if(response.error) {
							console.log("Error with extended child list execution");
						}
						else {
							childlist.concat(response.items);
							npt = response.nextPageToken;
						}
					});
				}
				for(i = 0; i < childlist.length; i++ ) {
					populateTreeRecurse(childlist[i], childnode);
				}
			}
		});
	}
	
  }
  
  displayTree() {
    //Clear current tree UI
    //For each toplevel file in tree, call displayTreeRecurse
	/*for(i = 0; i < tree.root.length; i++) {
		displayTreeRecurse(tree.root[i]);
	}*/
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

function setupOverdrive() {
	overDrive = new OverDrive(gapi);
}

$('#file-browser').jstree();