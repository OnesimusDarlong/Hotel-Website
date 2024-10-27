const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().then(() => {
  console.log("connnected to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
}


app.get("/", (req, res) => {
  res.send("root is working");
});

//Index Route
app.get("/listings",wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
})
);

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
})
);

//Create Route
app.post("/listings", wrapAsync(async (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if(result.error){
    throw new ExpressError(400, result.error);
  }
  const newListing = await new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})
);

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
})
);

//Update Route
app.put("/listings/:id",wrapAsync(async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
})
);

//Delete Route
app.delete("/listings/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
})
);


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

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message= "Something went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, (req, res) => {
  console.log("Server is listening on port 8080");
});
