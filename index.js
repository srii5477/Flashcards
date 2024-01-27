import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import assert from "assert";

// how to reduce the number of lines in my code? ✓
// what if the content in my flashcard exceeds its limit? ✓
// add a recall functionality: flip the card around and enter data and match it with the contents on front
// associate records with a username and password

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const conn1 = mongoose.createConnection("mongodb://localhost:27017/cardsDB");
const conn2 = mongoose.createConnection("mongodb://localhost:27017/usersDB");


var firstTime = true;

const cardSchema = new mongoose.Schema({
    id: Number,
    content: {
        type: String,
        // maxLength: 75,
        required: true,
    },
    username: String,
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

const User = conn2.model("User", userSchema);

const Card = conn1.model("Card", cardSchema);
// var placeholder = [
//     {
//         content: "This is a placeholder for a flashcard.",
//     }
const card1 = new Card({
    id: 1,
    content: "This is a placeholder for a flashcard",
    username: "abc",
});

const userBeg = new User({
    username: "abc",
    password: "123",
});

User.insertMany(userBeg);
Card.insertMany(card1);

app.get("/", async (req, res) => {
    const cardsList = await Card.find();
    res.render("index.ejs", { info: cardsList });
})

app.post("/register", async (req, res) => {
    const usersList = await User.find({ username: req.body.username, password: req.body.pw });
    if(usersList == []) {
        const userNew = new User({
            username: req.body.username,
            password: req.body.pw,
        });
        User.insertMany(userNew);
        res.render("index.ejs", { info: [] });
    } else {
        const usersReq = await Card.find({ username: req.body.username });
        res.render("index.ejs", { info: usersReq });
    }
    
})

app.post("/card", async (req, res) => {
    if(firstTime == true) {
        await Card.deleteOne({ id: 1 });
        firstTime = false;
    }
    for (let i = 1; i <= 6; i++) {
        let str = "card" + i;
        if (req.body[str] != '') {
            
            let len = await Card.find();
            let obj = new Card({
                id: len.length + 1,
                content: req.body[str].substring(0, 76),
            });
            
            Card.insertMany(obj);
        }
    }
    let list = await Card.find();
    res.render("index.ejs", { info: list });
})

app.listen(3000, () => {
    console.log(`Server is all ears on port 3000.`);
})