function Segment(arg) {
    this.init(arg);
}
(function ($) {
    Segment.prototype.init = function (arg) {
        this.options = {
            map: null,
            sid: 'S1001',
            path: [],
            strokeColor: '#000fff',
            strokeOpacity: 0.35,
            strokeWeight: 5,
            name: null,
            desc: null
        };
        for (var attr in arg) {
            this.options[attr] = arg[attr];
        }
        if (this.options.name === null)
            this.options.name = this.options.sid;
        if (this.options.desc === null)
            this.options.desc = this.options.sid;
        this.setMethods();
        this.segmentList = this.options.map.file.segmentList;
        this.segmentItem = '.segment-item-name[rel="' + this.options.sid + '"]';
        this.setSegmentItem();
        this.selected = false;
        this.line = new google.maps.Polyline(this.lineOptions());
        this.line.setMap(this.options.map.googlemap);
        this.line.segment = this;
        this.undoStack = [];
        this.points = [];
        this.markerManager = null;
        this.editing = false;
        this.isActive = true; //shutdown events while doing directions rendering

        this.marker = new google.maps.Marker({
            position: this.options.path[0],
            map: this.options.map.googlemap,
            title: this.options.name,
            icon: this.options.map.imageLineNormal,
            segment: this
        });
        this.distanceMarker = new google.maps.Marker({
            position: this.options.path[0],
            map: this.options.map.googlemap,
            visible: false,
            icon: this.options.map.imageDistancePointer
        });
        google.maps.event.addListener(this.marker, 'click', $.proxy(function (event) {
            if (this.isActive) {
                $(this.segmentItem).trigger('click');
            }
        }, this));
        this.directionsRenderer = null;
        this.directionsService = null;
        this.refresh();

        //listeners

        google.maps.event.addListener(this.line, 'mouseover', $.proxy(function (event) {
            var distance_info = this.options.map.html['distance-info'];
            if (!this.editing && this.isActive && this.options.map.options.distance) {
                if (distance_info.hasClass('hide')) {
                    var nearest = this.nearestPoint(event.latLng);
                    var d = nearest.distance;
                    var distance = this.options.map.convertMeters2(d) + this.options.map.measure2();
                    this.distanceMarker.setPosition(nearest.latLng);
                    this.distanceMarker.index = nearest.index;
                    this.distanceMarker.setVisible(true);
                    this.distanceMarker.setTitle('');
                    distance_info.text(distance);
                    this.options.map.setMenuXY(distance_info, event.latLng);
                    var top = parseInt(distance_info.css('top').replace(/px/, ''));
                    top = top - 35;
                    distance_info.css('top', top + 'px');
                    distance_info.removeClass('hide');
                }
            }
        }, this));
        google.maps.event.addListener(this.line, 'mouseout', $.proxy(function (event) {
            var distance_info = this.options.map.html['distance-info'];
            if (this.isActive) {
                var iid = setInterval($.proxy(function () {
                    clearInterval(iid);
                    distance_info.addClass('hide');
                    this.distanceMarker.setVisible(false);
                }, this), 1000)
            }
        }, this));
        google.maps.event.addListener(this.marker, 'mouseover', $.proxy(function (event) {
            if (this.isActive)
                this.line.setOptions({
                    strokeWeight: this.options.strokeWeight + 4
                });
        }, this));
        google.maps.event.addListener(this.marker, 'mouseout', $.proxy(function (event) {
            if (this.isActive) {
                this.line.setOptions({
                    strokeWeight: this.options.strokeWeight
                });
            }
        }, this));
        google.maps.event.addListener(this.marker, 'rightclick', $.proxy(function (event) {
            if (this.isActive) {
                this.options.map.setClick();
            }
        }, this));

        google.maps.event.addListener(this.line, "click", $.proxy(function (event) { //rightclick
            if (this.isActive) {
                var nearest = this.nearestPoint(event.latLng);
                this.distanceMarker.setPosition(nearest.latLng);
                if (this.options.map.options.mode == 'edit') {
                    this.contextMenuLine(nearest);
                } else {
                    $(this.segmentItem).trigger('click');
                }
            }
        }, this));
    }
    Segment.prototype.setOptions = function (options) {
        for (var attr in options) {
            this.options[attr] = options[attr];
        }
    };
    Segment.prototype.setMethods = function () {
        this.pend = null;
        this.click = function (event) {
            switch (this.pend) {
                case 'extend' :
                    this.addPoint(event.latLng);
                    if (false === $(this.segmentItem).hasClass('selected')) {
                        this.options.file.selectSegment($(this.segmentItem)[0]);
                    }
                    this.options.map.setClick({
                        sid: this.options.sid
                    });
                    break;
            }
        };
        this.extend = function () {
            this.options.map.setClick({
                sid: this.options.sid,
                pid: null
            });
            this.pend = 'extend';
        };
        this.lineOptions = function () {
            return {
                'path': this.options.path,
                'strokeWeight': this.options.strokeWeight,
                'strokeColor': this.options.strokeColor,
                'strokeOpacity': this.options.strokeOpacity
            };
        };
    };

    Segment.prototype.setSegmentItem = function () {
        var rel = this.options.sid;
        this.segmentList
                .append($('<li>').attr({'id': this.options.sid}).addClass("segment-item")
                        .append($('<div>').addClass("ct-list-div hide")
                                .append($('<a>').attr({'href': "#", 'title': "focus segment"})
                                        .append($('<img>').addClass("segment-focus").attr({'rel': rel, 'src': this.options.map.siteUrl() + 'image/zoom.png'})))
                                .append($('<a>').attr({'href': "#", 'title': "elevation profile"})
                                        .append($('<img>').addClass("segment-elevation").attr({'rel': rel, 'src': this.options.map.siteUrl() + 'image/chart.png'})))
                                .append($('<span>')
                                        .append($('<a>').attr({'href': "#", 'title': "generate cue sheet"})
                                                .append($('<img>').addClass("segment-cuesheet").attr({'rel': rel, 'src': this.options.map.siteUrl() + 'image/cue.png'}).data({segment: this})))))
                        .append($('<a>').addClass('segment-item-name').attr({'rel': rel, 'href': "#", 'title': ""}).text(this.options.name)));
    };
    Segment.prototype.copy = function () {
        var result = {};
        for (var attr in this.options) {
            if (attr !== 'path') {
                result[attr] = this.options[attr];
            }
        }
        result.latlngs = [];
        this.line.getPath().forEach(function (latlng) {
            result.latlngs.push({
                lat: latlng.lat(0),
                lng: latlng.lng()
            });
        });
        result.sid = this.options.sid;
        return result;
    };
    Segment.prototype.distanceTo = function (marker) {
        var d = 0;
        var target = marker.getPosition();
        var previous = this.points[0].getPosition();
        if (previous.equals(target)) {
            return 0.0;
        }
        for (var i = 1; i < this.points.length; i++) {
            var current = this.points[i].getPosition();
            d += distanceFrom(previous, current);
            previous = current;
            if (target.equals(current)) {
                break;
            }
        }
        return (d);
    };
    Segment.prototype.nearestPoint = function (latlng) {
        var d = 0;
        var dd = null;
        var nearest = null;
        var index = 0;
        var total = 0;
        var path = this.line.getPath();
        path.forEach($.proxy(function (p, i) {
            d = distanceFrom(p, latlng);
            if (dd === null || d < dd) {
                nearest = p;
                index = i;
                dd = d;
            }
        }, this));
        var previous = null;
        var current = null;
        for (var i = 0; i < path.getLength(); i++) {
            current = path.getAt(i);
            if (i > 0) {
                total += distanceFrom(previous, current);
            }
            previous = current;
            if (current.equals(nearest)) {
                total += dd;
                break;
            }
        }
        return {
            latLng: nearest,
            index: index,
            distance: total
        };
    };
    Segment.prototype.distance = function () {
        return pathLength(this.line.getPath());
    };
    Segment.prototype.refresh = function () {
        var latlng = this.line.getPath().getAt(this.line.getPath().length - 1);
        this.marker.setPosition(latlng);
    };
    Segment.prototype.remove = function () {
        this.stopEditing();
        this.line.setMap(null);
        this.marker.setMap(null);
        this.distanceMarker.setMap(null);
        this.removeWaypoints();
        this.options.map.html['list'].find('.segment-item[rel="' + this.options.sid + '"]').remove();
        this.options.map.file.removeSegment(this.options.sid);
    };
    Segment.prototype._midPoint = function (pointA, pointB) {
        return new google.maps.LatLng(
                pointB.lat() - (0.5 * (pointB.lat() - pointA.lat())),
                pointB.lng() - (0.5 * (pointB.lng() - pointA.lng()))
                );
    };
    Segment.prototype.midPoint = function (point, index) {
        var path = this.line.getPath();
        var pointA = path.getAt(point.index - 1);
        var pointB = path.getAt(point.index);
        var latlng = this._midPoint(pointA, pointB);
        var midpoint = new google.maps.Marker({
            position: latlng,
            map: this.options.map.googlemap,
            icon: this.options.map.imageNormalMidpoint,
            draggable: true,
            segment: this,
            index: index,
            point: point
        });
        google.maps.event.addListener(midpoint, "mouseover", function () {
            this.setIcon(this.segment.options.map.imageNormal);
            var d = this.segment.distanceTo(this.point) - distanceFrom(this.getPosition(), this.point.getPosition());
            this.title = this.segment.options.map.convertMeters2(Math.round(100 * d) / 100) + this.segment.options.map.measure2();
        });
        google.maps.event.addListener(midpoint, "mouseout", function () {
            this.setIcon(this.segment.options.map.imageNormalMidpoint);
        });
        google.maps.event.addListener(midpoint, "dragend", function () {
            var latlng = this.getPosition();
            var index = this.point.index;
            var path = this.segment.line.getPath();
            path.insertAt(index, latlng);
            var point = this.segment.point(latlng, index);
            this.segment.points.splice(index, 0, point);
            for (var i in this.segment.points) {
                this.segment.points[i].index = parseInt(i);
            }
            var pointA = latlng;
            var pointB = this.point.getPosition();
            this.setPosition(this.segment._midPoint(pointA, pointB));
        });
        return midpoint;
    };
    Segment.prototype.point = function (latlng, index) {
        var point = new google.maps.Marker({
            position: latlng,
            map: this.options.map.googlemap,
            icon: this.options.map.imageNormal,
            draggable: true,
            index: index,
            segment: this,
            midpoint: null
        });
        if (index > 0) {
            point.midpoint = this.midPoint(point, index);
        } else {
            point.midpoint = null;
        }
        google.maps.event.addListener(point, "mouseover", function (event) {
            this.setIcon(this.segment.options.map.imageHover);
            var d = this.segment.distanceTo(this);
            this.setTitle(this.segment.options.map.convertMeters2(Math.round(100 * d) / 100) + this.segment.options.map.measure2());
        });
        google.maps.event.addListener(point, "mouseout", function () {
            this.setIcon(this.segment.options.map.imageNormal);
        });
        google.maps.event.addListener(point, "drag", function () {
            var path = this.segment.line.getPath();
            path.setAt(this.index, this.getPosition());
            this.segment.refresh();
        });
        google.maps.event.addListener(point, "dragend", function () {
            var path = this.segment.line.getPath();
            path.setAt(this.index, this.getPosition());
            if (this.midpoint === null || this.index === 0) {
                var left = this.segment.points[1];
            } else {
                left = this;
            }
            if (this.segment.points.length >= 2) {
                var pointA = path.getAt(left.index - 1);
                var pointB = path.getAt(left.index);
                left.midpoint.setPosition(midPoint(pointA, pointB));
                var pos = parseInt(left.index) + 1;
                if (pos < this.segment.points.length) {
                    var right = this.segment.points[pos];
                    pointA = path.getAt(right.index - 1);
                    pointB = path.getAt(right.index);
                    right.midpoint.setPosition(midPoint(pointA, pointB));
                }
            }
            this.segment.refresh();
        });
        google.maps.event.addListener(point, "click", function (event) { //rightclick
            this.segment.contextMenuLineEdit(this.index);
        });
        return point;
    };
    Segment.prototype.followRoad = function (latlng) {
        var segment = this;
        var request = {
            avoidHighways: this.options.map.options.avoidhighways,
            origin: this.line.getPath().getAt(this.line.getPath().getLength() - 1),
            destination: latlng,
            travelMode: google.maps.DirectionsTravelMode[this.options.map.options.travelmode]
        };
        this.options.map.directionsService.route(request, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                for (var route in response.routes) {
                    for (latlng in response.routes[route].overview_path) {
                        segment.line.getPath().push(response.routes[route].overview_path[latlng]);
                    }
                }
            }
            segment.refresh();
        });
    };
    Segment.prototype.addPoint = function (latlng) {
        this.save();
        this.stopEditing();
        if (this.options.map.options.followroad) {
            this.followRoad(latlng);
        } else {
            this.line.getPath().push(latlng);
        }
        this.refresh();
        this.options.file.setDirty(true);
    };
    Segment.prototype.rebuild = function () {
        var path = this.line.getPath();
        this.save();
        var j = path.getLength();
        var first = path.getAt(0);
        var last = path.getAt(j - 1);
        this.stopEditing();
        this.line.setPath([first]);
        this.addPoint(last);
        this.undoStack.pop();
        this.options.map.infowindow.close();
    };
    Segment.prototype.waypoint = function (index) {
        var path = this.line.getPath();
        if (index >= 0 && path.getLength()) {
            options = {
                'waypoint': true,
                'position': path.getAt(index),
                'draggable': false,
                'symbol': 'Waypoint',
                'url': '',
                'visible': true,
                'pid': null
            };
            this.options.map.file.addPlacemark(options);
        }
    };
    Segment.prototype.split = function (index) {
        var options = {
            path: [],
            strokeColor: this.line.strokeColor,
            strokeOpacity: this.line.strokeOpacity,
            strokeWeight: this.line.strokeWeight,
            name: this.options.name + '.',
            desc: this.options.desc
        };
        var path = this.line.getPath();
        if (index > 0 && path.getLength() > 1) {
            this.stopEditing();
            while (index <= path.getLength() - 1) {
                options.path.push(path.getAt(index));
                path.removeAt(index);
            }
            this.options.file.addSegment(options);
            this.refresh();
            this.options.file.setDirty(true);
            this.options.map.setClick(null);
        }
    };
    Segment.prototype.thin = function () {
        var path = this.line.getPath();
        this.save();
        var newline = [];
        var prev = null;
        path.forEach($.proxy(function (latlng, index) {
            if (prev) {
                var d = distanceFrom(prev, latlng);
                if (d > 300.0) {
                    newline.push(latlng);
                    prev = latlng;
                }
            } else {
                prev = latlng;
            }
        }, this));
        var dropped = path.getLength();
        dropped -= newline.length;
        this.line.setPath(newline);
        this.options.map.notice('dropped ' + dropped + ' points.');
        this.options.map.file.setDirty(true);
    };
    Segment.prototype.save = function () {
        var savepath = [];
        var path = this.line.getPath();
        path.forEach(function (latlng, index) {
            savepath.push(latlng);
        });
        this.undoStack.push(savepath);
    };
    Segment.prototype.undo = function () {
        if (this.undoStack.length) {
            this.stopEditing();
            var path = this.undoStack.pop();
            this.line.setPath(path);
            this.refresh();
        }
    };
    Segment.prototype.flip = function () {
        var path = this.line.getPath();
        this.save();
        var newpath = [];
        for (var j = path.getLength(); j > 0; j--) {
            newpath.push(path.pop());
        }
        this.line.setPath(newpath);
        this.refresh();
    };
    Segment.prototype.getBounds = function (bounds) {
        var path = this.line.getPath();
        path.forEach(function (point, index) {
            bounds.extend(point);
        });
    };
    Segment.prototype.focus = function () {
        var bounds = new google.maps.LatLngBounds();
        this.getBounds(bounds);
        this.options.map.googlemap.fitBounds(bounds);
    };
    Segment.prototype.manageMarkers = function () {
        if (this.markerManager) {
            this.markerManager.clearMarkers();
        }
        this.marker_cluster = [];
        for (var i in this.points) {
            this.marker_cluster.push(this.points[i]);
            if (this.points[i].midpoint) {
                this.marker_cluster.push(this.points[i].midpoint);
            }
        }
        this.markerManager = new MarkerClusterer(this.options.map.googlemap, this.marker_cluster, {gridSize: 50});
    };
    Segment.prototype.stopEditing = function () {
        if (this.markerManager)
            this.markerManager.clearMarkers();
        for (var i in this.points) {
            this.points[i].setMap(null);
            if (this.points[i].midpoint !== null) {
                this.points[i].midpoint.setMap(null);
            }
        }
        this.points.length = 0;
        this.editing = false;
    };
    Segment.prototype.lineEdit = function () {
        var segment = this;
        if (this.editing) {
            this.stopEditing();
        } else {
            if (this.points.length === 0) {
                var path = this.line.getPath();
                path.forEach(function (point, index) {
                    var marker = segment.point(point, index);
                    segment.points.push(marker);
                });
                this.manageMarkers();
            } else {
                for (var i in this.points) {
                    this.points[i].setVisible(true);
                    if (this.points[i].midpoint !== null) {
                        this.points[i].midpoint.setVisible(true);
                    }
                }
            }
            this.editing = true;
        }
    };
    Segment.prototype.open = function () {
        this.options.map.file.openInfo(this);
    };

    Segment.prototype.contextMenuLine = function (point) {
        var div = this.options.map.html['segment-cm-line'];
        div.find('.cm-line-action').data({
            segment: this,
            point: point.index
        });
        this.options.map.setMenuXY(div, point.latLng);
        div.removeClass('hide');
    };
    Segment.prototype.contextMenuLineEdit = function (index) {
        var div = this.options.map.html['segment-cm-edit'];
        div.find('.cm-edit-action').data({
            'segment': this,
            'index': index
        });
        this.options.map.setMenuXY(div, this.line.getPath().getAt(index));
        div.removeClass('hide');
    };
    Segment.prototype.contextMenuMarker = function (latlng) {
        var div = this.options.map.html['segment-cm-marker'];
        div.find('.cm-marker-action').data({
            segment: this
        });
        this.options.map.setMenuXY(div, latlng);
        div.removeClass('hide');
    };
    Segment.prototype.removePoint = function (index) {
        if (this.points.length) {
            var marker = this.points[index];
            var path = this.line.getPath();
            if (path.getLength() > 1) {
                this.save();
                marker.setMap(null);
                if (marker.midpoint !== null) {
                    marker.midpoint.setMap(null);
                }
                path.removeAt(index);
                this.points.splice(index, 1);
                for (var i in this.points) {
                    this.points[i].index = parseInt(i);
                }
                if (index < this.points.length && index > 0) {
                    var pointA = this.points[index - 1].getPosition();
                    var pointB = this.points[index].getPosition();
                    this.points[index].midmarker.setPosition(midPoint(pointA, pointB));
                }
                this.refresh();
                this.parent.setDirty(true);
            }
        }

    };
    Segment.prototype.getDirRequestOptions = function (options) {
        var opt = {
            avoidHighways: false,
            avoidTolls: true,
            destination: null,
            durationInTraffic: false,
            optimizeWaypoints: true,
            origin: null,
            provideRouteAlternatives: false,
            region: null,
            transitOptions: {},
            travelMode: 'BICYCLING',
            unitSystem: null,
            waypoints: null
        };
        for (var attr in options) {
            opt[attr] = options[attr];
        }
        return opt;
    };
    Segment.prototype.getDirRenderOptions = function (options) {
        var opt = {
            draggable: true, //boolean	allows the user to drag and modify the paths.
            map: null, //Map	Map on which to display the directions.
            markerOptions: {      //MarkerOptions	Options for the markers. All markers rendered by the DirectionsRenderer will use these options.

            },
            polylineOptions: {//	PolylineOptions	Options for the polylines.
                strokeColor: '#ff0000', //this.options.strokeColor,
                strokeWeight: 3, //this.options.strokeWeight,
                strokeOpacity: 1.0     //this.options.strokeOpacity
            },
            preserveViewport: false, //boolean	By default, the input map is centered and zoomed to the bounding box of this set of directions. If this option is set to true, the viewport is left unchanged, unless the map's center and zoom were never set.
            suppressBicyclingLayer: false, //boolean	Suppress the rendering of the BicyclingLayer when bicycling directions are requested.
            suppressInfoWindows: true, //boolean	Suppress the rendering of info windows.
            suppressMarkers: false, //boolean	Suppress the rendering of markers.
            suppressPolylines: false       //boolean	Suppress the rendering of polylines.
        };
        for (var attr in options) {
            opt[attr] = options[attr];
        }
        return opt;
    };
    Segment.prototype.cuesheetKill = function () {
        this.options.map.html['list'].find('img.segment-cuesheet').attr({'src': this.options.map.siteUrl() + 'image/cue.png'}).css({'visibility': 'visible'});
        try {
            this.options.map.html['cuesheet-dialog'].dialog('close');
        } catch (err) {
            if (err === '')
                ;
        }
        if (this.directionsRenderer && this.directionsRenderer.getMap()) {
            this.directionsRenderer.setMap(null);
        }
    };
    Segment.prototype.metersToStr = function (meters, metric) {
        if (meters < 10) {
            return {
                'd': metric ? meters.toFixed(2) : (meters * 3.2808399).toFixed(2), //meters and feet
                'm': metric ? 'm' : 'ft',
            };

        } else {
            return {
                'd': metric ? (meters / 1000).toFixed(2) : (meters / 1609.344).toFixed(2), //kilometers and miles
                'm': metric ? 'km' : 'mi',
            };
        }
    }

    Segment.prototype.cueLine = function (params) {
        var step = this.metersToStr(params.step, params.metric);
        var acc = this.metersToStr(params.distance, params.metric);
        var lines = params.instructions.split('<div');
        if (lines.length > 1) {
            lines[1] = removeHtmlStr('<div' + lines[1]);
            lines[0] += ' - ' + lines[1];
            params.instructions = lines[0];
        }
        var table = '<table>';
        var th = '<tr><th>&nbsp;Step&nbsp;</th><th></th><th>&nbsp;Trip&nbsp;</th><th></th><th>Instructions</th></tr>';
        var row = '<tr><td style="text-align:right; padding-right:5px;">&nbsp;' + step.d + '&nbsp;</td><td style="text-align:center;">&nbsp;' + step.m + '&nbsp;</td>' +
                '<td style="text-align:right; padding-right:5px;">&nbsp;' + acc.d + '&nbsp;</td><td style="text-align:center;">&nbsp;' + acc.m + '&nbsp;</td>' +
                '<td>&nbsp;%1&nbsp;</td></tr>';
        switch (params.type) {
            case 'header':
                return '<p>' + params.instructions + '</p>';
                break;
            case 'start':
                return  table + th + row.replace(/%1/, params.instructions);
                break;
            case 'step':
                return row.replace(/%1/, params.instructions);
                break;
            case 'end':
                return row.replace(/%1/, params.instructions) + '</table>';
                break;
            case 'waypoint' :
                return  table + th + row.replace(/%1/, params.instructions) + '</table>';
            default :
                return;
        }
    };
    Segment.prototype.cuesheetOut = function () {
        var list = '';
        var acc_distance = 0;
        var route = this.directionsRenderer.getDirections().routes[0];
        var leg = null;
        var step = null;
        var step_next = 0;
        var params = {
            metric: this.options.map.options.metric,
            header: this.options.map.options.cuesheet_header,
            type: 'header',
            index: 0,
            distance: 0, //meters
            step: 0, //meters
            instructions: ''
        };
        params.instructions = route.copyrights;
        list = this.cueLine(params);
        for (var i = 0; i < route.warnings.length; i++) {
            params.instructions = route.warnings[i];
            list += this.cueLine(params);
        }
        for (var leg_index = 0; leg_index < route.legs.length; leg_index++) {
            leg = route.legs[leg_index];
            params.type = 'start';
            params.distance = 0;
            params.step = 0;
            params.instructions = leg.start_address;
            list += this.cueLine(params);
            params.type = 'step';
            for (var step_index = 0; step_index < leg.steps.length; step_index++) {
                step = leg.steps[step_index];
                params.index = step_index + 1;
                params.distance = acc_distance;
                params.step = step_next;
                params.instructions = step.instructions;
                list += this.cueLine(params);
                if (step.distance) {
                    step_next = step.distance.value;
                    acc_distance += step.distance.value
                }
            }
            params.type = 'end';
            params.distance = acc_distance;
            params.step = step_next;
            params.instructions = leg.end_address;
            list += this.cueLine(params);
        }

        try {
            this.options.map.html['cuesheet-dialog'].dialog('isOpen');
        } catch (err) {
            this.cuesheetDialog();
        }
        this.options.map.html['cuesheet-dialog'].find('.cuesheet').val(list);

    };
    Segment.prototype.cuesheetDirections = function () {
        var segment = this;
        if (this.directionsRenderer && this.directionsRenderer.getMap()) {
            this.cuesheetKill();
            return;
        }
        if (!this.directionsService) {
            this.directionsService = new google.maps.DirectionsService();
        }
        if (!this.directionsRenderer) {
            this.directionsRenderer = new google.maps.DirectionsRenderer(this.getDirRenderOptions({}));
            google.maps.event.addListener(this.directionsRenderer, "directions_changed", function () {
                segment.cuesheetOut();
            });
        }
        var waypoints = [];
        var path = this.line.getPath();
        var first = path.getAt(0);
        var last = path.getAt(path.getLength() - 1);
        options = {
            'waypoints': waypoints.length > 0 ? waypoints : null,
            'destination': last,
            'origin': first
        };
        this.directionsService.route(this.getDirRequestOptions(options), function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                segment.directionsRenderer.setMap(segment.options.map.googlemap);
                segment.directionsRenderer.setDirections(response);
            } else {
                segment.options.map.alert(status);
            }
        });
    };
    Segment.prototype.findWaypoints = function () {
        //only use waypoints that fall on a line point.
        var waypoints = [];
        for (var pid in this.options.file.placemarks) {
            var wp = this.options.file.placemarks[pid];
            if (wp.options.symbol === 'Waypoint') {
                var pos = wp.options.position;
                var points = this.line.getPath().getArray();
                for (var i = 0; i < points.length; i++) {
                    if (pos.equals(points[i])) {
                        waypoints.push({'pid': pid, 'latlng': pos, 'index': i});
                        break;
                    }
                }
            }
        }
        waypoints.sort(function (a, b) {
            return a.index - b.index; //use path point index to order waypoints
        });
        return waypoints;
    };
    Segment.prototype.copyWaypoints = function (clipboard) {
        var waypoints = this.findWaypoints();
        for (var i = 0; i < waypoints.length; i++) {
            clipboard.push(this.options.file.placemarks[waypoints[i].pid].copy());
        }
    };
    Segment.prototype.removeWaypoints = function () {
        var waypoints = this.findWaypoints();
        for (var i = 0; i < waypoints.length; i++) {
            this.options.file.placemarks[waypoints[i].pid].remove();
        }
    };
    Segment.prototype.cueUpdateWaypoints = function (route) {
        var options = {
            url: '',
            symbol: 'Waypoint',
            name: null,
            desc: null,
            position: null,
            visible: true
        };
        var acc_distance = 0;
        var leg = null;
        var step_next = 0;
        for (var leg_index = 0; leg_index < route.legs.length; leg_index++) {
            leg = route.legs[leg_index];
            options.position = this.nearestPoint(leg.start_location).latLng;
            options.desc = 'Start - ' + leg.start_address;
            options.name = this.options.sid + ' 1000';
            this.options.file.addPlacemark(options);
            var params = {type: 'waypoint'};
            for (var step_index = 0; step_index < leg.steps.length; step_index++) {
                var step = leg.steps[step_index];
                params.distance = acc_distance;
                params.step = step_next;
                params.instructions = step.instructions;
                options.desc = this.cueLine(params);
                options.position = this.nearestPoint(step.start_location).latLng;
                options.name = this.options.sid + ' ' + (step_index + 1001);
                this.options.file.addPlacemark(options);
                if (step.distance) {
                    step_next = step.distance.value;
                    acc_distance += step.distance.value;
                }
            }
            params.distance = acc_distance;
            params.step = step_next;
            params.instructions = leg.end_address;
            options.desc = this.cueLine(params);
            options.position = this.nearestPoint(leg.end_location).latLng;
            options.name = this.options.sid + ' ' + (step_index + 1002);
            this.options.file.addPlacemark(options);
        }
    };
    Segment.prototype.cueUpdatePath = function () {
        if (this.directionsRenderer && this.directionsRenderer.getMap()) {
            //remove current waypoints
            this.removeWaypoints();
            var route = this.directionsRenderer.getDirections().routes[0];
            this.line.setPath(route.overview_path);
            this.cueUpdateWaypoints(route);
            this.options.desc = this.options.map.html['cuesheet-dialog'].find('.cuesheet').val()
            this.options.file.setDirty(true);
            this.refresh();
        }
        this.options.desc = this.options.map.html['cuesheet-dialog'].find('.cuesheet').val();
    };
    Segment.prototype.cuesheetWaypoints = function () {
        var waypoints = this.findWaypoints();
        var list = '<table>';
        list += '<tr><th>&nbsp;Step&nbsp;</th><th></th><th>&nbsp;Trip&nbsp;</th><th></th><th>Instructions</th></tr>';
        for (var i = 0; i < waypoints.length; i++) {
            var line = this.options.file.placemarks[waypoints[i].pid].options.desc;
            var lines = line.split('</tr>');
            if (lines.length > 1) {
                var start = lines[1].indexOf('<tr>');
                if (start > -1) {
                    var end = line.indexOf('</table>') - 1;
                    line = lines[1].substr(start, end - start);
                    list += line + '</tr>';
                } else {
                    list += line;
                }
            } else {
                list += line;
            }
        }
        list += '</table>';
        this.options.map.html['cuesheet-dialog'].find('.cuesheet').val(list);
        try {
            this.options.map.html['cuesheet-dialog'].dialog('isOpen');
        } catch (err) {
            this.cuesheetDialog();
        }
    };

    Segment.prototype.edit = function () {
        this.segmentDialog();
    };
})(jQuery);