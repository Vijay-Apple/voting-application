const jwt = require("jsonwebtoken")

const jwtAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized: No token provided"
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded

        next()
    } catch (error) {
        console.log("JWT Error:", error.message)

        return res.status(401).json({
            message: "Unauthorized: Invalid token"
        })
    }
}

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    )
}

module.exports = {
    jwtAuthMiddleware,
    generateToken
}