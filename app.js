import express, { application } from "express"
import bodyParser from "body-parser"
import axios from "axios"
import { GoogleGenerativeAI } from "@google/generative-ai"
import "dotenv/config"

const app = express();
const PORT = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prompt = "Explain how generative model(llm) works. answer in one sentence only";
const result = await model.generateContent(prompt);
console.log(result.response.text());


// Google Maps Search
const url = "https://places.googleapis.com/v1/places:searchText";
const data = {
  textQuery: "Badminton Clubs Near Bibwewadi, Pune",
};
const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.MAPS_API_KEY,
    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress'
}
try {
    const response = await axios.post(url, data, { headers });

    response.data.places.forEach(place => {
        console.log("Name: " + place.displayName.text + "\n" + "Address:" + place.formattedAddress + "\n");
    });
} catch (error) {
    console.log(error.message); 
}



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});