const userForm = document.querySelector("#userForm");
let users = [];
let editing = false;
let userId = null;
window.addEventListener("DOMContentLoaded", async (e) => {
  //console.log("loaded");
  const response = await fetch("/api/users");
  const data = await response.json();
  users = data;
  renderUser(users);
  //console.log(response, data);
});

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  //console.log(e);
  const username = userForm["username"].value;
  const email = userForm["email"].value;
  const password = userForm["password"].value;
  //console.log(username, email, password);
  if (!editing) {
    const response = await fetch("/api/users", {
      method: "POST",
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const data = await response.json();
    users.unshift(data); //agrega al inicio del arreglo
  } else {
    //console.log('updating')
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const updateUser = await response.json();
    users = users.map((user) =>
      user.id === updateUser.id ? updateUser : user
    );
    //renderUser(users);
    editing = false;
    userId = null;
  }
  //users.push(data);//agrega al final del arreglo
  //console.log(users);
  //console.log(data);
  renderUser(users);
  userForm.reset();
});

function renderUser(users) {
  //console.log(users)
  const userList = document.querySelector("#userList");
  //console.log(userList);
  //userList.innerHTML = "<li> Test</li>";
  userList.innerHTML = "";
  users.forEach((user) => {
    // console.log(user);
    const userItem = document.createElement("li");
    userItem.classList = "list-group-item list-group-item-dark my-2";
    userItem.innerHTML = `<header class='d-flex justify-content-between align-items-center'>
    <h3>${user.username}</h3>
    <div>
    <button data-id=${user.id} class='btn-edit btn btn-secondary btn-sm'>Edit</button>
    <button data-id=${user.id} class='btn-delete btn btn-danger btn-sm'>Delete</button>
    </div>
    </header>
    <p>${user.email}</p>
    <p class='text-truncate'>${user.password}</p>`;
    //console.log(userItem);
    /*userItem.addEventListener("click", e => {
      alert('clicked')
    }
    );*/
    const btnDelete = userItem.querySelector(".btn-delete");
    //console.log(btnDelete);

    btnDelete.addEventListener("click", async () => {
      //console.log(user.id);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      // console.log(data);
      //renderUser(data);
      users = users.filter((user) => user.id !== data.id);
      //console.log(users);
      renderUser(users);
    });

    const btnEdit = userItem.querySelector(".btn-edit");

    btnEdit.addEventListener("click", async () => {
      //console.log(user.id)

      const response = await fetch(`/api/users/${user.id}`);
      const data = await response.json();
      // console.log(data)
      userForm["username"].value = data.username;
      //userForm['password'].value = data.password
      userForm["email"].value = data.email;
      editing = true;
      userId = user.id;
    });

    //console.log(btnEdit);
    userList.appendChild(userItem);
  });
}
