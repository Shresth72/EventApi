const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./merge");

module.exports = {
  //resolver functions
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId,
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creatorUser = await User.findById("5f9b6b3b7b0b3c2b1c0b0b3c");
      if (!creatorUser) {
        throw new Error("User not found.");
      }
      creatorUser.createdEvents.push(event);
      await creatorUser.save();

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
