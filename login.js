const loginForm = document.getElementById("loginForm");

const passwordInput =
    document.getElementById("password");

const showPassword =
    document.getElementById("showPassword");


/* SHOW / HIDE PASSWORD */

showPassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        showPassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";

        showPassword.textContent = "👁";

    }

});


/* LOGIN */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        passwordInput.value.trim();


    if (email === "" || password === "") {

        alert("Please enter your email and password.");

        return;
    }


    /*
       For now this is frontend demo login.
       Later we will connect this with
       backend + database.
    */

    alert("Login successful! 🎉");

    window.location.href = "menu.html";

});