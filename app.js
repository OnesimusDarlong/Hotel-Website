const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));

main().then(() =>{
  console.log("connnected to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
}

app.get("/", (req,res) =>{
    res.send("root is working");
});

app.get("/listings",async (req, res) =>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings});
});

app.get("/listings/:id",async (req, res) =>{
  let {id} = req.params;
  const listing  = await Listing.findById(id);
  res.render("listings/show.ejs", {listing});

});

// app.get("/listings",async (req, res) =>{
//   let sampleListing = new Listing({
//     title: "My new villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Delhi",
//     country: "India",
//   });

//   await sampleListing.save()
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.listen(8080, (req, res) =>{
    console.log("Server is listening on port 8080"); 
});
