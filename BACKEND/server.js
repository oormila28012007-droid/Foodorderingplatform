require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// OTP keys: login:email and reset:email
const otpStore = new Map();

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

async function sendEmail(to, subject, text) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email configuration is missing in .env");
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });
}

async function createAndSendOTP(email, purpose) {
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Send first. Store only after successful email delivery.
    await sendEmail(
        email,
        purpose === "reset"
            ? "Foodie Password Reset OTP"
            : "Foodie Login OTP",
        `Your Foodie OTP is ${otp}. It expires in 5 minutes. If you did not request it, ignore this email.`
    );

    otpStore.set(`${purpose}:${email}`, {
        otp,
        expires: Date.now() + 5 * 60 * 1000
    });
}

// ==================== MONGODB ====================

mongoose.connect("mongodb://127.0.0.1:27017/foodorderingdb")
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(error => console.error(
        "MongoDB Connection Error:",
        error.message
    ));

// ==================== USER SCHEMA ====================

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ==================== ORDER SCHEMA ====================

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

orderSchema.virtual("orderDate").get(function () {
    return this.createdAt;
});

const Order = mongoose.model("Order", orderSchema);

// ==================== CONTACT SCHEMA ====================

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// ==================== HOME ====================

app.get("/", (req, res) => {
    res.send("Food Ordering and Delivery Platform Backend is running");
});

// ==================== SEND LOGIN OTP ====================

app.post("/api/send-otp", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        if (!ADMIN_EMAIL) {
            return res.status(500).json({
                message: "ADMIN_EMAIL is missing in .env."
            });
        }

        await createAndSendOTP(email, "login");

        console.log("Login OTP sent.");
        res.json({ message: "OTP sent successfully. Check your email." });
    } catch (error) {
        console.error("Login OTP Error:", error.message);
        res.status(500).json({
            message: "Failed to send login OTP. Check email settings."
        });
    }
});

// ==================== VERIFY LOGIN OTP ====================

app.post("/api/verify-otp", (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const key = `login:${email}`;
    const saved = otpStore.get(key);

    if (!email || !otp || !saved) {
        return res.status(400).json({
            message: "Login OTP not found. Request a new OTP."
        });
    }

    if (Date.now() > saved.expires) {
        otpStore.delete(key);
        return res.status(400).json({
            message: "Login OTP expired. Request a new OTP."
        });
    }

    if (saved.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP." });
    }

    otpStore.delete(key);
    res.json({ message: "OTP verified successfully." });
});

// ==================== SEND FORGOT PASSWORD OTP ====================

app.post("/api/forgot-password/send-otp", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        // Admin reset is intentionally not enabled here.
        if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
            return res.status(400).json({
                message: "Admin password reset is not enabled yet."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "This email is not registered."
            });
        }

        await createAndSendOTP(email, "reset");

        res.json({
            message: "Reset OTP sent successfully. Check your email."
        });
    } catch (error) {
        console.error("Forgot Password OTP Error:", error.message);
        res.status(500).json({
            message: "Unable to send reset OTP."
        });
    }
});

// ==================== RESET USER PASSWORD ====================

app.post("/api/forgot-password/reset", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const otp = String(req.body.otp || "").trim();
        const newPassword = String(req.body.newPassword || "");

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new password are required."
            });
        }

        if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
            return res.status(400).json({
                message: "Admin password reset is not enabled yet."
            });
        }

        if (
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with an uppercase letter, number and special character."
            });
        }

        const key = `reset:${email}`;
        const saved = otpStore.get(key);

        if (!saved) {
            return res.status(400).json({
                message: "Reset OTP not found. Request a new OTP."
            });
        }

        if (Date.now() > saved.expires) {
            otpStore.delete(key);
            return res.status(400).json({
                message: "OTP expired. Request a new OTP."
            });
        }

        if (saved.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP. Use the latest reset OTP from your email."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Registered user not found."
            });
        }

        user.password = newPassword;
        await user.save();

        otpStore.delete(key);

        res.json({
            message: "Password reset successfully. Please log in with your new password."
        });
    } catch (error) {
        console.error("Reset Password Error:", error.message);
        res.status(500).json({
            message: "Password reset failed."
        });
    }
});

// ==================== REGISTER ====================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!name || !normalizedEmail || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with an uppercase letter, number and special character."
            });
        }

        if (ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL) {
            return res.status(400).json({
                message: "This email is reserved for Admin."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        await new User({
            name,
            email: normalizedEmail,
            phone,
            password,
            role: "user"
        }).save();

        res.status(201).json({
            message: "Registration successful."
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// ==================== LOGIN ====================

app.post("/api/login", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
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
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Login failed." });
    }
});

// ==================== PLACE ORDER ====================

app.post("/api/orders", async (req, res) => {
    try {
        const {
            customerName, email, phone,
            address, items, totalAmount
        } = req.body;

        if (
            !customerName || !email || !phone || !address ||
            !Array.isArray(items) || items.length === 0 ||
            totalAmount === undefined
        ) {
            return res.status(400).json({
                message: "All order details are required."
            });
        }

        const savedOrder = await new Order({
            customerName,
            email: normalizeEmail(email),
            phone,
            address,
            items,
            totalAmount: Number(totalAmount),
            status: "Pending"
        }).save();

        try {
            const itemDetails = items.map(item =>
                `Food: ${item.name || "Food Item"}\nPrice: ₹${item.price || 0}\nQuantity: ${item.quantity || 1}`
            ).join("\n\n");

            if (ADMIN_EMAIL) {
                await sendEmail(
                    ADMIN_EMAIL,
                    "New Food Order Received",
                    `Order ID: ${savedOrder._id}\nCustomer: ${customerName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n${itemDetails}\n\nTotal: ₹${totalAmount}\nStatus: Pending`
                );
                console.log("Admin order notification sent.");
            }
        } catch (emailError) {
            console.error("Order Notification Error:", emailError.message);
        }

        res.status(201).json({
            message: "Order placed successfully",
            order: savedOrder
        });
    } catch (error) {
        console.error("Order Error:", error.message);
        res.status(500).json({ message: "Failed to place order." });
    }
});

// ==================== GET ALL ORDERS ====================

app.get("/api/orders", async (req, res) => {
    try {
        res.json(await Order.find().sort({ createdAt: -1 }));
    } catch (error) {
        console.error("Get Orders Error:", error.message);
        res.status(500).json({ message: "Failed to fetch orders." });
    }
});

// ==================== GET ONE ORDER ====================

app.get("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order."
        });
    }
});

// ==================== UPDATE ORDER STATUS ====================

app.put("/api/orders/:id", async (req, res) => {
    try {
        const allowedStatuses = [
            "Pending", "Preparing",
            "Out for Delivery", "Delivered", "Rejected"
        ];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid order status."
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        res.json({
            message: "Order status updated.",
            order
        });
    } catch (error) {
        console.error("Update Order Error:", error.message);
        res.status(500).json({
            message: "Failed to update order."
        });
    }
});

// ==================== DELETE ORDER ====================

app.delete("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        res.json({ message: "Order deleted successfully." });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete order."
        });
    }
});

// ==================== GET USERS ====================

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users."
        });
    }
});

// ==================== CONTACT MESSAGE ====================

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "All contact fields are required."
            });
        }

        const savedContact = await new Contact({
            name,
            email: normalizeEmail(email),
            subject,
            message
        }).save();

        try {
            if (ADMIN_EMAIL) {
                await sendEmail(
                    ADMIN_EMAIL,
                    "New Contact Message - Foodie",
                    `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
                );
                console.log("Admin contact notification sent.");
            }
        } catch (emailError) {
            console.error("Contact Notification Error:", emailError.message);
        }

        res.status(201).json({
            message: "Contact message saved successfully",
            contact: savedContact
        });
    } catch (error) {
        console.error("Contact Error:", error.message);
        res.status(500).json({
            message: "Error saving contact message."
        });
    }
});

// ==================== GET CONTACT MESSAGES ====================

app.get("/api/contact", async (req, res) => {
    try {
        res.json(await Contact.find().sort({ createdAt: -1 }));
    } catch (error) {
        res.status(500).json({
            message: "Error fetching contact messages."
        });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Food Ordering Backend Started");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("--------------------------------");
});