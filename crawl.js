var json2csv = require('json2csv');
var utils = require('utils');
main(json2csv);

function main(json2csv, utils){
  var ctrl = this;
  var casper;
  ctrl.json2csv = json2csv;
  init();

  function init(){
    casper = require('casper').create({
      clientScripts:  [
      'bower_components/jquery/src/jquery.js',
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
    ctrl.plots = [
      '093380008000',
    ];
    processData();
  }

  function processData(){
    casper.start(ctrl.url);
    ctrl.plots.forEach(function(plot){
      processPlot(plot);
    });
    casper.run(function() {
      // var that = this;
      // ctrl.json2csv(ctrl.json, function(err, csv) {
      //   fs.writeFile('file.csv', csv, function(err) {
      //     that.echo('file saved');
      //   });
      // });
      this.echo('length.... ' + ctrl.json.length);
      this.echo('string.... ' + JSON.stringify(ctrl.json));
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
      this.debugPage();
      var tableData = this.evaluate(function() {
        utils.dump($('table'));
        return $('table').tableToJSON();
      });
      ctrl.json = ctrl.json.concat(tableData);
    });
    casper.then(function() {
      this.evaluate(function() {
        window.location = 'http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx';
      });
    });
  }
}
