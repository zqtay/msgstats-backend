"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
// Env Var
dotenv_1.default.config();
const { MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DB, PORT } = process.env;
// Mongo
let dbUri = MONGODB_URI ? MONGODB_URI : "";
if (MONGODB_USERNAME && MONGODB_PASSWORD) {
    const dbUser = MONGODB_USERNAME;
    const dbPw = MONGODB_PASSWORD;
    dbUri = dbUri.replace("<username>", dbUser).replace("<password>", dbPw);
}
const client = new mongodb_1.MongoClient(dbUri, { serverApi: mongodb_1.ServerApiVersion.v1 });
client.connect().then(() => {
    console.log("Database connected!");
}).catch(err => {
    client.close();
});
const MSGSTATS_COLLECTION = "msgstats";
// Express
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Express Server');
});
app.post('/echo', (req, res) => {
    res.send(req.body);
});
app.get('/test', (req, res) => {
    const collection = client.db(MONGODB_DB).collection(MSGSTATS_COLLECTION);
    collection.find({}).toArray().then(r => res.send(r));
});
app.get('/test/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = client.db(MONGODB_DB).collection(MSGSTATS_COLLECTION);
    const id = req.params.id;
    const r = yield collection.findOne({ "id": id });
    if (r) {
        res.send(r);
    }
    else {
        res.status(404);
        res.send("Not found");
    }
}));
app.post('/test/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let body = req.body;
    const id = req.params.id;
    if (body) {
        const doc = Object.assign({ "id": id, "_dateCreated": (new Date()).toISOString() }, body);
        const collection = client.db(MONGODB_DB).collection(MSGSTATS_COLLECTION);
        const r = yield collection.findOne({ "id": id });
        if (r) {
            res.status(302);
            res.send(`Document with id ${id} already exists`);
        }
        else {
            collection.insertOne(doc).then(r => {
                res.status(201);
                res.send({
                    "insertedId": r.insertedId.toHexString()
                });
            });
        }
    }
    else {
        res.status(500);
        res.send("Error");
    }
}));
app.delete('/test/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = client.db(MONGODB_DB).collection(MSGSTATS_COLLECTION);
    const id = req.params.id;
    const r = yield collection.deleteOne({ "id": id });
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
}));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
