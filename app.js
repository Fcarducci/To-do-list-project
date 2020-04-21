//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash")

const mongoose=require("mongoose");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-francesco:23411431Fc@cluster0-wnsx9.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema=new mongoose.Schema ({
  name: {
    type:String,
    required: true
  }
});




const Item=mongoose.model("item", itemsSchema);



const item1= new Item({
  name: "Welcome to your todolist!"
});

const item2= new Item({
  name: "Hit the + button to add new item."
});

const item3= new Item({
  name: "<-- Hit this to delete an item,"
});

let defaultItems=[item1, item2, item3];

const listSchema=new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const CustomModel=mongoose.model("list", listSchema);



app.get("/", function(req, res) {

  Item.find((err, items)=>{
    if(items.length==0){
      Item.insertMany(defaultItems, (err)=>{
       if(err){
         console.log("You have an error " + err)
       }else{
         console.log("Successfully")
         res.redirect("/");
       }
     })
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
    
  });  
});



app.get("/:word", function(req,res){
 let urlWord=_.capitalize(req.params.word);
 console.log(urlWord)

 CustomModel.findOne({name: urlWord}, (err, element)=>{ 
  // items.forEach((item)=>{
     if(element==null){
      const list=new CustomModel({
        name: urlWord,
        items:defaultItems
      });
     list.save();
     res.redirect("/" + urlWord);
     }else{
       console.log("the collections exits")
       res.render("list", {listTitle: urlWord, newListItems: element.items});
     }
  //  }))
 })
 

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName=req.body.list;

  const input= new Item({
   name: item
  });
 
  if(listName=="Today"){
    input.save();
    res.redirect("/");
  }else{
    CustomModel.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(input);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  
});

app.post("/delete", (req, res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Remove item!");
        res.redirect("/");
      }
    })
  }else{
    CustomModel.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, results)=>{
    if(!err){
      res.redirect("/" + listName)
    }
   })

  }



  
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
