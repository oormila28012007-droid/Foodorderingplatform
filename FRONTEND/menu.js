/* CART */

let cart = JSON.parse(
    localStorage.getItem("foodCart")
) || [];


/* UPDATE CART COUNT */

function updateCartCount() {

    const count = cart.length;

    document.getElementById("cartCount").textContent = count;

    document.getElementById(
        "floatingCartCount"
    ).textContent = count;
}


updateCartCount();


/* ADD TO CART */

function addToCart(name, price) {

    const existingItem = cart.find(
        item => item.name === name
    );


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }


    localStorage.setItem(
        "foodCart",
        JSON.stringify(cart)
    );


    updateCartCount();


    alert(
        name + " added to cart! 🛒"
    );
}


/* GO TO CART */

function goToCart() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty! Please add some food first."
        );

        return;
    }


    /*
       Cart page will be created
       in the next step.
    */

    window.location.href = "cart.html";
}


/* GO TO LOGIN */

function goToLogin() {

    window.location.href = "login.html";

}


/* CATEGORY FILTER */

function filterFood(category, button) {

    const cards =
        document.querySelectorAll(".food-card");


    const buttons =
        document.querySelectorAll(".category");


    buttons.forEach(function(btn) {

        btn.classList.remove("active");

    });


    button.classList.add("active");


    let visibleCount = 0;


    cards.forEach(function(card) {

        const cardCategory =
            card.dataset.category;


        if (
            category === "all" ||
            cardCategory === category
        ) {

            card.style.display = "block";

            visibleCount++;

        } else {

            card.style.display = "none";

        }

    });


    document.getElementById(
        "foodResult"
    ).textContent =
        visibleCount + " items";


    if (visibleCount === 0) {

        document.getElementById(
            "noResult"
        ).style.display = "block";

    } else {

        document.getElementById(
            "noResult"
        ).style.display = "none";

    }

}


/* SEARCH FOOD */

function searchFood() {

    const searchValue =
        document.getElementById(
            "searchInput"
        ).value.toLowerCase();


    const cards =
        document.querySelectorAll(".food-card");


    let count = 0;


    cards.forEach(function(card) {

        const foodName =
            card.dataset.name.toLowerCase();


        if (
            foodName.includes(searchValue)
        ) {

            card.style.display = "block";

            count++;

        } else {

            card.style.display = "none";

        }

    });


    document.getElementById(
        "foodResult"
    ).textContent =
        count + " items";


    if (count === 0) {

        document.getElementById(
            "noResult"
        ).style.display = "block";

    } else {

        document.getElementById(
            "noResult"
        ).style.display = "none";

    }

}


/* FAVORITE BUTTONS */

const favoriteButtons =
    document.querySelectorAll(".favorite");


favoriteButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            if (button.textContent === "♡") {

                button.textContent = "♥";

            } else {

                button.textContent = "♡";

            }

        }
    );

});