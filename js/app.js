//$(document).foundation();

var clientID = '706092088663-1ur3mt6607aabki0lggij9ad9gt06r6d.apps.googleusercontent.com';
var apiKey = 'AIzaSyDHRk9uzGCpQVBAK8iwP2JYouXfzN_EKcw';
var scopes = 'https://www.googleapis.com/auth/drive';
var folderId = '0B6Q-4y1_9vfwRHBLSWMwREdoZEk';
var count = 0;

class File{
	constructor(fid, name) {
  	this.fid = fid;
    this.name = name;
  }
}

class Node{
  constructor(file, parent, children) {
    this.file = file;
    this.parent = parent;
    this.children = children;
  }
}

class TreeRoot{
  constructor(nodes) {
    this._root = new Node(null, null, []);
    this.insert(nodes)
  }
  
  insert(nodes) {
  	for (var i = 0; i < nodes.length; i++) {
    	this._root.children.push(nodes[i])
      nodes[i].parent = this._root;
    }
  }
}

class OverDrive{
  constructor() {
    this.setUpEventListeners();
    this.displayTree();
  }

  setUpEventListeners() {
    const actionsForm = document.querySelector('form#actions');
    const addUsersBtn = actionsForm.querySelector('.add-users');
    //console.log(addUsersBtn);
    addUsersBtn.addEventListener('click', (e) => this.handleAddUsers);
    //actionForm.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleAddUsers(e) {
    e.preventDefault();
    console.log(e);
    console.log("hello");
  }
  
  displayTree() {
    //Clear current tree
    //Get list of top-level files for user
    //For each file, call displalyTreeRecurse
  }
  
  displayTreeRecurse(fid) {
    //Add file to tree UI
    //Get children
    //Call displayTreeRecurse(fid) on each child
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

const overDrive = new OverDrive();