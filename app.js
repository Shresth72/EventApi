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
          creator: "5f9b6b3b7b0b3c2b1c0b0b3c",
        });

        let createdEvent;

        return event
          .save()
          .then(async (result) => {
            createdEvent = {
              ...result._doc,
              _id: result._doc._id.toString(),
            };
            return User.findById("5f9b6b3b7b0b3c2b1c0b0b3c").then((user) => {
              if (!user) {
                throw new Error("User not found.");
              }
              user.createdEvents.push(event);
              return user.save();
            });
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: async (args) => {
        User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exists already.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
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
