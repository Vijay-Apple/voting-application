const express = require("express");
const { jwtAuthMiddleware } = require("../jwt");

const router = express.Router();

const Candidate = require("../models/candidate");
const User = require("../models/user");


// ================= CHECK ADMIN ROLE =================

const checkAdminRole = async (userId) => {

    console.log("Checking admin role for userId:", userId);

    try {

        const user = await User.findById(userId);

        console.log("User Found:", user);

        if (!user) {
            console.log("User not found");
            return false;
        }

        console.log("User Role:", user.role);

        return user.role === "admin";

    } catch (error) {

        console.log("CHECK ADMIN ROLE ERROR:", error);

        return false;
    }
};


// ================= ADD CANDIDATE =================

router.post("/", jwtAuthMiddleware, async (req, res) => {

    console.log("===== ADD CANDIDATE API CALLED =====");

    try {

        console.log("Decoded User:", req.user);

        const isAdmin = await checkAdminRole(req.user.userId);

        console.log("Is Admin:", isAdmin);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        console.log("Request Body:", req.body);

        const data = req.body;

        const newCandidate = new Candidate(data);

        console.log("Saving candidate...");

        const response = await newCandidate.save();

        console.log("Candidate Saved:", response);

        res.status(201).json({
            message: "Candidate added successfully",
            candidate: response
        });

    } catch (error) {

        console.log("ADD CANDIDATE ERROR:");
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


// ================= UPDATE CANDIDATE =================

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {

    console.log("===== UPDATE CANDIDATE API CALLED =====");

    try {

        console.log("Decoded User:", req.user);

        const isAdmin = await checkAdminRole(req.user.userId);

        console.log("Is Admin:", isAdmin);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        const candidateId = req.params.candidateId;

        console.log("Candidate ID:", candidateId);

        console.log("Update Data:", req.body);

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            candidateId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        console.log("Updated Candidate:", updatedCandidate);

        if (!updatedCandidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        res.status(200).json({
            message: "Candidate updated successfully",
            candidate: updatedCandidate
        });

    } catch (error) {

        console.log("UPDATE CANDIDATE ERROR:");
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


// ================= DELETE CANDIDATE =================

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {

    console.log("===== DELETE CANDIDATE API CALLED =====");

    try {

        console.log("Decoded User:", req.user);

        const isAdmin = await checkAdminRole(req.user.userId);

        console.log("Is Admin:", isAdmin);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        const candidateId = req.params.candidateId;

        console.log("Candidate ID:", candidateId);

        const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);

        console.log("Deleted Candidate:", deletedCandidate);

        if (!deletedCandidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        res.status(200).json({
            message: "Candidate deleted successfully"
        });

    } catch (error) {

        console.log("DELETE CANDIDATE ERROR:");
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;