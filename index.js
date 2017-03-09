var fs = require('fs'),
    webpage = require('webpage'),
    system = require('system'),
    args = system.args,
    requests = {},
    requestTime = {},
    startTime = new Date().getTime(),
    patterns = {
        'GTM': /googletagmanager\.com/,
        'Ensighten': /ensighten\.com/,
        'Signal': /(s\.thebrighttag\.com)|(tags\.sitetagger\.co\.uk)/,
        'OpenTag': /\/opentag-(.*)\.js/,
        'DTM': /assets\.adobedtm\.com\/[0-9a-z]+\/satellitelib-/,
        'Tealium': /(tiqcdn\.com)|(tealium\.hs\.llnwd\.net)|(tealiumiq.com)/,
        'SuperTag': /(c\.supert\.ag)|(s\.supert\.ag)/
    };

var i = 0;
var file_h = fs.open('url.csv', 'r');

loadPage();

function loadPage() {
    var line = file_h.readLine();
    console.log(i);
    if (i > 10) {
        console.log(new Date().getTime() - startTime);
        setTimeout(function() {
          setTimeout(function() {
            phantom.exit();
          }, 1);
      }, 1000);

    }
    var url = line.split(',')[0];
    url = "http://" + url;
    console.log(url);

    var page = webpage.create();
    page.settings.clearMemoryCaches = true;
    page.settings.loadImages = false;
    page.clearMemoryCache();
    page.open(url, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
            return;
        }
    });

    page.onResourceRequested = function (requestData, networkRequest) {
        for (var key in patterns) {
            if (patterns[key].test(requestData.url)) {
                if (!requests[key]) {
                    requests[key] = [];
                    requestTime[key] = [];
                }
                requestTime[requestData.url]  = new Date().getTime();
            }
        }
        requests.push(requestData.url);
    };

    page.onResourceReceived = function (response) {
        for (var key in patterns) {
            if (patterns[key].test(response.url)) {
                if (!requests[key]) {
                    requests[key] = [];
                }

                if (response.stage == "end") {
                    var tm = new Date().getTime() - requestTime[response.url];
                    var reqD = {"url" : response.url, 'time' : tm + "ms"};
                    requests[key].push(reqD);
                    fs.write('data.csv', url + "," + key + "," + response.url + "," + tm + "ms\n", 'a');
                    console.log('kj=' + i);
                }
            }
        }
    }

    page.onLoadFinished = function (status) {
        setTimeout(function() {
          setTimeout(function() {
            page.close();
            i++;
            loadPage();
          }, 1);
      }, 1000);
    };
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};
