const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/MyModules/date.js");
const {Schema} = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.set("strictQuery", false);


main().catch(err => console.log(err));

async function main(){

    const DataBaseName = "ToDoListDB";

    await mongoose.connect("mongodb://127.0.0.1:27017/" + DataBaseName, {useNewUrlParser: true});

    const ItemsSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        }
    });

    const Item = mongoose.model("Item", ItemsSchema);


    const food = new Item({
        name: "Buy food"
    });
    const utilities = new Item({
        name: "Buy utilities"
    });
    const laptop = new Item({
        name: "Buy laptop"
    });

    const defaultItems = [food, utilities, laptop];

    const listSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        items: [ItemsSchema]
    });

    const List = mongoose.model("List", listSchema);





    app.get("/", function(req, res){

        Item.find({}, (err, foundItems) => {
            if (foundItems.length === 0){
                Item.insertMany(defaultItems, err => err ? console.log(err) : console.log("Successfully saved default items"));
                if (err) {
                    console.log(err + " couldn't find anything");
                    return;
                }
                res.redirect("/");
            }
            // console.log(foundItems);
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        });
    });

    // Use express route params to creat
    app.get("/:customListName", (req, res) => {
        const customListName = _.capitalize(req.params.customListName);


        List.findOne({name: customListName}, (err, foundList) => {
            if(!err){
                if(!foundList){
                    const list = new List({
                        name: customListName,
                        items: defaultItems
                    });
                    list.save();
                    res.redirect("/" + customListName);
                }
                else {
                    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
                }
            }
        });


    });


    app.post("/", function(req, res){
        const itemName = req.body.newItem;
        const listName = req.body.list;

        const item = new Item({
            name: itemName
        });

        if(listName === "Today"){
            item.save();
            res.redirect("/");
        }
        else{
            List.findOne({name: listName}, (err, foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
        }



    });

    app.post("/delete", (req, res) => {
        const selectedItemID = req.body.checkbox;
        const listName = req.body.listName;

        console.log("This is: " + listName);


        if (listName === "Today") {
            Item.findByIdAndRemove(selectedItemID, err => {
                if (!err) {
                    console.log("Successfully Deleted");
                }
                console.log(err);
            });
            res.redirect("/");
        }
        else {
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: selectedItemID}}}, (err, response)=>{
                if(!err){
                    res.redirect("/" + listName);
                }
            });
        }
    });


    app.get("/about", function(req, res){
        res.render("about");
    });

    app.listen(3000, function(){
        console.log("Running on port 3000");
    });

}


