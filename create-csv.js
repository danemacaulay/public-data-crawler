var fileIn = process.argv[0];
var fileOut = process.argv[1];

var json2csv = require('json2csv');
var fs = require('fs');
var parcelData = fs.readFileSync(fileIn);
parcelData = JSON.parse(parcelData);
var fields = Object.keys(parcelData[0]);

json2csv({data: parcelData, fields: fields}, function(err, csv) {
  if (err) console.log(err);
  fs.writeFile(fileOut, csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
});
