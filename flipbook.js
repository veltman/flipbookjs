//clipRect always true for now, until I can figure out height detection problem

//Set initial options
var wp = require('webpage'),
	system = require('system'),
	timestamp,
	options = {
		delay: 3000,		
		viewports: [],
		clipRect: false,
		filebase: "",
		url: null,
		interval: null,
		path: null
	};
	viewportQueue = [];

//Get argument values
parseArgs();

//Default viewports
if (!options.viewports.length) options.viewports.push([1024,768]);

//Need a URL
if (!options.url) {
	console.log("\nNo URL supplied.\n");	
	helpScreen(1);
} else if (!options.path) {	
	//Auto-generate a reasonable folder name
	options.path = autoPath(options.url);
}

//Go!
startCapture(options.interval);

//Start it once, or at the supplied interval
function startCapture(i) {

	if (i) {
		setInterval(function() {						
			viewportQueue = [];
			options.viewports.forEach(function(d){viewportQueue.push(d);});
			timestamp = currentTime();
			nextPage();
		},i);
	} else {
		viewportQueue = options.viewports;
		timestamp = currentTime();
		nextPage();		
	}
}

//Look for another page; if the queue is empty and it's on an interval, just wait; if it's empty and there's no interval, exit
function nextPage() {

	if (viewportQueue.length) {		
		
		var vp = viewportQueue.pop();				

		capturePage(parseInt(vp[0]),parseInt(vp[1]));

	} else if (!options.interval) {

		phantom.exit();

	}

}

//Get one page
function capturePage(w,h) {
	
	var page = wp.create();

	//Clip to viewport if specified
	if (options.clipRect) page.clipRect = { top: 0, left: 0, width: w, height: h };

	page.viewportSize = { width: w, height: h};

	//Open the page w/ success callback
	page.open(options.url, function (status) {
		
		//Execute custom JavaScript on the page before rendering here if desired

		//Try to save out the image, named according to dimensions and timestamp
		//Set a delay before rendering if specified, helps for AJAX
		window.setTimeout(function() {
   				

			if (status === 'success') {

					var f = options.path+"/"+options.filebase+(options.filebase.length ? "-" : "")+w+"x"+h+"-"+timestamp+".png";
					
					page.render(f);		
				
			}

			nextPage();

		},options.delay);				
	});

}

//Parse the arguments, throw a help screen if anything is funky
function parseArgs() {
	if (system.args.length < 3) {
		helpScreen(2);
	}

	for (var i = 1; i < system.args.length; i++) {
		
		var arg = system.args[i].toLowerCase();		

		var base = false, value = false;

		if (arg.match(/^-[ufvcdip]$/) && (arg[1].toLowerCase() == "c" || i < system.args.length-1)) {						
			base = arg[1];
			value = system.args[i+1];
		} else if (arg.match(/^-[ufvcdip][=]/) && arg.length >= 4) {
			base = arg[1];
			value = arg.substr(3);
		}

		switch (base) {
			case "u":
				if (value.match(/^-/)) {
					console.log("\nInvalid URL.\n")
					helpScreen(3);
					break;
				}
				options.url = value;
				break;
			case "f":
				if (value.match(/[\/\\*?%:|"<>]/)) {
					console.log("\nInvalid filename.\n")
					helpScreen(4);
					break;
				}
				options.filebase = value;				
				break;
			case "v":
				value = value.toLowerCase();
				if (value.match(/^[0-9]+x[0-9]+$/)) {
					options.viewports.push(value.split("x"));
					break;
				}
				console.log("\nInvalid viewport, must be [W]x[H].\n")
				helpScreen(5);
				break;			
			case "c":
				options.clipRect = true;
				break;
			case "d":
				if (value.match(/^[0-9]+$/)) {
					options.delay = parseInt(value);
					break;
				}
				console.log("\nInvalid delay, must be numeric.\n")
				helpScreen(6);
				break;
			case "p":				
				options.path = value.replace(/\/$/,'');
				if (!options.path.length) {
					helpScreen(7);
					break;
				}
				break;				
			case "i":
				if (!value.match(/^[0-9]+([.][0-9]+)?(h|m|s)?$/i)) {
					console.log("\nInvalid interval must be in one of these formats:");
					console.log("5000 [every 5000 milliseconds]");
					console.log("5s [every 5 seconds]");
					console.log("5m [every 5 minutes]");
					console.log("5h [every 5 hours]\n");
					helpScreen(8);
					break;
				}
				var v = getIntervalMS(value);
				if (v < 60000) {
					console.log("\nInterval must be at least 1 minute to prevent queue chaos.\n")
					helpScreen(9);
					break;
				}
				options.interval = v;
				break;
				
		}		

	}

}

//Help screen with options and examples
function helpScreen(index) {
	
	console.log("Error "+index+"\n");

    helpLines = [
	    'Usage: phantom.js flipbook.js [options]',
		'Available options:',
		' ',
		'-u [url]',
		'Url to capture. REQUIRED.',
		'Ex: phantomjs flipbook.js -u http://www.google.com',
		' ',
		'-f [filename]',
		'Image filename for output.',
		'Ex: phantomjs flipbook.js -u http://www.google.com -f google.png',
		' ',
		'-v [viewport]',
		'A viewport size to capture, in format "WxH".  Default is 1024x768',
		'Ex: phantomjs flipbook.js -u http://www.google.com -v 320x480 -v 640x480',
		' ',
		'-c',
		'Clip to page fold.  By default, the resulting image will show the entire height of the page. With clipping on, it will clip to the window height.',
		'Ex: phantomjs flipbook.js -u http://www.google.com -v 320x480 -c',
		' ',
		'-d [delay]',
		'Option delay between render and capture, in milliseconds.  Use this if the page has AJAX content you need to wait for.  Default is 3000 (3 seconds).',
		'Ex: phantomjs flipbook.js -u http://www.google.com -d 8000',
		' ',
		'-p [path]',
		'Path to save images to.  If not specified, it will create a new folder in the current folder with a name based on the URL.',		
		'Ex: phantomjs flipbook.js -u http://www.google.com -i folder_name',
		'Ex: phantomjs flipbook.js -u http://www.google.com -p /path/to/save/to',
		' ',		
		'-i [interval]',
		'Run this at an interval.  If it\'s a number it will treat it as milliseconds, but the format 5s, 5m, 5h also works (for every 5 seconds, every 5 minutes, every 5 hours, respectively).  Not recommended, better to use a cronjob.  Minimum value of 1 minute.',
		'Ex: phantomjs flipbook.js -u http://www.google.com -i 5000',
		' '
	];

	console.log(helpLines.join("\n"));
	phantom.exit();	
}

//Turn text interval into milliseconds
function getIntervalMS(val) {
	
	var factor = 1;

	if (val.match(/(h|m|s)$/i)) {
		var f = val.substr(val.length-1,1);

		if (f == "h") {
			factor = 3600000;
		} else if (f == "m") {
			factor = 60000;
		} else {
			factor = 1000;
		}

		val = val.substr(0,val.length-1);
	}

	return Math.round(parseFloat(val)*factor);

}

//Get a filename-friendly timestamp
function currentTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "-" + hour + "-" + min;

}

//Generate a reasonable folder name based on a URL
function autoPath(url) {	
	return url.replace(/.+[:]\/\/(www[.]?)?/,'').replace(/[\/.]/g,'_').replace(/[^A-Za-z0-9_-]/g,'').replace(/^_/,'').replace(/_$/,'');
}