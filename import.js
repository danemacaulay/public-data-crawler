var json2csv = require('json2csv');
var fs = require('fs');

var parcelData = fs.readFileSync('placer-data.json');
parcelData = JSON.parse(parcelData);
console.log(parcelData[0]);

// var newData = [];

// parcelSource.forEach(function(value, key){
//   newData.push(merge_options(value, parcelData[key]));
// });

// fs.writeFile('dataNew.json', JSON.stringify(newData), function(err) {
//   if (err) throw err;
//   console.log('file saved');
// });

// *
//  * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
//  * @param obj1
//  * @param obj2
//  * @returns obj3 a new object based on obj1 and obj2

// function merge_options(obj1,obj2){
//     var obj3 = {};
//     for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
//     for (var attrname2 in obj2) { obj3[attrname2] = obj2[attrname2]; }
//     return obj3;
// }
