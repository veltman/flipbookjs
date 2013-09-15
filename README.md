Flipbook.js
==========

For automatically flip-booking progress while developing something for the web.

This uses PhantomJS to automatically screencap a provided URL from the command line with the option of multiple breakpoints, and saves screenshots out with timestamps and dimensions in the filename.

Requires installation of [PhantomJS](http://phantomjs.org/) first.

To get started, run:

	phantomjs flipbook-capture.js

This will give you a list of the extra command line options.  The only required argument is a URL to capture, like:

	phantomjs flipbook-capture.js -u http://www.google.com

Flipbooking
-----------

You can run it at an interval with the `-i` option, but a cronjob is a better idea so the process isn't just running continuously.  e.g.:

	crontab -e
		
		Add this line: */5 * * * * phantomjs /path/to/capture.js -u http://localhost/site-i-am-working-on/

Now you'll start generating screenshots every 5 minutes, which can be used as slides, frames of a movie, or an animated GIF.  Because everyone loves GIFs.

There's no built-in option to stitch this stuff together, because it turns out making animated GIFs in JavaScript without a bunch of dependencies is a pain in the ass, so you're probably better off using your method of choice, or a service like: http://mothereffinganimatedgif.com/

Options
-------

**-u [url]**  
Url to capture. REQUIRED.  
Ex: `phantomjs capture.js -u http://www.google.com`  
 
**-f [filename]**  
Image filename for output.  
Ex: `phantomjs capture.js -u http://www.google.com -f google.png`  
 
**-v [viewport]**  
A viewport size to capture, in format "WxH".  Default is 1024x768  
Ex: `phantomjs capture.js -u http://www.google.com -v 320x480 -v 640x480`  
 
**-c**  
Clip to page fold.  By default, the resulting image will show the entire height of the page. With clipping on, it will clip to the window height.  
Ex: `phantomjs capture.js -u http://www.google.com -v 320x480 -c`  
 
**-d [delay]**  
Option delay between render and capture, in milliseconds.  Use this if the page has AJAX content you need to wait for.  Default is 3000 (3 seconds).  
Ex: `phantomjs capture.js -u http://www.google.com -d 8000`  

**-p [path]**  
Path to save images to.  If not specified, it will create a new folder in the current folder with a name based on the URL.  
Ex: `phantomjs capture.js -u http://www.google.com -i folder_name`  
Ex: `phantomjs capture.js -u http://www.google.com -p /path/to/save/to`  
		
**-i [interval]**  
Run this at an interval.  If it\'s a number it will treat it as milliseconds, but the format 5s, 5m, 5h also works (for every 5 seconds, every 5 minutes, every 5 hours, respectively).  Not recommended, better to use a cronjob.  Minimum value of 1 minute.  
Ex: `phantomjs capture.js -u http://www.google.com -i 5000`  

To Do
-----
* Write a stitching script to scan a folder for screencraps and GIF them.
* Fix the queuing issue for the `-i` option.  Currently it just lazily forces a reasonable minimum delay of 1 minute, because PhantomJS will only run one capture at a time, and the threading/queuing gets a little sticky.  This is a lazy kludge but should work for most cases.