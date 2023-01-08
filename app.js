const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/MyModules/date.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

let items = [];
let workItems = [];

app.get("/", function(req, res){
    let day = date.getDate();
    res.render("list", {listTitle: day, newListItems: items});
});


app.post("/", function(req, res){
    let item = req.body.newItem;
    console.log(req.body.list);

    if(req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/work");
    }
    else{
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function(req, res){
    res.render( "list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Running on port 3000");
});