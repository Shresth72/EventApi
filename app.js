const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
//exports a valid middleware, take incoming request and forward it to graphql for parsing

const bcrypt = require("bcryptjs");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");

const app = express();

const events = [];

app.use(bodyParser.json());

app.get(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!  
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      //resolver functions
      events: async () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return {
                ...event._doc,
                _id: event.id,
              };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: async (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return {
              ...result._doc,
              _id: result._doc._id.toString(),
            };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: async (args) => {
        bcrypt
          .hash(args.userInput.password, 12)
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return {
              ...result._doc,
              password: null,
              _id: result.id,
            };
          })
          .catch((err) => {
            throw err;
          });
      },
    },

    graphiql: true,
  })
);

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
