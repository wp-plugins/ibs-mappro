=== IBS Mappro ===
Contributors: hmoore71
Donate link:https://indianbendsolutions.net/donate/
Plugin URI: https://indianbendsolutions.net/documentation/ibs-mappro-documentation/
Author URI: https://indianbendsolutions.net/
Tags: google maps, map editor, map viewer
Requires at least: 4.0
Tested up to: 4.2
Stable tag: 0.6
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Comprehensive map editor and viewers for the traveling journalist

== Description ==
* IBS Mappro is a comprehensive map creator, editor, and view generator based on the Google Maps API v3 and supports kml, kmz, and gpx map files. 
* Shortcodes Wordpress shortcodes generate map viewers for posts and pages on your website. 
* Included in the admin facilities is a shortcode generator to help produce the right map viewer for your posts.
* Perhaps unique to this plugin is the ability to add marker icon libraries and customize the marker icon palette. 
* The ability to map your icon images to GPX symbol names.
* Place marker may include in their description links and images along with the text written using the CKEditor.
* Routes may be created using the Google Direction service which yields cue sheets that are stored with the map data.
* CKEditor has the facility to print the cue sheets.
* Elevation profiles may be displayed for route segments and their profile tracked on the map route.
* Can switch travel direction for a single or all route segments.
* Import and merge any number of maps files into the map editor.
* Save maps to the desktop (download) or the server map folder.
* Edit map routes down to discrete path points with the line editing feature.
* Output GPX files with routes, tracks or both.
* Combine or split route segments.
* A route segments can combine different modes of travel.
* See more at https://indianbendsolutions.net/documentation/ibs-mappro-documentation/

Presently IBS Mappro is in its Beta phase of development and all testing and reporting of issues is appreciated.

== Installation ==
1. Download ibs-mappro-0.1.zip and unzip.
2. Upload `ibs-mappro` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the ‘Plugins’ menu in WordPress
4 Admin | Settings menu | IBS Mappro and configure the plugin.

== Frequently Asked Questions ==
1. How do I draw a map? Staring at the blank map editor there is no clue where to begin creating a map. On the left side of the map editor there is a "list area" and there is a link that says "Route." Click that link and move your mouse over the map and the cursor changes to a cross hair and a small meesage box that say "Start route" appears. Click on the map where the route is to begin. The message box now says "extend route." Click the next point for your route and continue until your route is completed.
Dismiss the "extend route" by a right mouse click or click the reset button.
2. I have a map how do I show it on my post? If your map has a url (http or https) address head right on over to the Shortcode tab and add your map address in the url="" of the shortcode. 
Most likely however you will have a map file on your desktop which will need to be uploaded to the server. Open Map tools and select "Desktop upload." After the upload go to the Shortcode tab and select the file you just uploaded. It will be inserted into the shortcode.
In either press CTRL-A and then CTRL-C to copy the shortcode to the clipboard. Now paste this shortcode into your post or page.
3. How do I save my maps and icons before an upgrade? Maps can be downloaded to your desktop and reloaded after the upgrade. Icon can be be reuploaded after the upgrade.
Another approach is to use FTP to save and restore the folders.


== Screenshots ==
1. general settings
2. manage the icon palette.
3. manage the Garmin symbol images.
4. generate shortcode for posts and pages.
5. map editor for creating and maintaining maps.
6. map viewer showing shortcode used

== Changelog ==

(initial release)
11/19/2014 fixed shortcode missing right bracket.
11/19/2014 fixed missing file extension on save to server.
11/19/2014 added align(left,center,right) option to shortcode.
11/21/2014 move data files out of plugin folder.
11/21/2004 use wp_filesystem.
12/20/2014 4.1 fixes to jquery ui dialog position changes
12/29/2014 version 0.4 fixes download issues. 
02/03/2015 version 0.5 fixes download issues
05/24/2015 version 0.6 fixes several minor issues and adds multi file browse select.
== Upgrade Notice ==




