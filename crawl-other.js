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
        loadImages:  true,
        //   loadPlugins: false
      },
      logLevel: "debug",
      verbose: true
    });

    ctrl.url = 'http://assessor.slocounty.ca.gov/pisa/Search.aspx';
    ctrl.json = parcelData;
    ctrl.file = 'other-data.json';
    processData();
  }

  function processData(){
    casper.start(ctrl.url);
    casper.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');
    ctrl.json.forEach(function(plot, index){
      if(plot.id.indexOf('-') === -1){
        plot.id = [plot.id.slice(0, 3), '-', plot.id.slice(3)].join('');
        plot.id = [plot.id.slice(0, 7), '-', plot.id.slice(7)].join('');
      }
      processPlot(plot, index);
    });
    casper.run(function() {
      fs.write(ctrl.file, JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }

  function processPlot(plot, index){
    casper.wait(1000);
    casper.thenEvaluate(function(id) {
      var parts = id.split('-');
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(1)').attr('value', parts[0]);
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(2)').attr('value', parts[1]);
      $('form table:nth-of-type(4) td:nth-of-type(2) input:nth-of-type(3)').attr('value', parts[2]);
      document.getElementById('Main_btnAPNSearch').click();
    }, plot.id);


    casper.wait(1000);
    casper.thenEvaluate(function() {
      // document.querySelectorAll('a')[13].click();
      // $('#Main_gvSearchResults tr:nth-of-type(2) td a').click();
      window.location = $('#Main_gvSearchResults tr:nth-of-type(2) td a').attr('href');
    });
    casper.then(function() {
      this.capture('other-step1.png');
      require('utils').dump(this.getElementInfo('#Main_gvSearchResults tr:nth-of-type(2) td a'));
    });

    casper.wait(1000);
    casper.then(function() {
      var tableData = this.evaluate(function() {
        var data = {};
        $('#Main_tblPropertyInfo1 tr').each(function(){
          var $this = $(this);
          key = $this.find('.prompt').text().replace(/\s+/g, ' ');
          value = $this.find('.response').text().replace(/\s+/g, ' ');
          data[key] = value;
        });

        $('#Main_tblPropertyInfo2 tr').each(function(){
          var $this = $(this);
          key = $this.find('.prompt').text().replace(/\s+/g, ' ');
          value = $this.find('.response').text().replace(/\s+/g, ' ');
          data[key] = value;
        });

        return data;
      });
      utils.dump(tableData);
      ctrl.json[index] = merge(tableData, ctrl.json[index]);
      this.capture('other-step2.png');
    });

    casper.wait(1000);
    casper.then(function() {
      this.capture('other-step3.png');
      fs.write(ctrl.file, JSON.stringify(ctrl.json), 'w');
      this.click('#Main_lnkBackToSearch');
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
