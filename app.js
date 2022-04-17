//jshint esversion:6
//mongo "mongodb+srv://cluster0.rljsn.mongodb.net/myFirstDatabase" --username vishal
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash");
const day = date.getDate();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://vishal:vishal123@cluster0.rljsn.mongodb.net/todolistDB');
const itemSchema = {
    name: String
};


const listSchema = {
    name: String,
    items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Hello this is todolist"
});
const item2 = new Item({
    name: "Click + to insert items"
});
const item3 = new Item({
    name: "Press <-- to delete items"
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved our default items to DB");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: day, newListItems: foundItems });
        }
    });
});

app.get("/:customListName", function(req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundItem) {
        if (!err) {
            if (!foundItem) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //Redirect to the list
                res.render("list", { listTitle: foundItem.name, newListItems: foundItem.items });
            }
        }
    });

});

app.post("/", function(req, res) {
    const itemAdded = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemAdded
    });
    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res) {

    const itemDeleted = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(itemDeleted, function(err) {
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemDeleted } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});