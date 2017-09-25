//$(document).foundation();



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
	var tree = new Tree();
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
  
const overDrive = new OverDrive();