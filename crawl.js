var utils = require('utils');
var fs = require('fs');
var utils = require('utils');
var parcelData = fs.read('parcels.json');
parcelData = JSON.parse(parcelData);

main(utils, parcelData, fs);

function main(utils, parcelData, fs){
  var ctrl = this;
  var casper;
  init();

  function init(){
    casper = require('casper').create({
      clientScripts:  [
        'bower_components/jquery/index.js',
        'bower_components/table-to-json/src/jquery.tabletojson.js',
      ],
      pageSettings: {
        loadImages:  false,
        //   loadPlugins: false
      },
      logLevel: "debug",
      verbose: true
    });

    ctrl.url = 'http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx';
    ctrl.json = [];
    // ctrl.plots = parcelData;
    ctrl.plots = ["093380008000","038330018000","112290015000","043015041000","468010047000","054200007000","111100026000","458030006000","043015042000","054031075000","093380012000"];
    processData();
  }

  function processData(){
    casper.start(ctrl.url);
    ctrl.plots.forEach(function(plot){
      processPlot(plot);
    });
    casper.run(function() {
      var that = this;
      fs.write('data.json', JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }

  function processPlot(plot){
    casper.then(function() {
      this.evaluate(function() {
        window.location = document.querySelector('iframe').src;
      });
    });
    casper.then(function() {
      this.evaluate(function(plot) {
        document.querySelector('input[name="idfeeparcel"]').value = plot;
        SubmitForm();
      }, plot);
    });
    casper.then(function() {
      this.evaluate(function() {
        window.location = document.querySelector('tr.data > td a').href;
      });
    });
    casper.then(function() {
      var tableData = this.evaluate(function() {
        var data = {};
        var owners = [];
        var key, value;
        var found = false;
        $('table tr').each(function(){
          if($(this).find('.title').text() == 'Ownership'){
            found = true;
          }else if($(this).find('.title').text() == 'Building Description(s)'){
            found = false;
          }else if(found){
            owners.push($(this).text().replace(/\s+/g, ' '));
          }else{
            key = $(this).find('td').first().text();
            value = $(this).find('td').filter('.c2').text();
            data[key] = value;
          }
        });
        data["Ownership"] = owners.join(', ');
        return data;
      });
      utils.dump(tableData);
      ctrl.json.push(tableData);
    });
    casper.wait(1000);
    casper.then(function() {
      this.evaluate(function() {
        window.location = 'http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx';
      });
    });
  }
}
