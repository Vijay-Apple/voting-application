const express = require("express");
const { jwtAuthMiddleware } = require("../jwt");

const router = express.Router();

const Candidate = require("../models/candidate");
const User = require("../models/user");

// ================= CHECK ADMIN ROLE =================

const checkAdminRole = async (userId) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            return false;
        }

        return user.role === "admin";

    } catch (error) {

        console.log("CHECK ADMIN ROLE ERROR:", error);

        return false;
    }
};

// ================= ADD CANDIDATE =================

router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {

        const isAdmin = await checkAdminRole(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        const newCandidate = new Candidate(req.body);

        const response = await newCandidate.save();

        res.status(201).json({
            message: "Candidate added successfully",
            candidate: response
        });

    } catch (error) {

        console.log("ADD CANDIDATE ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// ================= UPDATE CANDIDATE =================

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {

        const isAdmin = await checkAdminRole(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        const candidateId = req.params.candidateId;

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            candidateId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

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

        console.log("UPDATE CANDIDATE ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// ================= DELETE CANDIDATE =================

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {

        const isAdmin = await checkAdminRole(req.user.userId);

        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }

        const candidateId = req.params.candidateId;

        const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);

        if (!deletedCandidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        res.status(200).json({
            message: "Candidate deleted successfully"
        });

    } catch (error) {

        console.log("DELETE CANDIDATE ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// ================= VOTE FOR CANDIDATE =================

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {

        const candidateId = req.params.candidateId;

        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin cannot vote
        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admins are not allowed to vote"
            });
        }

        // User already voted
        if (user.isVoted) {
            return res.status(400).json({
                message: "You have already voted"
            });
        }

        // Safe arrays
        candidate.votes = candidate.votes || [];
        user.votes = user.votes || [];

        // Add vote
        candidate.votes.push({
            user: userId
        });

        candidate.voteCount = (candidate.voteCount || 0) + 1;

        await candidate.save();

        // Update user
        user.isVoted = true;

        user.votes.push(candidateId);

        await user.save();

        res.status(200).json({
            message: "Vote recorded successfully",
            candidate
        });

    } catch (error) {

        console.log("VOTE CANDIDATE ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// ================= VOTE COUNT =================

router.get("/vote/count", async (req, res) => {
    try {

        const candidates = await Candidate.find()
            .sort({ voteCount: -1 });

        if (!candidates || candidates.length === 0) {
            return res.status(404).json({
                message: "No candidates found"
            });
        }

        const voteRecords = candidates.map(c => ({
            candidateId: c._id,
            name: c.name,
            party: c.party,
            voteCount: c.voteCount
        }));

        res.status(200).json({
            message: "Vote count retrieved successfully",
            voteRecords
        });

    } catch (error) {

        console.log("GET VOTE COUNT ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;