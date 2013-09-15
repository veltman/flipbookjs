var wp = require('webpage'),
	system = require('system'),
	timestamp = currentTime(),
	options = {
		delay: 3000,
		viewports: [],
		clipRect: false,
		filebase: "",
		url: null
	};	

parseArgs();
if (!options.viewports.length) options.viewports.push([1024,768]);


if (!options.url) {
	console.log("No URL supplied.");
	helpScreen();
}

nextPage();

function nextPage() {

	if (!options.viewports.length) {

		phantom.exit();

	} else {

		var vp = options.viewports.pop();
		capturePage(parseInt(vp[0]),parseInt(vp[1]));

	}
}

function capturePage(w,h) {
	
	var page = wp.create();

	if (options.clipRect) page.clipRect = { top: 0, left: 0, width: w, height: h };

	page.viewportSize = { width: w, height: h};

	page.open(options.url, function (status) {	
		window.setTimeout(function() {
			if (status === 'success') {


					var f = options.filebase+(options.filebase.length ? "-" : "")+w+"x"+h+"-"+timestamp+".png";

					page.render(f);		

				
			}

			nextPage();

		},options.delay);				
	});

}

function parseArgs() {
	if (system.args.length < 3) {
		helpScreen();
	}

	for (var i = 1; i < system.args.length; i++) {
		
		var arg = system.args[i].toLowerCase();		

		var base = false, value = false;

		if (arg.match(/^-[ufvcd]$/) && (arg[1].toLowerCase() == "c" || i < system.args.length-1)) {						
			base = arg[1];
			value = system.args[i+1];
		} else if (arg.match(/^-[ufvcd][=]/) && arg.length >= 4) {
			base = arg[1];
			value = arg.substr(3);
		}

		switch (base) {
			case "u":
				if (value.match(/^-/)) {
					console.log("Invalid URL.")
					helpScreen();
				}
				options.url = value;
				break;
			case "f":
				if (value.match(/[\/\\*?%:|"<>]/)) {
					console.log("Invalid filename.")
					helpScreen();
				}
				options.filebase = value;				
				break;
			case "v":
				value = value.toLowerCase();
				if (value.match(/^[0-9]+x[0-9]+$/)) {
					options.viewports.push(value.split("x"));
					break;
				}
				console.log("Invalid viewport, must be [W]x[H].")
				helpScreen();			
			case "c":
				options.clipRect = true;
				break;
			case "d":
				if (value.match(/^[0-9]+$/)) {
					options.delay = parseInt(value);
					break;
				}
				console.log("Invalid delay, must be numeric.")
				helpScreen();				
				
		}		

	}

}

function helpScreen() {
    helpLines = [
	    'Usage: phantom.js capture.js [options]',
		'Available options:',
		' ',
		'-u [url]',
		'Url to capture. REQUIRED.',
		'Ex: phantomjs capture.js -u http://www.google.com',
		' ',
		'-f [filename]',
		'Image filename for output.',
		'Ex: phantomjs capture.js -u http://www.google.com -f google.png',
		' ',
		'-v [viewport]',
		'A viewport size to capture, in format "WxH".  Default is 1024x768',
		'Ex: phantomjs capture.js -u http://www.google.com -v 320x480 -v 640x480',
		' ',
		'-c',
		'Clip to page fold.  By default, the resulting image will show the entire height of the page. With clipping on, it will clip to the window height.',
		'Ex: phantomjs capture.js -u http://www.google.com -v 320x480 -c',
		' ',
		'-d [delay]',
		'Option delay between render and capture, in milliseconds.  Use this if the page has AJAX content you need to wait for.  Default is 3000 (3 seconds).',
		'Ex: phantomjs capture.js -u http://www.google.com -d 8000'
	];

	console.log(helpLines.join("\n"));
	phantom.exit();	
}

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