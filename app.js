import express, { application } from "express"
import bodyParser from "body-parser"
import axios from "axios"
import { GoogleGenerativeAI } from "@google/generative-ai"
import "dotenv/config"

const app = express();
const PORT = 3000;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// const prompt = "Explain how generative model(llm) works. answer in one sentence only";
// const result = await model.generateContent(prompt);
// console.log(result.response.text());


// Google Maps Search
const url = "https://places.googleapis.com/v1/places:searchText";
const data = {
  textQuery: "Badminton Clubs Near Bibwewadi, Pune",
};
const headers = {
  "Content-Type": "application/json",
  "X-Goog-Api-Key": process.env.MAPS_API_KEY,
  "X-Goog-FieldMask":
    "places.displayName,places.formattedAddress,places.id,places.location,places.rating,places.photos",
};
// try {
//     const response = await axios.post(url, data, { headers });

//     response.data.places.forEach(place => {
//         console.log("Name: " + place.displayName.text + "\n" + "Address:" + place.formattedAddress + "\n" + "Location: " + place.location.latitude + ", " + place.location.longitude + "\n" + "Rating: " + place.rating + "\n" + "Google Map Link: " + place.photos[0].googleMapsUri + "\n");
//     });
    
// } catch (error) {
//     console.log(error.message); 
// }

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/auth", (req, res) => {
  res.redirect(
    `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=http://localhost:3000/temp`
  );
})

app.get("/temp", async (req, res) => {

  // console.log(req.query);  
  const access_code = req.query.code;

  console.log("Authorization Code: " + access_code);
  
  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: client_id,
    client_secret: client_secret,
    code: access_code,
    redirect_uri: "http://localhost:3000/temp",
  });

  try {
    const response = await axios.post( 
      "https://www.eventbrite.com/oauth/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  
    console.log("Access Token Received for exchange of authorization " + response.data.access_token);
    
    res.redirect("/temp2?token=" + response.data.access_token);
    
  } catch (error) {
     console.error(
       "Error exchanging code for token: ",
       error.response?.data || error.message
     );
     res.send("Error occurred while fetching the access token.");
  }

});

app.get("/temp2", async (req, res) => {

  const access_token = req.query.token;

  try {
    const response = await axios.get(
      "https://www.eventbriteapi.com/v3/users/me/",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const response2 = await axios.get(
      `https://www.eventbriteapi.com/v3/users/${response.data.id}/organizations/`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const response3 = await axios.get(
      `https://www.eventbriteapi.com/v3/organizations/${response2.data.organizations[0].id}/events/`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    
    res.send(response3.data);


  } catch (error) {
    res.send(error.message)
  }


});

app.post("/search", (req, res) => {
    console.log(req.body);

    res.send("Hello World" + req.body.typeOfPlace + req.body.mode);

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});