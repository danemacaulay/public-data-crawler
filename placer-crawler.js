var utils = require('utils');
var fs = require('fs');
var parcelData = fs.read('data.json');
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
        loadImages:  false,
        //   loadPlugins: false
      },
      logLevel: "debug",
      verbose: true
    });

    ctrl.url = 'http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx';
    ctrl.json = parcelData;
    processData();
  }

  function processData(){
    casper.start(ctrl.url);
    casper.then(function() {
      this.evaluate(function() {
        window.location = document.querySelector('iframe').src;
      });
    });
    ctrl.json.forEach(function(plot, index){
      if("Assessor ID Number" in plot){
        utils.dump('skipping already processed plot');
      }else if("id" in plot){
        processPlot(plot, index);
      }
    });
    casper.run(function() {
      var that = this;
      fs.write('data.json', JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }

  function processPlot(plot, index){
    casper.wait(1000);
    casper.then(function() {
      // this.capture('step1.png');
      utils.dump("Processing " + plot.id);
      utils.dump("Filling out form");
      this.evaluate(function(id) {
        document.querySelector('input[name="idfeeparcel"]').value = id;
        SubmitForm();
      }, plot.id);
    });
    casper.wait(1000);
    casper.then(function() {
      // this.capture('step2.png');
      utils.dump("Following results");
      this.evaluate(function() {
        window.location = document.querySelector('tr.data > td a').href;
      });
    });
    casper.wait(1000);
    casper.then(function() {
      // this.capture('step3.png');
      utils.dump("Evaluating results");
      var tableData = this.evaluate(function() {
        var data = {};
        var owners = [];
        var key, value;
        var found = false;
        var $this;

        $table = $('table tr');
        if($table.length > 0){
          $table.each(function(){
            $this = $(this);
            if($this.find('.title').text() == 'Ownership'){
              found = true;
            }else if($this.find('.title').text() == 'Building Description(s)'){
              found = false;
            }else if(found){
              owners.push($this.text().replace(/\s+/g, ' '));
            }else{
              key = $this.find('td').first().text();
              value = $this.find('td').filter('.c2').text();
              data[key] = value;
            }
          });
          data.Ownership = owners.join(', ');
        }
        return data;
      });
      utils.dump(tableData);
      ctrl.json[index] = merge(tableData, ctrl.json[index]);
    });
    casper.wait(1000);
    casper.then(function() {
      // this.capture('step4.png');
      fs.write('data.json', JSON.stringify(ctrl.json), 'w');
      this.evaluate(function() {
        window.location = document.querySelector('a').href;
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
