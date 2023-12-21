const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5m360x6.mongodb.net/?retryWrites=true&w=majority`;

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


        const taskCollection = client.db('Task-DB').collection('tasks');
        const userCollection = client.db('Task-DB').collection('user');


        //post user

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        //post task

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result)
        })

        //get tasks for a specific user
        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;

            try {
                const result = await taskCollection.find({ email: email }).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error retrieving tasks:', error);
                res.status(500).send('Internal Server Error');
            }
        });


        // Delete task
        app.delete('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;
            console.log('Deleting task with ID:', taskId);

            const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) })
            console.log('Delete result:', result);

            if (result.deletedCount > 0) {
                res.send({ success: true });
            } else {
                res.status(404).send({ success: false, message: 'Task not found' });
            }
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





app.get('/', async (req, res) => {
    res.send('task management server is running')
})

app.listen(port, (req, res) => {
    console.log(`server running at port:${port}`);
})