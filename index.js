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

var i = 1;
var file_h = fs.open('url.csv', 'r');

loadPage();

function loadPage() {
    var line = file_h.readLine();
    console.log(i);
    if (i > 10) {
        localStorage.clear();
        console.log(new Date().getTime() - startTime);
        phantom.exit();
    }

    if(line == '') {
        phantom.exit();
    }

    var url = line.split(',')[0];
    url = "http://" + url;
    console.log(url);

    var page = webpage.create();
    page.settings.clearMemoryCaches = true;
    page.clearMemoryCache();
    page.settings.loadImages = false;
    page.settings.resourceTimeout = 300000; // 5 min
    page.open(url, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
            return;
        }
    });

    page.onResourceRequested = function (requestData, networkRequest) {
        if (requestData.url.indexOf('autodesk') > 0) {
            networkRequest.abort();
        }

        for (var key in patterns) {
            if (patterns[key].test(requestData.url)) {
                requestTime[requestData.url]  = new Date().getTime();
                return;
            }
        }
    };

    page.onResourceReceived = function (response) {
        for (var key in patterns) {
            if (patterns[key].test(response.url)) {
                if (response.stage == "end") {
                    var tm = new Date().getTime() - requestTime[response.url];
                    fs.write('data.csv', url + "," + key + "," + response.url + "," + tm + "ms\n", 'a');
                    console.log('logging...' + i);
                    return;
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
