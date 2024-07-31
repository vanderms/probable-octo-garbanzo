import express from "express";
import bodyParser from "body-parser";
import { loadJson } from "./util/load-json.js";
import cors from "cors";

const { json } = bodyParser;
const app = express();
const port = 9099;

app.use(cors());

app.use(json());

app.get("/schemas/workflow", async (req, res) => {
  const schema = loadJson("./src/schemas/Workflow.json");
  res.json(schema);
});

app.get("/schemas/tasks/supported", async (req, res) => {
  const commons = await loadJson("./src/schemas/Commons.json");
  res.json({
    taskTypes: commons.definitions.taskType.enum,
  });
});

app.get("/schemas/tasks/:taskType", async (req, res) => {
  const task = req.params.taskType;

  const schema = await loadJson(`./src/schemas/${task}.json`);

  res.json(schema);
});

app.post("/workflows", (req, res) => {
  const workflow = req.body;
  res.status(200).json(workflow);
});

app.get("/workflows", async (req, res) => {
  const workflows = [
    {
      id: 1,
      name: "Example Workflow 1",
      tasks: [],
    },
    {
      id: 2,
      name: "Example Workflow 2",
      tasks: [],
    },
  ];
  res.status(200).json(workflows);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
