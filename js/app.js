//$(document).foundation();

var clientID = '706092088663-1ur3mt6607aabki0lggij9ad9gt06r6d.apps.googleusercontent.com';
var apiKey = 'AIzaSyDHRk9uzGCpQVBAK8iwP2JYouXfzN_EKcw';
var scopes = 'https://www.googleapis.com/auth/drive';

class Tree{
  constructor(file, parent, children) {
    this.file = file;
    this.parent = parent;
    this.children = children;
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

const overDrive = new OverDrive();