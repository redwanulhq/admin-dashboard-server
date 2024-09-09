const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { DB_USER, DB_PASS } = process.env;
const { MongoClient, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.baiua.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
console.log(uri);
async function run() {
    try {
        await client.connect();
        const database = client.db("admin_dashboard");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");

        // GET all order API
        app.get("/orders", async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // Add user API
        app.post("/users", async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        // Get admin API
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // make admin API
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: false };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
