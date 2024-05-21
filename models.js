import mongoose from 'mongoose';

const models = {};

console.log("connecting to mongodb");
await mongoose.connect("mongodb+srv://when2eat:when2eat@when2eat-main-cluster.qb4mkmc.mongodb.net/");

console.log("successfully connected to mongodb");

const usersSchema = new mongoose.Schema({
  username: String,
  email: String,
  points: { type: Number, default: 5 },
  friends: [String],
  created_date: Date
});

models.Users = mongoose.model('Users', usersSchema);

console.log("mongoose model users created");

const restaurantsSchema = new mongoose.Schema({
  name: String,
  address: String,
  cuisine: String,
  price_range: String,
  rating: Number,
  yelp_google_id: String,
  votes: Number,
  created_date: Date
});

models.Restaurants = mongoose.model('Restaurants', restaurantsSchema);

console.log("mongoose model restaurants created");

const wheelsSchema = new mongoose.Schema({
  created_date: Date,
  spun_at: Date
});

models.Wheels = mongoose.model('Wheels', wheelsSchema);

console.log("mongoose model Wheels created");

const user_historySchema = new mongoose.Schema({
  user_id: String,
  restaurant_id: String,
  date_visited: Date,
  rating: Number
});

models.UserHistory = mongoose.model('User History', user_historySchema);

console.log("mongoose model User History created");

const friendshipSchema = new mongoose.Schema({
  user_one_id: String,
  user_two_id: String,
  status: String,
  created_at: Date
});

models.Friendship = mongoose.model('Friendship', friendshipSchema);

const wheels_entriesSchema = new mongoose.Schema({
  user_added: String,
  restaurant_id: String,
  restaurant: String,
  weight: Number
});

const lobbiesSchema = new mongoose.Schema({
  lobby_name: String,
  users: [String],
  choices: [wheels_entriesSchema],
  status: Boolean // true == open, false == closed
});

models.Lobbies = mongoose.model('Lobbies', lobbiesSchema);

console.log("mongoose model Lobbies created");

export default models;