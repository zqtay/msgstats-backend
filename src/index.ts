import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/echo', (req: Request, res: Response) => {
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});