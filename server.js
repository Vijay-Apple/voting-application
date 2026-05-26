const express = require("express")
const app = express();
require("dotenv").config()
const bodyParser = require("body-parser")
app.use(bodyParser.json())
const connectDB = require("./db.js")
connectDB()

const userRoutes = require("./routes/userRoutes")
const candidateRoutes = require("./routes/candidateRoutes")

app.use("/candidate", candidateRoutes)
app.use("/user", userRoutes)

app.get("/", (req, res) => {
    res.send("<h1> Voting Application </h1>")
})

const port = process.env.PORT

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
})