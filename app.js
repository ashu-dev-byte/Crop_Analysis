var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");
// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const port = process.env.PORT || 8080;
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(process.env.mongoo_url || "mongodb://localhost:27017/cropdata");
var db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("connection to first");
});
var MongoClient = require("mongodb").MongoClient;
var url = process.env.mongoo_url || "mongodb://localhost:27017/";

var app = express();

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/", function (req, res) {
  var Name = req.body.Name;
  var email = req.body.email;
  var phonenumber = req.body.phonenumber;
  var text = req.body.text;

  var data = {
    Name: Name,
    email: email,
    phonenumber: phonenumber,
    text: text,
  };
  db.collection("details").insertOne(data, function (err, collection) {
    if (err) throw err;
    console.log("Record inserted Successfully");
  });

  return res.redirect("/");
});

app.get("/", function (req, res) {
  res.render("home");
});

app.post("/search", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("cropdata");

    dbo
      .collection("data")
      .find({
        State_Name: req.body.State,
        District_Name: req.body.district,
        Season: req.body.season,
      })
      .sort({ P_A: -1 })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("Connected to second");
        var userinfo = req.body;
        let temp = [];
        // var t;
        // console.log("result is");
        // console.log(result);
        // console.log("req body is");
        // console.log(req.body);
        function capitalize(str) {
          str = str.split(" ");

          for (var i = 0, x = str.length; i < x; i++) {
            str[i] = str[i][0].toUpperCase() + str[i].substr(1).toLowerCase();
          }

          return str.join(" ");
        }

        var sc = "";
        var ds = capitalize(req.body.district);
        // var ds =
        //   req.body.district.charAt(0).toUpperCase() +
        //   req.body.district.slice(1).toLowerCase();
        console.log(ds);

        switch (req.body.State) {
          case "Andhra Pradesh":
            sc = "AP";
            break;

          case "Arunanchal Pradesh":
            sc = "AR";
            break;

          case "Assam":
            sc = "AS";
            break;

          case "Bihar":
            sc = "BR";
            break;

          case "Chhattisgarh":
            sc = "CT";
            break;

          case "Goa":
            sc = "GA";
            break;

          case "Gujarat":
            sc = "GP";
            break;

          case "Haryana":
            sc = "HR";
            break;

          case "Himachal Pradesh":
            sc = "HP";
            break;

          case "Jharkhand":
            sc = "JH";
            break;

          case "Karnataka":
            sc = "KA";
            break;

          case "Kerala":
            sc = "KL";
            break;

          case "Madhya Pradesh":
            sc = "MP";
            break;

          case "Maharashtra":
            sc = "MH";
            break;

          case "Manipur":
            sc = "MN";
            break;

          case "Meghalaya":
            sc = "ML";
            break;

          case "Mizoram":
            sc = "MZ";
            break;

          case "Nagaland":
            sc = "NL";
            break;

          case "Odisha":
            sc = "OR";
            break;

          case "Punjab":
            sc = "PB";
            break;

          case "Rajasthan":
            sc = "RJ";
            break;

          case "Sikkim":
            sc = "SK";
            break;

          case "Tamil Nadu":
            sc = "TN";
            break;

          case "Telangana":
            sc = "TG";
            break;

          case "Tripura":
            sc = "TR";
            break;

          case "Uttarakhand":
            sc = "UT";
            break;

          case "Uttar Pradesh":
            sc = "UP";
            break;

          case "West Bengal":
            sc = "WB";
            break;

          case "Andaman and Nicobar Islands":
            sc = "AN";
            break;

          case "Chandigarh":
            sc = "CH";
            break;

          case "Dadra and Nagar Haveli":
            sc = "DN";
            break;

          case "Daman and Diu":
            sc = "DD";
            break;

          case "Delhi":
            sc = "DL";
            break;

          case "Jammu and Kashmir":
            sc = "JK";
            break;

          case "	Ladakh":
            sc = "LA";
            break;

          case "Lakshadweep":
            sc = "LD";
            break;

          case "Puducherry":
            sc = "PY";
            break;

          default:
            console.log("No data available");
        }
        // if (req.body.State.localeCompare("Andhra Pradesh") == 0) sc = "AP";

        var options = {
          method: "GET",
          url:
            "https://covid-19-india-data-by-zt.p.rapidapi.com/GetIndiaDistrictWiseDataForState",
          qs: { statecode: sc },
          headers: {
            "x-rapidapi-host": "covid-19-india-data-by-zt.p.rapidapi.com",
            "x-rapidapi-key":
              "5766e3bc55msh528a02590bb44a6p194934jsnb342622fb002",
          },
        };

        request(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var details = JSON.parse(body);
            //console.log(details);

            details["data"].forEach((district) => {
              if (district["name"].localeCompare(ds) == 0) {
                temp[0] = district["active"];
                temp[1] = district["deceased"];
                temp[2] = district["confirmed"];
                temp[3] = district["recovered"];
                console.log(temp);
              }
            });
            // console.log(temp);
          }
          res.render("result", {
            result: result,
            userinfo: userinfo,
            apidata: temp,
          });
          // console.log(temp);
        });
      });

    // console.log(req.body.area)
    // console.log(result[0])
    db.close();
  });
});

app.post("/searchbycrop", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("cropdata");
    dbo
      .collection("data")
      .find({
        State_Name: req.body.StateA,
        District_Name: req.body.districtA,
        Crop: req.body.cropA,
      })
      .sort({ price: -1 })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("Connected to third");
        var t;
        //console.log("Result is");
        //console.log(result);
        // console.log("Request starts from here");
        // console.log(req.body);
        // console.log(mapboxgl);
        var userinfo = req.body;
        res.render("result1", { result: result, userinfo: userinfo });
        //  console.log(req.body.area)
        //   console.log(result[0])
        db.close();
      });
  });
});

app.get("/result");

app.listen(port, function () {
  console.log('Server started at the port'+port);
});
