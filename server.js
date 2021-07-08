const express = require("express");
const app = express();
const { Pool } = require("pg");



const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels2",
  password: "admin",
  port: 5432,
});



 
const bodyParser = require("body-parser");
app.use(bodyParser.json());


app.get("/hotels", function(req, res) {
    pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT * FROM hotels', (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          res.json(result.rows);
        })
      })
});

app.post("/hotels", function (req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;
  
    const query =
      "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
  
    pool
      .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
      .then(() => res.send("Hotel created!"))
      .catch((e) => console.error(e));
  });

  const deleteBookings = "DELETE FROM bookings WHERE customer_id=$1";
  const deleteCustomers = "DELETE FROM customers WHERE id=$1";
  
  app.delete("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;
  
    pool
      .query(deleteBookings, [customerId])
      .then(() => {
        pool
          .query(deleteCustomers, [customerId])
          .then(() => res.send(`Customer ${customerId} deleted!`))
          .catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  });

const updateHotel = `UPDATE hotels SET name = $1, rooms = $2, postcode = $3 where id = $4`;
  
app.put("/hotels", function (req, res) {
	let { id, name, rooms, postcode } = req.body;
	let values = [name, rooms, postcode, id];
	pool.connect((err, client, release) => {
		if (err) {
			return console.error("Error acquiring client", err.stack);
		}

		client.query(updateHotel, values, (err, result) => {
			release();
			if (result.rowCount > 0) {
				res.status(201).send("1 row was updated");
			} else {
				res.status(404).send("Bad request");
			}
		});
	});
});





app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});