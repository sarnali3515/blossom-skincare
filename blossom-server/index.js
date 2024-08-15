const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgvl42h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const productCollection = client.db("blossom").collection("products")

        // app.get('/products', async (req, res) => {
        //     const result = await productCollection.find().toArray();
        //     res.send(result);
        // })
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
            const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page
            const skip = (page - 1) * limit; // Calculate how many products to skip

            const result = await productCollection.find()
                .skip(skip) // Skip the number of products based on the current page
                .limit(limit) // Limit the number of products returned
                .toArray();

            const totalProducts = await productCollection.countDocuments(); // Get total number of products
            const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

            res.send({
                products: result,
                totalPages,
                currentPage: page
            });
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('blossom server running')
})

app.listen(port, () => {
    console.log(`blossom is running on port ${port}`);
})
