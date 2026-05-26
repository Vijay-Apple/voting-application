const express = require("express");
const { generateToken, jwtAuthMiddleware } = require("../jwt");

const router = express.Router();

const User = require("../models/user");


// ================= SIGNUP ROUTE =================

router.post("/signup", async (req, res) => {
    try {

        const data = req.body;

        const user = new User(data);

        const response = await user.save();

        const payload = {
            userId: response._id,
            role: response.role
        };

        const token = generateToken(payload);

        res.status(201).json({
            message: "User registered successfully",
            user: response,
            token
        });

    } catch (error) {

        console.log("SIGNUP ERROR:", error.message);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


// ================= LOGIN ROUTE =================

router.post("/login", async (req, res) => {
    try {

        const { aadharCardNumber, password } = req.body;

        const user = await User.findOne({ aadharCardNumber });

        if (!user) {
            return res.status(401).json({
                message: "Invalid aadharCardNumber or password"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid aadharCardNumber or password"
            });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = generateToken(payload);

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {

        console.log("LOGIN ERROR:", error.message);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


// ================= PROFILE ROUTE =================

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User profile retrieved successfully",
            user
        });

    } catch (error) {

        console.log("PROFILE ERROR:", error.message);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


// ================= CHANGE PASSWORD ROUTE =================

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {

        const userId = req.user.userId;

        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid old password"
            });
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {

        console.log("CHANGE PASSWORD ERROR:", error.message);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;