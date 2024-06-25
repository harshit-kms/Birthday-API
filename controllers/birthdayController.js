var bodyParser = require('body-parser');
var mongoose = require('mongoose');    


//Connecting to the database
mongoose.connect('mongodb+srv://test:bi38YGq5HEvc9WVx@birthdays.aertolr.mongodb.net/?retryWrites=true&w=majority&appName=Birthdays', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

//Create a schema 

var birthdaySchema = new mongoose.Schema({
    name: String,
    dob: Date 
});

var Birthday = mongoose.model('Birthday', birthdaySchema);

var urlencodedParser = bodyParser.urlencoded({ extended: false });


module.exports = function(app){

    app.get('/birthday', function(req, res){
        res.render('index');

    });

    app.post('/birthday', urlencodedParser, async function(req, res) {
        try {
            // We should send the data from view to MongoDB
            if (req.body.name && req.body.dob) {
                var newBirthday = new Birthday({
                    name: req.body.name,
                    dob: new Date(req.body.dob) // Convert dob to a Date object
                });

                const data = await newBirthday.save();
                console.log('Item saved:', data);
                res.redirect('/birthday/success');
            } else {
                res.status(400).send('Name and DOB are required');
            }
        } catch (err) {
            console.error('Error saving item:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    

    app.get('/birthday/success', async function(req, res) {
        try {
            // We should get data from MongoDB and pass it to view
            const data = await Birthday.find({});  // Empty object retrieves all the items in the collection
            const currentDate = new Date();

        // Find the nearest upcoming birthday
        let nearestBirthday = data.reduce((nearest, birthday) => {
            const birthdayDate = new Date(currentDate.getFullYear(), birthday.dob.getMonth(), birthday.dob.getDate());
            const diff = birthdayDate - currentDate;

            if (diff > 0 && (!nearest || diff < nearest.diff)) {
                return { name: birthday.name, dob: birthday.dob, diff: diff };
            } else {
                return nearest;
            }
        }, null);

        // If no upcoming birthdays, find the nearest birthday from January
        if (!nearestBirthday) {
            nearestBirthday = data.reduce((nearest, birthday) => {
                const birthdayDate = new Date(currentDate.getFullYear(), birthday.dob.getMonth(), birthday.dob.getDate());
                const diff = birthdayDate - currentDate;

                if (!nearest || diff < nearest.diff) {
                    return { name: birthday.name, dob: birthday.dob, diff: diff };
                } else {
                    return nearest;
                }
            }, null);
        }
            
            res.render('submit-birthday', { birthdays: data, nearestBirthday: nearestBirthday });
        } catch (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Internal Server Error');
        }
    });
    
    

    app.post('/birthday/delete/:index', async function(req, res) {
        try {
            // Find and delete the birthday entry by index
            var index = req.params.index;
            const birthdays = await Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                await Birthday.findByIdAndDelete(birthdays[index]._id);
                res.redirect('/birthday/success'); // Redirect back to the success page
            } else {
                res.status(400).send('Invalid index');
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/birthday/change/:index', urlencodedParser, async function(req, res) {
        try {
            console.log("hello");
            console.log(req.body);
            // Find and change the birthday entry by index
            var index = req.params.index;
            const birthdays = await Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                birthdays[index].dob = new Date(req.body.newDob); // Update the birthdate
                await birthdays[index].save(); // Save the updated entry
                res.redirect('/birthday/success'); // Redirect back to the success page
            } else {
                res.status(400).send('Invalid index');
            }
        } catch (err) {
            console.error('Error changing item:', err);
            res.status(500).send('Internal Server Error');
        }
    });
    


};