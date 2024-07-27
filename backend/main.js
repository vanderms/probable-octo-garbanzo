import express from "express";
import bodyParser from "body-parser";

const { json } = bodyParser;
const app = express();
const port = 9099;

app.use(json());

app.get("/schemas/workflow", (req, res) => {
  res.json({
    message:
      "The Schema file of workflow, Workflow.json will be sent as response.",
  });
});

app.get("/schemas/tasks/supported", (req, res) => {
  res.json({
    taskTypes: ["START", "END", "SCRIPT", "REST"],
  });
});

app.get("/schemas/tasks/:taskType", (req, res) => {
  const taskType = req.params.taskType;
  res.json({
    message: `The Corresponding task type schema file, for ${taskType} will be sent as response`,
  });
});

app.post("/workflows", (req, res) => {
  const workflow = req.body;
  res.status(200).json(workflow);
});

app.get("/workflows", (req, res) => {
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
