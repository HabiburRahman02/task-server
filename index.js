const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster3.ggy8e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster3`;

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
    const userCollection = client.db('taskDB').collection('users')
    const taskCollection = client.db('taskDB').collection('tasks')

    // user related apis
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const isExist = await userCollection.findOne({ email: user?.email })
      if (isExist) {
        return res.status(409).send({ message: "User already exists." });
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    // task related apis
    app.delete('/deleteTaskById', async (req, res) => {
      const id = req.params;
      console.log(id);
    })
    app.get('/getTaskById', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.findOne(query);
      res.send(result)
    })
    app.get('/tasks', async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    })

    app.post('/tasks', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    })

    app.put('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;        
      const { category } = req.body;         
    
      try {
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },    
          { $set: { category: category } }   
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Task not found" });
        }
    
        res.send({ message: "Task updated successfully", result });
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send({ message: "Server error" });
      }
    });




    await client.connect();
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
  res.send('Task Server running!')
})

app.listen(port, () => {
  console.log(`Task Server running on port ${port}`)
})