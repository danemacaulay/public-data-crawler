var utils = require('utils');
var fs = require('fs');
var parcelData = fs.read('san-luis-obispo-data.json');
parcelData = JSON.parse(parcelData);

utils.dump("Processing " + parcelData.length + " parcels");

main(utils, parcelData, fs);

function main(utils, parcelData, fs){
  var ctrl = this;
  var casper;
  init();

  function init(){
    casper = require('casper').create({
      clientScripts:  [
        'bower_components/jquery/index.js',
      ],
      pageSettings: {
        loadImages:  true,
        //   loadPlugins: false
      },
      logLevel: "debug",
      verbose: true
    });
    casper.onLoadError = function(){
      casper.die("Fail.", 1);
    };
    ctrl.url = 'http://assessor.slocounty.ca.gov/pisa/Search.aspx';
    ctrl.json = parcelData;
    ctrl.file = 'san-luis-obispo-data.json';
    processData();
  }

  function processData(){
    var skippedPlots = 0;
    casper.start(ctrl.url);
    casper.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');
    ctrl.json.forEach(function(plot, index){
      if("Assessment Number:" in plot){
        skippedPlots++;
      }else if("id" in plot){
        if(plot.id.indexOf('-') === -1){
          plot.id = [plot.id.slice(0, 3), '-', plot.id.slice(3)].join('');
          plot.id = [plot.id.slice(0, 7), '-', plot.id.slice(7)].join('');
        }
        processPlot(plot, index);
      }
    });
    utils.dump("Skipping " + skippedPlots + " already processed plots");
    casper.run(function() {
      fs.write(ctrl.file, JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }

  function processPlot(plot, index){
    casper.wait(1000);

    casper.then(function() {
      utils.dump('Filling out form');
      // this.capture('step1.png');
    });

    casper.thenEvaluate(function(id) {
      var parts = id.split('-');
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(1)').attr('value', parts[0]);
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(2)').attr('value', parts[1]);
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(3)').attr('value', parts[2]);
      document.getElementById('Main_btnAPNSearch').click();
    }, plot.id);

    casper.then(function() {
      utils.dump('Following results');
      // this.capture('step2.png');
    });

    casper.wait(1000);
    casper.then(function(){
      var results = this.evaluate(function() {
        return $('#Main_gvSearchResults tr:nth-of-type(2) td a').length;
      });
      if(results === 0){
        ctrl.json[index] = merge({"id": plot.id, "Assessment Number:": "Plot Not found"}, ctrl.json[index]);
        this.bypass(2);
      }else{
        this.evaluate(function(){
          window.location = $('#Main_gvSearchResults tr:nth-of-type(2) td a').attr('href');
        });
      }
    });

    casper.then(function() {
      utils.dump('Gathering data');
      // this.capture('step3.png');
    });

    casper.wait(1000);
    casper.then(function() {
      var tableData = this.evaluate(function() {
        var data = {};
        $('#Main_tblPropertyInfo1 tr').each(function(){
          var $this = $(this);
          key = $this.find('.prompt').text().replace(/\s+/g, ' ').trim();
          value = $this.find('.response').text().replace(/\s+/g, ' ').trim();
          data[key] = value;
        });

        $('#Main_tblPropertyInfo2 tr').each(function(){
          var $this = $(this);
          key = $this.find('.prompt').text().replace(/\s+/g, ' ').trim();
          value = $this.find('.response').text().replace(/\s+/g, ' ').trim();
          data[key] = value;
        });

        return data;
      });
      utils.dump(tableData);
      ctrl.json[index] = merge(tableData, ctrl.json[index]);
    });

    casper.then(function() {
      utils.dump('Saving Data. Returning to search');
      // this.capture('step4.png');
    });

    casper.wait(1000);
    casper.then(function() {
      fs.write(ctrl.file, JSON.stringify(ctrl.json), 'w');
      this.evaluate(function() {
        window.location = "http://assessor.slocounty.ca.gov/pisa/Search.aspx";
      });
    });
  }
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
 function merge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname2 in obj2) { obj3[attrname2] = obj2[attrname2]; }
    return obj3;
}
