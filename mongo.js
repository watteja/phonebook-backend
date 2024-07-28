const mongoose = require("mongoose");

if (process.argv.length !== 3 && process.argv.length !== 5) {
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
  name: String,
  number: String,
});

// define the model for a phonebook entry
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  // print all phonebook entries from the database
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
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
