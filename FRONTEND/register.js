document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const message = document.getElementById("message");
    const registerButton =
        document.getElementById("registerButton");

    if (!form) {
        console.error("Register form not found");
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        message.style.color = "red";

        if (
            name === "" ||
            email === "" ||
            phone === "" ||
            password === "" ||
            confirmPassword === ""
        ) {
            message.textContent = "Please fill all fields.";
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            message.textContent =
                "Phone number must contain exactly 10 digits.";
            return;
        }

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

        if (!passwordPattern.test(password)) {
            message.textContent =
                "Password must contain 8 characters, uppercase, number and special character.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = "Registering...";

        try {

            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.style.color = "green";
                message.textContent =
                    "Registration successful!";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } else {

                message.textContent =
                    data.message || "Registration failed.";

                registerButton.disabled = false;
                registerButton.textContent = "Register";

            }

        } catch (error) {

            console.error("Registration Error:", error);

            message.textContent =
                "Backend connection failed. Please start the server.";

            registerButton.disabled = false;
            registerButton.textContent = "Register";

        }

    });

});