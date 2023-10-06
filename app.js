const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const rootResolver = require("./graphql/resolvers/index");

const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

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
    app.listen(3000, () => {
      console.log("Connected to DB and listening on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
