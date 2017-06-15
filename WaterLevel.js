var mongoose = require('mongoose');

var WaterLevel = new mongoose.Schema({
  time : {
    type: Date
  },
  level: {
    type: Number,
    default: 0
  }
});
exports.WaterLevel = db.model('WaterLevel', WaterLevel);