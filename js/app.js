//$(document).foundation();

class OverDrive{
  constructor() {
    this.setUpEventListeners();
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
  }
}

const overDrive = new OverDrive();