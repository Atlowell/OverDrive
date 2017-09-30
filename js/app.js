//$(document).foundation();

var count = 0;

// File structure
// No default values because every file needs a name and a file ID
class File{
	constructor(fid, name) {
  	this.fid = fid;
    this.name = name;
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
    this._root = new Node(new File(null, null), null, []);
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
  // both file and parent are taken in assuming they're file objects
  insert(file, parent) {
    
    //declaring necessary variables/functions
    var cur_parent = null
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
    }
  }
};

class OverDrive{
	
  //var tree;
	
  constructor() {
    this.setUpEventListeners();
    this.displayTree();
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
    //get file(s) from UI
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
  
  populateTree() {
	// Get list of top-level files from user
	gapi.client.load('drive', 'v2', function() {
		var q = "'root' in parents and trashed=false";
		var request = gapi.client.drive.files.list({
			'q': query
		});
		request.execute(function(response) {
			if(response.error) {
				console.log("Error with list execution");
			}
			else {
				//Do something with list of files
				console.log(resp.items);
			}
		});
	});
	//For each file, call populateTreeRecurse
  }
  
  populateTreeRecurse() {
	//Perform depth-first insertion
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

function addToFile(users, role, file) {
}

function removeFromFile(users, role, file) {
}

function addOwners(users, file) {
}

function removeOwners(users, file) {
}

const overDrive = new OverDrive();