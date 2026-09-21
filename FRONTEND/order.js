const placeOrderBtn = document.getElementById("placeOrderBtn");

placeOrderBtn.addEventListener("click", async function () {

    const customerName =
        document.getElementById("customerName").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const address =
        document.getElementById("address").value.trim();

    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    // Check customer details
    if (customerName === "" ||
        phone === "" ||
        address === "") {

        alert("Please fill all customer details.");
        return;
    }

    // Check cart
    if (cart.length === 0) {

        alert("Your cart is empty.");
        return;
    }

    // Calculate total
    let total = 0;

    cart.forEach(function (item) {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        total += price * quantity;

    });

    // Order data
    const orderData = {

        customerName: customerName,

        phone: phone,

        address: address,

        items: cart,

        totalAmount: total,

        status: "Placed",

        orderDate: new Date().toISOString()

    };

    try {

        const response = await fetch(
            "http://localhost:5000/api/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(orderData)
            }
        );

        const result = await response.json();

        if (response.ok) {

            alert("✅ Order placed successfully!");

            // Clear cart
            localStorage.removeItem("cart");

            // Go to home page
            window.location.href = "index.html";

        } else {

            alert(
                "❌ Order failed: " +
                (result.message || "Server error")
            );

        }

    } catch (error) {

        console.error("Order Error:", error);

        alert(
            "❌ Cannot connect to backend.\n" +
            "Please make sure server is running."
        );

    }

});