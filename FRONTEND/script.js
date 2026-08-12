function findFood() {

    const location =
        document.getElementById("locationInput").value;

    if (location.trim() === "") {

        alert("Please enter your delivery location.");

    } else {

        alert(
            "Finding delicious food near " +
            location +
            "..."
        );

    }
}


function orderNow() {

    alert(
        "FOODO50 applied! You can get 50% OFF on your first order."
    );
}


function subscribeUser() {

    const email =
        document.getElementById("emailInput").value;

    if (email.trim() === "") {

        alert("Please enter your email.");

    } else {

        alert(
            "Thank you for subscribing to Foodo!"
        );

    }
}


/* HEART BUTTON */

const hearts =
    document.querySelectorAll(".heart");

hearts.forEach(function (heart) {

    heart.addEventListener("click", function () {

        if (heart.innerHTML === "♡") {

            heart.innerHTML = "♥";

        } else {

            heart.innerHTML = "♡";

        }

    });

});