const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const rootResolver = require("./graphql/resolvers/index");

const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * means all domains
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  ); // * means all domains
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // 200 means OK
  }
});

app.use(isAuth);

app.get(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: rootResolver,
    graphiql: true,
  })
);

app.get("/", (req, res, next) => {
  res.send("Hello World");
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cqbztpc.mongodb.net/Cluster0`
  )
  .then(() => {
    app.listen(3001, () => {
      console.log("Connected to DB and listening on port 3001");
    });
  })
  .catch((err) => {
    console.log(err);
  });
