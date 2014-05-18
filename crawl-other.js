var utils = require('utils');
var fs = require('fs');
var parcelData = fs.read('other-data.json');
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

    ctrl.url = 'http://assessor.slocounty.ca.gov/pisa/Search.aspx';
    ctrl.json = parcelData;
    processData();
  }

  function processData(){
    casper.start(ctrl.url);
    ctrl.json.forEach(function(plot, index){
      processPlot(plot, index);
    });
    casper.run(function() {
      fs.write('other-data.json', JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }

  function processPlot(plot, index){
    casper.wait(1000);
    casper.then(function() {
      this.evaluate(function(plot) {
        var parts = plot.id.split('-');
        $('form table:nth-of-type(4)').find('td:nth-of-type(2) input:nth-of-type(1)').val();
        $('form table:nth-of-type(4)').find('td:nth-of-type(2) input:nth-of-type(2)').val();
        $('form table:nth-of-type(4)').find('td:nth-of-type(2) input:nth-of-type(3)').val();
      }, plot);
    });
    casper.wait(1000);
    casper.then(function() {
      casper.page.injectJs('/bower_components/jquery/index.js');
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
