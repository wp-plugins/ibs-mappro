function GPX() {
    this.init();
}
(function($) {
    GPX.prototype.init = function() {
        var gpxColors = [
            {x: 0, y: 0, z: 0, label: 'Black'},
            {x: 140, y: 0, z: 26, label: 'DarkRed'},
            {x: 37, y: 65, z: 23, label: 'DarkGreen'},
            {x: 255, y: 243, z: 128, label: 'DarkYellow'}, //#FFf380 aka Corn Yellow
            {x: 21, y: 27, z: 84, label: 'DarkBlue'},
            {x: 227, y: 49, z: 157, label: 'DarkMagenta'},
            {x: 207, y: 236, z: 236, label: 'DarkCyan'},
            {x: 188, y: 198, z: 204, label: 'LightGray'},
            {x: 80, y: 74, z: 75, label: 'DarkGray'},
            {x: 255, y: 0, z: 0, label: 'Red'},
            {x: 0, y: 128, z: 0, label: 'Green'},
            {x: 255, y: 255, z: 0, label: 'Yellow'},
            {x: 0, y: 0, z: 255, label: 'Blue'},
            {x: 255, y: 0, z: 255, label: 'Magenta'},
            {x: 0, y: 255, z: 255, label: 'Cyan'},
            {x: 255, y: 255, z: 255, label: 'White'}
        ];
        function gpx_rgb2hex(color) {
            var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgb) {
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            } else {
                return color;
            }
        }
        gpxColor = function(color) {
            function fdist(a, b) {
                var x = Math.abs(a.x - b.x);
                var y = Math.abs(a.y - b.y);
                var z = Math.abs(a.z - b.z);
                return Math.sqrt(x * x + y * y + z * z);
            }
            color = gpx_rgb2hex($('<div>').css('color', color).css('color'));
            color = color.replace("#", "");
            var value = parseInt(color, 16);
            var b = Math.floor(value % 256);
            var g = Math.floor((value / 256) % 256);
            var r = Math.floor((value / (256 * 256)) % 256);
            var point = {'x': r, 'y': g, 'z': b};
            var min = Infinity;
            var colorIndex = -1;
            var dist = 0;
            for (var i = 0; i < gpxColors.length; ++i)
            {
                dist = fdist(gpxColors[i], point);
                if (dist < min)
                {
                    min = dist;
                    colorIndex = i;
                }
            }
            if (colorIndex < 0 || colorIndex > gpxColors.length - 1) {
                colorIndex = 0;
            }
            var p = gpxColors[colorIndex];
            var val = p.x * (256 * 256) + p.y * 256 + p.z;
            var hexstr = '#' + padLeftStr(val.toString(16), 6, '0');
            return {
                name: gpxColors[colorIndex].label,
                value: hexstr
            };
        };
        
    };
    GPX.prototype.writer = function(file) {
        var placemark_list = file.listPlacemarks();
        var segment_list = file.listSegments();
        var bounds = new google.maps.LatLngBounds();
        file.getBounds(bounds);
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var time = new Date().toISOString();
        var xml = new XMLWriter('UTF-8', '1.0');
        xml.writeStartDocument();
        xml.writeStartElement('gpx');
        xml.writeAttributeString('xmlns', 'http://www.topografix.com/GPX/1/1');
        xml.writeAttributeString('creator', 'Indian Bend Solutions LLC');
        xml.writeAttributeString('version', "1.0");
        xml.writeAttributeString('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance");
        xml.writeAttributeString('xsi:schemaLocation', "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd");
        xml.writeStartElement('metadata');
        xml.writeStartElement('link');
        xml.writeAttributeString('href', 'http://www.garmin.com');
        xml.writeElementString('text', 'Garmin International');
        xml.writeEndElement(); //link
        xml.writeElementString('time', time);
        xml.writeStartElement('bounds');
        xml.writeAttributeString('maxlat', sw.lat().toString());
        xml.writeAttributeString('maxlon', sw.lng().toString());
        xml.writeAttributeString('minlat', ne.lat().toString());
        xml.writeAttributeString('minlon', ne.lng().toString());
        xml.writeEndElement(); //bounds
        xml.writeEndElement(); //metadata
        if (file.options.gpx_waypoints) {
            /* waypoints */
            for (var i = 0; i < placemark_list.length; i++) {
                var pm = file.placemarks[placemark_list[i]];
                if (pm.options.symbol === 'Waypoint') {
                    xml.writeStartElement('wpt');
                    xml.writeAttributeString('lat', pm.options.position.lat().toString());
                    xml.writeAttributeString('lon', pm.options.position.lng().toString());
                    xml.writeElementString('time', time);
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement(); //name
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //cmt
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //desc
                    xml.writeElementString('sym', pm.options.symbol);
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:WaypointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:DisplayMode', 'SymbolAndName');
                    xml.writeEndElement(); //WaypointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //wpt
                }
            }
        }
        if (file.options.gpx_placemarks) {
            /* placemarks */
            for (var i = 0; i < placemark_list.length; i++) {
                var pm = file.placemarks[placemark_list[i]];
                if (pm.options.symbol !== 'Waypoint') {
                    xml.writeStartElement('wpt');
                    xml.writeAttributeString('lat', pm.options.position.lat().toString());
                    xml.writeAttributeString('lon', pm.options.position.lng().toString());
                    xml.writeElementString('time', time);
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement(); //name
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //cmt
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //desc
                    xml.writeElementString('sym', pm.options.symbol);
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:WaypointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:DisplayMode', 'SymbolAndName');
                    xml.writeEndElement(); //WaypointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //wpt
                }
            }
        }
        /* segments do routes*/
        if (file.options.gpx_routes) {
            for (i = 0; i < segment_list.length; i++) {
                var sg = file.segments[segment_list[i]];
                xml.writeStartElement('rte');
                xml.writeStartElement('name');
                xml.writeCDATA(sg.options.name);
                xml.writeEndElement(); //name
                xml.writeStartElement('desc');
                xml.writeCDATA(sg.options.desc);
                xml.writeEndElement(); //desc
                xml.writeStartElement('extensions');
                xml.writeStartElement('gpxx:RouteExtension');
                xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                xml.writeElementString('gpxx:IsAutoNamed', 'false');
                xml.writeElementString('gpxx:DisplayColor', gpxColor(sg.options.strokeColor).name);
                xml.writeEndElement(); //extensions
                xml.writeEndElement(); //gpxx:RouteExtension
                var points = sg.line.getPath().getArray();
                var waypoints = sg.findWaypoints();
                if ((waypoints.length === 0 || waypoints[0].index !== 0) && points.length > 0) {
                    sg.waypoint(0);
                    waypoints = sg.findWaypoints();
                }
                for (var j = 0; j < waypoints.length; j++) {
                    var pm = file.placemarks[waypoints[j].pid];
                    xml.writeStartElement('rtept');
                    xml.writeAttributeString('lat', waypoints[j].latlng.lat().toString());
                    xml.writeAttributeString('lon', waypoints[j].latlng.lng().toString());
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement();
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement();
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement();
                    xml.writeElementString('sym', 'Waypoint');
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:RoutePointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:Subclass', '000000000000FFFFFFFFFFFFFFFFFFFFFFFF');
                    var hh = j < waypoints.length - 1 ? waypoints[j + 1].index : points.length - 1;
                    for (var gg = waypoints[j].index + 1; gg < hh; gg++) {
                        xml.writeStartElement('gpxx:rpt');
                        xml.writeAttributeString('lat', points[gg].lat().toString());
                        xml.writeAttributeString('lon', points[gg].lng().toString());
                        xml.writeEndElement();
                    }
                    xml.writeEndElement(); //RoutePointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //rtept
                }
                xml.writeEndElement(); //rte 
            }
        }
        /* segments do tracks */
        if (file.options.gpx_waypoints) {
            xml.writeStartElement('trk');
            for (var sid in file.segments) {
                var sg = file.segments[sid];
                xml.writeStartElement('trkseg');
                xml.writeStartElement('extensions');
                xml.writeStartElement('gpxx:TrackExtension');
                xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                xml.writeElementString('gpxx:DisplayColor', gpxColor(sg.options.strokeColor).name);
                xml.writeEndElement(); //extensions
                xml.writeEndElement(); //gpxx:TrackExtension
                xml.writeStartElement('name');
                xml.writeCDATA(sg.options.name);
                xml.writeEndElement(); //name
                xml.writeStartElement('desc');
                xml.writeCDATA(sg.options.desc);
                xml.writeEndElement(); //desc
                sg.line.getPath().forEach(function(latlng) {
                    xml.writeStartElement('trkpt');
                    xml.writeAttributeString('lat', latlng.lat().toString());
                    xml.writeAttributeString('lon', latlng.lng().toString());
                    //xml.writeElementString('ele', '0.0');
                    xml.writeEndElement(); //trkpt
                });
                xml.writeEndElement()//trkseg
            };
            xml.writeEndElement(); //trk
        }
        xml.writeEndElement(); //gpx
        xml.writeEndDocument();
        return xml.flush();
    };
    GPX.prototype.reader = function(xml, file) {
        $(xml).children('gpx').each($.proxy(function(n, gpx) {
            file.options.desc = $(gpx).attr('creator');
            $(gpx).children('wpt').each($.proxy(function(n, wpt) {
                var marker_options = {
                    url: '',
                    symbol: null,
                    name: null,
                    desc: null,
                    position: null,
                    daraggable: false,
                    visible: false
                };
                marker_options.name = getCDATA($(wpt).find('name').text());
                marker_options.cmt = getCDATA($(wpt).find('cmt').text());
                marker_options.desc = getCDATA($(wpt).find('desc').text());
                marker_options.symbol = $(wpt).find('sym').text();
                marker_options.position = new google.maps.LatLng(parseFloat($(wpt).attr('lat')), parseFloat($(wpt).attr('lon')));
                file._addPlacemark(marker_options);
            }, this));
            $(gpx).children('rte').each(function(n, rte) {
                var segment_options = {
                    path: [],
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.7,
                    strokeWeight: 5,
                    name: '',
                    desc: ''
                };
                segment_options.name = getCDATA($(rte).find('name:first').text());
                segment_options.cmt = getCDATA($(rte).find('cmt:first').text());
                segment_options.desc = getCDATA($(rte).find('desc:first').text());
                $(rte).children('extensions').each(function(n, extension) {
                    $(extension).children().each(function(n, x) {
                        if (x.nodeName === 'gpxx:RouteExtension') {
                            $(x).children().each(function(n, xx) {
                                if (xx.nodeName === 'gpxx:DisplayColor') {
                                    segment_options.strokeColor = $(xx).text();
                                }
                            });
                        }
                    });
                });
                $(rte).children('rtept').each(function(n, rtept) {
                    var latlng = new google.maps.LatLng(parseFloat($(rtept).attr('lat')), parseFloat($(rtept).attr('lon')));
                    segment_options.path.push(latlng);
                    $(rtept).children('extensions').each(function(n, extension) {
                        $(extension).children().each(function(n, routeptextension) {
                            if (routeptextension.nodeName === 'gpxx:RoutePointExtension') {
                                $(routeptextension).children().each(function(n, rpt) {
                                    if (rpt.nodeName === 'gpxx:rpt') {
                                        segment_options.path.push(new google.maps.LatLng(parseFloat($(rpt).attr('lat')), parseFloat($(rpt).attr('lon'))));
                                    }
                                });
                            }
                        });
                    });
                });
                if (segment_options.path.length > 1) {
                    file._addSegment(segment_options);
                }
            });
            $(gpx).children('trk').each(function(n, trk) {
                $(trk).children('trkseg').each(function(n, trkseg) {
                    var track_options = {
                        path: [],
                        strokeColor: '#0000ff',
                        strokeOpacity: 0.7,
                        strokeWeight: 5,
                        name: 'track' + n,
                        desc: ''
                    };
                    var a = $(trkseg).find('name:first').text();
                    track_options.name = typeof (a) === 'undefined' || a === '' ? 'track-' + (n + 1) : a;
                    track_options.cmt = getCDATA($(trkseg).find('cmt:first').text());
                    track_options.desc = getCDATA($(trkseg).find('desc:first').text());
                    $(trkseg).children('extensions').each(function(n, extension) {
                        $(extension).children().each(function(n, x) {
                            if (x.nodeName === 'gpxx:TrackExtension') {
                                $(x).children().each(function(n, xx) {
                                    if (xx.nodeName === 'gpxx:DisplayColor') {
                                        track_options.strokeColor = $(xx).text();
                                    }
                                });
                            }
                        });
                    });
                    $(trkseg).children('trkpt').each(function(n, trkpt) {
                        var latlng = new google.maps.LatLng(parseFloat($(trkpt).attr('lat')), parseFloat($(trkpt).attr('lon')));
                        track_options.path.push(latlng);
                    });
                    file._addSegment(track_options);
                });
            });
        }, this));
    };
}
)(jQuery);