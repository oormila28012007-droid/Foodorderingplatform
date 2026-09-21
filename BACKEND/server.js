require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== OTP SETUP ====================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const otpStore = new Map();

// SEND OTP
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, {
            otp: otp,
            expires: Date.now() + 5 * 60 * 1000
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Foodie Login OTP",
            text: `Your Foodie login OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log("OTP Error:", error.message);

        res.status(500).json({
            message: "Failed to send OTP"
        });
    }
});

// VERIFY OTP
app.post("/api/verify-otp", (req, res) => {
    try {
        const { email, otp } = req.body;

        const savedOTP = otpStore.get(email);

        if (!savedOTP) {
            return res.status(400).json({
                message: "OTP not found. Please request again."
            });
        }

        if (Date.now() > savedOTP.expires) {
            otpStore.delete(email);

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        if (savedOTP.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        otpStore.delete(email);

        res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.log("Verify OTP Error:", error.message);

        res.status(500).json({
            message: "OTP verification failed"
        });
    }
});

// ==================== MONGODB CONNECTION ====================

mongoose.connect("mongodb://127.0.0.1:27017/foodorderingdb")
    .then(() => {
        console.log("MongoDB Connected Successfully!");
        console.log("Database: foodorderingdb");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });

// ==================== USER SCHEMA ====================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user"
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

// ==================== ORDER SCHEMA ====================

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

orderSchema.virtual("orderDate").get(function () {
    return this.createdAt;
});

const Order = mongoose.model("Order", orderSchema);

// ==================== CONTACT SCHEMA ====================

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model("Contact", contactSchema);

// ==================== HOME ====================

app.get("/", (req, res) => {
    res.send("Food Ordering and Delivery Platform Backend is running");
});

// ==================== REGISTER ====================

app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const newUser = new User({
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: "user"
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.log("Register Error:", error.message);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ==================== LOGIN ====================

app.post("/api/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email
        });

        if (!user || user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.log("Login Error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ==================== PLACE ORDER ====================

app.post("/api/orders", async (req, res) => {
    try {
        const {
            customerName,
            email,
            phone,
            address,
            items,
            totalAmount
        } = req.body;

        if (
            !customerName ||
            !email ||
            !phone ||
            !address ||
            !Array.isArray(items) ||
            items.length === 0 ||
            totalAmount === undefined
        ) {
            return res.status(400).json({
                message: "All order details are required"
            });
        }

        const newOrder = new Order({
            customerName: customerName,
            email: email,
            phone: phone,
            address: address,
            items: items,
            totalAmount: Number(totalAmount),
            status: "Pending"
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: "Order placed successfully",
            order: savedOrder
        });

    } catch (error) {
        console.log("Order Error:", error.message);

        res.status(500).json({
            message: "Failed to place order",
            error: error.message
        });
    }
});

// ==================== GET ALL ORDERS ====================

app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({
            createdAt: -1
        });

        res.status(200).json(orders);

    } catch (error) {
        console.log("Get Orders Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
});

// ==================== GET SINGLE ORDER ====================

app.get("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        console.log("Get Single Order Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch order"
        });
    }
});

// ==================== UPDATE ORDER ====================

app.put("/api/orders/:id", async (req, res) => {
    try {
        const {
            status
        } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order status updated",
            order: updatedOrder
        });

    } catch (error) {
        console.log("Update Order Error:", error.message);

        res.status(500).json({
            message: "Failed to update order"
        });
    }
});

// ==================== DELETE ORDER ====================

app.delete("/api/orders/:id", async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(
            req.params.id
        );

        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order deleted successfully"
        });

    } catch (error) {
        console.log("Delete Order Error:", error.message);

        res.status(500).json({
            message: "Failed to delete order"
        });
    }
});

// ==================== GET ALL USERS ====================

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.status(200).json(users);

    } catch (error) {
        console.log("Get Users Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

// ==================== CONTACT ====================

app.post("/api/contact", async (req, res) => {
    try {
        const {
            name,
            email,
            subject,
            message
        } = req.body;

        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save();

        res.status(201).json({
            message: "Contact message saved successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error saving contact message",
            error: error.message
        });
    }
});

app.get("/api/contact", async (req, res) => {
    try {
        const contacts = await Contact.find().sort({
            createdAt: -1
        });

        res.json(contacts);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching contact messages",
            error: error.message
        });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Food Ordering Backend Started");
    console.log("Server running on: http://localhost:5000");
    console.log("--------------------------------");
});