var client = require('cheerio-httpcli');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/mitake');

var BASE_URL='http://www1.river.go.jp'

client.fetch(BASE_URL + '/cgi-bin/DspWaterData.exe?KIND=9&ID=303051283310070').then(function (result) {
  console.log(result.$('IFRAME')[0].attribs.src);
  return client.fetch(BASE_URL + result.$('IFRAME')[0].attribs.src);
}).then(function(res) {
  var $ = res.$;
  $('tr').map(function (e, i, a) {
    var x = $(this.children).text().replace(/\n\W+(\d{4})\/(\d{2})\/(\d{2})\n\W+(.+)\n +(.+)\n\W+/, function(all, year, month, day, time, level){
      console.log(all);
      if(time === '24:00'){
        return year + '-' + month + '-' + day + 'T' + time + '+09:00,' + level
      }
      return year + '-' + month + '-' + day + 'T' + time + '+09:00,' + level
    }).split(',');
    var wl = new WaterLevel({time: x[0].replace(/T24:/, "T00:"), level: x[1]})
    wl.save(function (err) {
      if(typeof err !== 'undefined' && err.code !== 11000) {
        console.log(wl + " : " + err);
      }
    });
  });
}).catch(function (err) {
  console.log(err);
}).finally(function () {
  console.log('Done');
});

setInterval(function() {
  client.fetch(BASE_URL + '/cgi-bin/DspWaterData.exe?KIND=9&ID=303051283310070').then(function (result) {
    return client.fetch(BASE_URL + result.$('IFRAME')[0].attribs.src);
  }).then(function(res) {
    var $ = res.$;
    var data = $($('tr')[0].children).text().replace(/\n\W+(\d{4})\/(\d{2})\/(\d{2})\n\W+(.+)\n +(.+)\n\W+/, '$1-$2-$3T$4+09:00,$5').split(',')
    new WaterLevel({time: data[0], level: data[1]}).save(function (err) {
      console.error(err);
    });
    console.log(data);
  }).catch(function (err) {
    console.log(err);
  }).finally(function () {
    console.log('Done');
  });
}, 600000);

var WaterLevelSchema = new mongoose.Schema({
  time : Date,
  level: {
    type: Number,
    default: 0
  }
});
var WaterLevel = mongoose.model('WaterLevel', WaterLevelSchema);