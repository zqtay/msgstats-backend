import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// Env Var
dotenv.config();
const { MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DB, PORT } = process.env;

// Mongo
let dbUri = MONGODB_URI ? MONGODB_URI : "";
if (MONGODB_USERNAME && MONGODB_PASSWORD) {
  const dbUser = MONGODB_USERNAME;
  const dbPw = MONGODB_PASSWORD;
  dbUri = dbUri.replace("<username>", dbUser).replace("<password>", dbPw);
}

const client = new MongoClient(dbUri, { serverApi: ServerApiVersion.v1 });
client.connect().then(
  () => {
    console.log("Database connected!");
  }
).catch(err => {
  client.close();
});
const MSGDATA_COLLECTION_NAME = "msg_data";

// Express
const app: Express = express();
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express Server');
});

app.post('/echo', (req: Request, res: Response) => {
  res.send(req.body);
});

app.get('/test', (req: Request, res: Response) => {
  const collection = client.db(MONGODB_DB).collection(MSGDATA_COLLECTION_NAME);
  collection.find({}).toArray().then(
    r => res.send(r)
  );
});

app.post('/test', (req: Request, res: Response) => {
  let body = req.body;
  if (body) {
    body = {...body, "_dateCreated": (new Date()).toISOString()};
    const collection = client.db(MONGODB_DB).collection(MSGDATA_COLLECTION_NAME);
    collection.insertOne(body).then(
      r => {
        res.status(201);
        res.send({
          "insertedId": r.insertedId.toHexString()
        });
      }
    );
  }
  else {
    res.status(500);
    res.send("Error");
  }
});

app.get('/test/:id', async (req: Request, res: Response) => {
  const collection = client.db(MONGODB_DB).collection(MSGDATA_COLLECTION_NAME);
  const id = new ObjectId(req.params.id);
  const r = await collection.findOne({ "_id": id });
  if (r) {
    res.send(r);
  }
  else {
    res.status(404);
    res.send("Not found");
  }
});

app.delete('/test/:id', async (req: Request, res: Response) => {
  const collection = client.db(MONGODB_DB).collection(MSGDATA_COLLECTION_NAME);
  const id = new ObjectId(req.params.id);
  const r = await collection.deleteOne({ "_id": id });
  if (r.deletedCount === 0) {
    res.status(404);
    res.send("Not found");
  }
  else if (r.deletedCount === 1) {
    res.status(204);
    res.send("Deleted");
  }
  else {
    res.status(500);
    res.send("Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});