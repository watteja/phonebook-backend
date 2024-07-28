const express = require("express");
const app = express();
require("dotenv").config();
const Person = require("./models/person");
const morgan = require("morgan");

let persons = [];

// serve static files from the server
app.use(express.static("dist"));

// allow requests from all origins (can be more specific in production)
const cors = require("cors");
app.use(cors());

// automatically parse JSON data in the request body
app.use(express.json());

// define custom morgan token
morgan.token("requestBody", function (req) {
  // in production environment, avoid logging GDPR-sensitive data
  return JSON.stringify(req.body);
});

// custom morgan format function
const customMorganFormat = (tokens, req, res) => {
  // get the HTTP request method
  const method = tokens.method(req, res);

  // recreate the predefined "tiny" format according to the docs
  const tinyFormat = [
    method,
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");

  // for POST requests only, log the request body as well
  return method === "POST"
    ? `${tinyFormat} ${tokens.requestBody(req, res)}`
    : tinyFormat;
};

app.use(morgan(customMorganFormat));

app.get("/api/persons", (_request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (_request, response) => {
  const currTime = new Date();
  const amount = `${persons.length} ${
    persons.length === 1 ? "person" : "people"
  }`;
  response.send(`<p>Phonebook has info for ${amount}</p><p>${currTime}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "you must provide name and number",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// handle ports when not on localhost (3001) as well
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
