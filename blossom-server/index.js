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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const search = req.query.search || '';
            const brand = req.query.brand || '';
            const category = req.query.category || '';
            const minPrice = parseFloat(req.query.minPrice) || 0;
            const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
            const sort = req.query.sort || '';

            // Create a filter object
            const query = {
                ...(search && { productName: { $regex: search, $options: 'i' } }),
                ...(brand && { brandName: { $regex: brand, $options: 'i' } }),
                ...(category && { category: { $regex: category, $options: 'i' } }),
                price: { $gte: minPrice, $lte: maxPrice }
            };

            // Create a sort object
            let sortOrder = {};
            if (sort === 'price-asc') {
                sortOrder.price = 1; // Low to High
            } else if (sort === 'price-desc') {
                sortOrder.price = -1; // High to Low
            } else if (sort === 'date-desc') {
                sortOrder.creationDate = -1; // Newest first
            }

            const result = await productCollection.find(query)
                .sort(sortOrder)
                .skip(skip)
                .limit(limit)
                .toArray();

            const totalProducts = await productCollection.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / limit);

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
