import express from "express"
import bodyParser from "body-parser"
import axios from "axios"

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});