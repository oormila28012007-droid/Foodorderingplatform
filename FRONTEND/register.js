const registerForm =
    document.getElementById("registerForm");


const passwordInput =
    document.getElementById("password");


const confirmPasswordInput =
    document.getElementById("confirmPassword");


const showPassword =
    document.getElementById("showPassword");


const showConfirmPassword =
    document.getElementById("showConfirmPassword");


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


/* SHOW / HIDE CONFIRM PASSWORD */

showConfirmPassword.addEventListener("click", function () {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";

        showConfirmPassword.textContent = "🙈";

    } else {

        confirmPasswordInput.type = "password";

        showConfirmPassword.textContent = "👁";

    }

});


/* REGISTER */

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();


    const email =
        document.getElementById("email").value.trim();


    const phone =
        document.getElementById("phone").value.trim();


    const password =
        passwordInput.value.trim();


    const confirmPassword =
        confirmPasswordInput.value.trim();


    const terms =
        document.getElementById("terms").checked;


    /* CHECK PASSWORD */

    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;
    }


    /* CHECK CONFIRM PASSWORD */

    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;
    }


    /* CHECK PHONE */

    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return;
    }


    /* CHECK TERMS */

    if (!terms) {

        alert(
            "Please accept the Terms & Conditions."
        );

        return;
    }


    /* SUCCESS */

    alert(
        "Account created successfully! 🎉"
    );


    /* GO TO MENU */

    window.location.href = "menu.html";

});