/**
 * This is just a DB helper module.
 * It's not necessary for standard app operation.
 * It's pretty useful for testing things at the database level though.
 * Run it with, for example: node mongo.js yourDbPassword
 */

const mongoose = require("mongoose");

if (![3, 5].includes(process.argv.length)) {
  console.log("incorrect number of arguments");
  process.exit(1);
}

const password = process.argv[2];
// name of the database which will be created if it doesn't exist
const dbName = "PhonebookApp";
const url = `mongodb+srv://mateyast:${password}@cluster0.srun1uv.mongodb.net/${dbName}?retryWrites=true&w=majority`;
mongoose.set("strictQuery", false);
mongoose.connect(url);

// define the schema for a phonebook entry
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        // valid phone number format:
        // - min length: 8
        // - two or three digits, hyphen, then rest digits
        return /^\d{2,3}-\d{5,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "User phone number required"],
  },
});

// define the model for a phonebook entry
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  // // print all phonebook entries from the database
  // Person.find({}).then((result) => {
  //   console.log("phonebook:");
  //   result.forEach((person) => {
  //     console.log(`${person.name} ${person.number}`);
  //   });
  //   mongoose.connection.close();
  // });

  // init db with (valid) dummy data
  const dummyData = [
    {
      name: "Arto Hellas",
      number: "040-123456",
    },
    {
      name: "Ada Lovelace",
      number: "39-5323523",
    },
    {
      name: "Dan Abramov",
      number: "12-234345",
    },
    {
      name: "Mary Poppendieck",
      number: "39-236423122",
    },
  ];
  Person.insertMany(dummyData).then(() => {
    console.log("inserted dummy data");
    mongoose.connection.close();
  });
} else {
  // add a new entry to the phonebook
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({
    name: name,
    number: number,
  });
  person.save().then((result) => {
    console.log(
      `added ${result.name} with number ${result.number} to the phonebook`
    );
    mongoose.connection.close();
  });
}
