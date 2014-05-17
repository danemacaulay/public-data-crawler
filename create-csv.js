var json2csv = require('json2csv');
var fs = require('fs');
var parcelData = fs.readFileSync('data.json');
parcelData = JSON.parse(parcelData);
var fields = Object.keys(parcelData[0]);

json2csv({data: parcelData, fields: fields}, function(err, csv) {
  if (err) console.log(err);
  fs.writeFile('parsels.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
});
