const express = require("express");
const router = express.Router();
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const moment = require('moment')
router.get("/", auth, async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send("customerId not provided");

  if (!req.body.customerId) return res.status(400).send("movieId not provided");

  const rental = await Rental.findOne({
    'customer_id': req.body.customerId,
    'movie_id': req.body.movieId,
  });

  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned)
    return res.status(400).send("Returned already processed.");

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
  await rental.save();
  
  await Movie.update({
      _id: rental.movie_id,
  }, {
      $inc: {
          numberInStock: 1
      }
  })

  return res.status(200).send(rental);
});

module.exports = router;
