tester(fs);

function tester(fs){
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
    ctrl.url = 'http://www.w3schools.com/html/html_tables.asp';
    gogetem();
  }

  function gogetem(){
    casper.start(ctrl.url);
    casper.then(function() {
      ctrl.json = this.evaluate(function() {
        return $('table').tableToJSON();
      });
    });

    casper.run(function() {
      var that = this;
      fs.write('data.json', JSON.stringify(ctrl.json), 'w');
      this.exit();
    });
  }
}

