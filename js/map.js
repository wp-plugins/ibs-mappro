function Map(arg) {
    this.init(arg);
}
(function ($) {
    Map.prototype.init = function (arg) {
        this.options = {
            address: '',
            div: 'body',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            url: '',
            mid: 'M1001',
            metric: false,
            filename: '',
            location: new google.maps.LatLng(37.09024, -95.712891), // center on usa
            strokeColor: '#000fff',
            strokeWeight: 5,
            strokeOpacity: 0.3,
            distance: false,
            followroad: true,
            travelmode: "DRIVING",
            avoidhighways: true,
            user_type: 'guest',
            user_name: 'unknown',
            pid: '',
            gpx_routes: false,
            gpx_tracks: true,
            gpx_waypoints: true,
            gpx_placemarks: true,
            mode: 'edit'
        };
        for (var attr in arg) {
            this.options[attr] = arg[attr];
        }
        this.siteRoot = function () {
            return ibs_mappro.root;
        };
        this.siteUrl = function () {
            return ibs_mappro.site;
        };
        this.html = [];
        this.garmin_symbols = null;
        this.files = {};
        this.fileId = 1000;
        this.googlemap = null;
        if (typeof window.maps === 'undefined') {
            window.maps = {};
        }
        this.options.mid = 'M1' + padLeftStr(Object.keys(window.maps).length + 1, 3, '0');
        window.maps[this.options.mid] = this;
        this.click = function (event) {
            var sid = click_target.sid;
            var pid = click_target.pid;
            click_target = {
                pid: null,
                sid: null
            };
            this.setCursor('pointer');
            if (sid) {
                var segment = this.file.segments[sid];
                segment.pend = 'extend';
                segment.click(event);
            }
            if (pid) {
                var placemark = this.file.placemarks[pid];
                placemark.click(event);
            }
            this.file.click(event);
        };
        var click_target = {
            pid: null,
            sid: null
        };
        this.setClick = function (target) {
            this.file.pendReset();
            if (!target) {
                click_target = {
                    pid: null,
                    sid: null
                };
                this.setCursor('pointer');
                return false;
            } else {
                click_target = target;
                this.setCursor('crosshair');
                return true;
            }
        };
        this.getClick = function () {
            return click_target;
        };

        this.setCursor = function (cursor) {
            this.googlemap.setOptions({
                draggableCursor: cursor
            });
        };
        this.fitBounds = function () {
            var bounds = new google.maps.LatLngBounds();
            this.file.getBounds(bounds);
            this.googlemap.fitBounds(bounds);
            this.file.refresh();
        };
        this.setBikeLayer = function (bool) {
            if (bool) {
                this.bicycleLayer.setMap(this.googlemap);
            } else {
                this.bicycleLayer.setMap(null);
            }
        };
        this.setMenuXY = function (item, latlng) {
            var mapWidth = this.html['map-div'].width();
            var mapHeight = this.html['map-div'].height();
            var menuWidth = item.width();
            var menuHeight = item.height();
            var clickedPosition = this.getCanvasXY(latlng);
            var left = clickedPosition.x;
            var top = clickedPosition.y;
            left = mapWidth - left < menuWidth ? left - menuWidth : left;
            top = mapHeight - top < menuHeight ? top - menuHeight : top;
            item.css({'left': left, 'top': top, 'position': 'absolute'});
        };
        this.getCanvasXY = function (latlng) {
            var scale = Math.pow(2, this.googlemap.getZoom());
            var nw = new google.maps.LatLng(
                    this.googlemap.getBounds().getNorthEast().lat(),
                    this.googlemap.getBounds().getSouthWest().lng()
                    );
            var worldCoordinateNW = this.googlemap.getProjection().fromLatLngToPoint(nw);
            var worldCoordinate = this.googlemap.getProjection().fromLatLngToPoint(latlng);
            var latlngOffset = new google.maps.Point(
                    Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                    Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
                    );
            return latlngOffset;
        };
        this.measure1 = function () {
            return this.options.metric ? '(m)' : '(f)';
        };
        this.measure2 = function () {
            return this.options.metric ? ' km' : ' mi';
        };
        this.convertMeters1 = function (meters) {
            return this.options.metric ? meters.toFixed(2) : (meters * 3.2808399).toFixed(2);
        };
        this.convertMeters2 = function (meters) {
            return this.options.metric ? (meters / 1000).toFixed(2) : (meters / 1609.344).toFixed(2);
        };
        this.isGuest = function () {
            return this.options.user_type === 'guest' || this.options.mode !== 'edit';
        };
        this.isAdmin = function () {
            return this.options.user_type === 'admin' && this.options.mode === 'edit';
        };
        this.getUser = function () {
            return this.options.user_type;
        };
        this.getPath = function () {
            var folder = this.isAdmin() ? '' : 'share/';
            return this.options.maps_path + folder;
        };
        this.getUserFolder = function () {
            if (this.options.user_name !== 'unknown' && this.options.user_name !== '' && /^[a-z0-9_-]{3,16}$/.test(this.options.user_name))
                return this.options.user_name + '/'
            else
                return '';
            ;
        }
        this.getCkeditorConfig = function () {
            return {
                toolbarStartupExpanded: true,
                extraPlugins: 'print,table',
                disableNativeSpellChecker: false,
                browserContextMenuOnCtrl: true,
                removePlugins: 'scayt',
                height: 200,
                contentsCss: this.siteUrl() + '/css/map.css',
                resize_enabled: true,
                toolbar:
                        [
                            ['Source', 'Undo', 'Redo', '-', 'SelectAll', 'RemoveFormat'],
                            ['Bold', 'Italic', 'Underline', 'Strike'],
                            ['Link', 'Unlink', 'Image'],
                            ['TextColor', 'BGColor', 'Print', 'Table']
                        ]
            };
        };
        this.kml = new KML();
        this.gpx = new GPX();
        this.setIcons();
        this.setHtml(); //set up html for map
        this.setMap();
        this.setFile();
        if (isUrl(this.options.url)) {
            this.file.importFile(this.options.url);
        } else {
            if (this.options.address !== '') {
                this.geocoder.geocode({
                    'address': this.options.address
                }, $.proxy(function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var lat = results[0].geometry.location.lat();
                        var lng = results[0].geometry.location.lng();
                        lng = parseFloat(lng);
                        lat = parseFloat(lat);
                        if (typeof lat === 'number' && typeof lng === 'number') {
                            var latlng = new google.maps.LatLng(lat, lng);
                            this.googlemap.setCenter(latlng);
                        }
                    }
                }, this));
            }
        }
    };
    Map.prototype.setFile = function () {
        this.file = new File(
                {
                    map: this,
                    url: '',
                    strokeColor: this.options.strokeColor,
                    strokeWeight: this.options.strokeWeight,
                    strokeOpacity: this.options.strokeOpacity,
                    filename: this.options.filename,
                    gpx_routes: this.options.gpx_routes,
                    gpx_tracks: this.options.gpx_tracks,
                    gpx_waypoints: this.options.gpx_waypoints,
                    gpx_placemarks: this.options.gpx_placemarks
                }
        );
    };
    Map.prototype.removeFile = function () {
        this.setClick();
        delete this.file;
        this.html['list'].find('.placemark-list').empty();
        this.html['list'].find('.segment-list').empty();
        this.html['list'].find('.import-list').empty();
        this.setFile();
    };

    Map.prototype.clear = function (options) {
        this.file.remove();
    };
    Map.prototype.isDirty = function () {
        if (this.file.dirty) {
            return 'Changes have not been saved.';
        }
        return null;
    };
    Map.prototype.findLocation = function () {
        var address = this.html['find-dialog'].find('.find-words').val();
        if (address !== '') {
            this.geocoder.geocode({
                'address': address
            }, $.proxy(function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    this.html['find-dialog'].find('.find-list').html('');
                    for (var i in results) {
                        var lat = results[i].geometry.location.lat();
                        var lng = results[i].geometry.location.lng();
                        this.html['find-dialog'].find('.find-list')
                                .append($('<li>')
                                        .append($('<a>').addClass('find-item').attr({'href': "#", 'lat': lat, 'lng': lng}).html(results[i].formatted_address)));
                    }
                    this.googlemap.setCenter(results[0].geometry.location);
                    this.searchmarker.setPosition(results[0].geometry.location);
                    this.searchmarker.setTitle(results[0].formatted_address);
                    this.searchmarker.setVisible(true);
                    this.html['find-dialog'].find('.find-item').on('click', null, {map: this}, function (ev) {
                        var lat = parseFloat($(this).attr('lat'));
                        var lng = parseFloat($(this).attr('lng'));
                        var latlng = new google.maps.LatLng(lat, lng);
                        ev.data.map.searchmarker.setPosition(latlng);
                        ev.data.map.searchmarker.setTitle($(this).text());
                        ev.data.map.searchmarker.setVisible(true);
                        ev.data.map.googlemap.setCenter(latlng);
                    });
                    this.html['find-dialog'].on('mouseover', '.find-item', {map: this}, function (ev) {
                        var lat = parseFloat($(this).attr('lat'));
                        var lng = parseFloat($(this).attr('lng'));
                        var latlng = new google.maps.LatLng(lat, lng);
                        ev.data.map.searchmarker.setPosition(latlng);
                        ev.data.map.searchmarker.setTitle($(this).text());
                        ev.data.map.searchmarker.setVisible(true);
                    });
                } else {
                    this.alert(status);
                }
            }, this));
        }
    };

    Map.prototype.setMap = function () {
        if (this.googlemap === null) {
            /*
             Build list of map types.
             */
            var mapTypeIds = [];
            for (var type in google.maps.MapTypeId) {
                mapTypeIds.push(google.maps.MapTypeId[type]);
            }
            mapTypeIds.push("OSM");
            mapTypeIds.push("OSMCYCLE");
            mapTypeIds.push("OSMPUBLIC");
            mapTypeIds.push("OSMLANDSCAPE");
            mapTypeIds.push("OSMOUTDOORS");
            var styles = [
                {
                    featureType: 'poi.business',
                    stylers: [
                        {visibility: 'on'}
                    ]
                }
            ];

            var map_options = {
                backgroundColor: null,
                center: this.options.location,
                disableDefaultUI: false,
                disableDoubleClickZoom: false,
                draggable: true,
                draggingCursor: 'auto',
                heading: 0,
                keyboardShortcuts: true,
                mapMaker: false,
                mapTypeControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControlOptions: {mapTypeIds: mapTypeIds, position: google.maps.ControlPosition.TOP_RIGHT, style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}, // DROPDOWN_MENU DEFAULT HORIZONTAL_BAR
                maxZoom: null,
                noClear: false,
                overviewMapControl: true,
                overviewMapControlOptions: {opened: false},
                panControl: false,
                panControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT},
                rotateControl: false,
                rotateControlOptions: {position: google.maps.ControlPosition.BOTTOM_RIGHT},
                scaleControl: true,
                scaleControlOptions: {position: google.maps.ControlPosition.BOTTOM_CENTER, style: 'DEFAULT'},
                scrollwheel: true,
                //streetView : StreetViewPanorama
                streetViewControl: this.options.mode === 'edit' ? true : false,
                streetViewControlOptions: {position: google.maps.ControlPosition.TOP_LEFT},
                styles: styles,
                tilt: 0,
                zoom: 7,
                zoomControl: this.options.mode === 'edit' ? true : false,
                zoomControlOptions: {position: google.maps.ControlPosition.TOP_LEFT, style: google.maps.ZoomControlStyle.SMALL} // DEFAULT LARGE SMALL
            };
            this.googlemap = new google.maps.Map(this.html['map-div'][0], map_options);

            this.googlemap.mapTypes.set("OSM", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Street', //"OpenStreetMap",
                maxZoom: 18
            }));
            this.googlemap.mapTypes.set("OSMCYCLE", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return 'http://tile.thunderforest.com/cycle/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Cycle',
                maxZoom: 18
            }));
            this.googlemap.mapTypes.set("OSMPUBLIC", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return 'http://tile.thunderforest.com/transport/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Public',
                maxZoom: 18
            }));
            this.googlemap.mapTypes.set("OSMPUBLIC", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return 'http://tile.thunderforest.com/transport/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Public',
                maxZoom: 18
            }));
            this.googlemap.mapTypes.set("OSMLANDSCAPE", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return 'http://tile.thunderforest.com/landscape/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Landscape',
                maxZoom: 18
            }));
            this.googlemap.mapTypes.set("OSMOUTDOORS", new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    return 'http://tile.thunderforest.com/outdoors/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OSM-Outdoors',
                maxZoom: 18
            }));
            this.bicycleLayer = new google.maps.BicyclingLayer(this.googlemap);
            this.bicycleLayer.setMap(null);
            this.directionsService = new google.maps.DirectionsService();
            this.geocoder = new google.maps.Geocoder();
            this.infowindow = new google.maps.InfoWindow({
                content: ''
            });
            this.searchmarker = new google.maps.Marker({
                position: this.options.location,
                map: this.googlemap,
                visible: false,
                title: 'search marker',
                icon: this.imageRedMarker
            });
            google.maps.event.addListener(this.searchmarker, 'click', function (event) {
                this.setVisible(false);
            });
            google.maps.event.addListener(this.googlemap, "click", $.proxy(function (event) {
                this.click(event);
            }, this));
            google.maps.event.addListener(this.googlemap, "rightclick", $.proxy(function (event) {
                this.setClick();
            }, this));
            google.maps.event.addListener(this.googlemap, "mousemove", $.proxy(function (event) {
                this.showPend(event.latLng)
            }, this));
            return this.googlemap;
        }
    };
    Map.prototype.showPend = function (latlng) {
        var pend_info = this.html['map'].find('.pend-info');
        pend_info.addClass('hide');
        var target = this.getClick();
        var ppend = this.file.pend;
        if (target.sid) {
            ppend = this.file.segments[target.sid].pend;
        }
        this.html['ibs-footer'].find('.ibs-message').text('right click cancels action');
        switch (ppend) {
            case 'placemark' :
                pend_info.text('Set marker');
                this.html['list'].find('.placemark-list-name').removeClass('img-marker').addClass('img-marker-hot');
                break;
            case 'segment' :
                pend_info.text('Start route');
                this.html['list'].find('.segment-list-name').removeClass('img-line').addClass('img-line-hot');
                break;
            case 'sort' :
                pend_info.text('Set sort origin');
                break;
            case 'extend' :
                pend_info.text('Extend route');

                break;
            default :
                this.html['list'].find('.placemark-list-name').removeClass('img-marker-hot').addClass('img-marker');
                this.html['list'].find('.segment-list-name').removeClass('img-line-hot').addClass('img-line');
                this.html['ibs-footer'].find('.ibs-message').text('');
                return;
        }
        this.setMenuXY(pend_info, latlng);
        var top = parseInt(pend_info.css('top').replace(/px/, ''));
        top = top - 50;
        pend_info.css('top', top + 'px');
        pend_info.removeClass('hide');
    }

    Map.prototype.reset = function () {
        this.setClick();
        spin(false);
        for (var sid in this.file.segments) {
            this.file.segments[sid].stopEditing();
            this.file.segments[sid].cuesheetKill();
        }
        this.elevationSegment = null;
        this.sizeHtml();
    };
    Map.prototype.stats = function (list, distance, segments, placemarks) {
        var pm = padLeftStr(placemarks.toString(), 3, ' ') + ' placemarks.';
        var sm = padLeftStr(segments.toString(), 3, ' ') + ' segments.';
        $(list).html('')
                .append($('<div>').addClass('stats')
                        .append($('<img>').attr('src', this.siteUrl() + 'image/gears.png'))
                        .append($('<span>').html(this.convertMeters2(distance) + this.measure2())))
                .append($('<div>').addClass('stats').addClass(segments ? '' : 'hide')
                        .append($('<img>').attr('src', this.siteUrl() + 'image/line.png'))
                        .append($('<span>').html(sm)))
                .append($('<div>').addClass('stats').addClass(placemarks ? '' : 'hide')
                        .append($('<img>').attr('src', this.siteUrl() + 'image/marker.png'))
                        .append($('<span>').html(pm)));
    }
    Map.prototype.alert = function (message) {
        var dd = jQuery('<div>').attr({'id': 'alert-dialog', 'title': 'Alert'}).css({'background-color': 'Tomato', 'color': 'white'})
                .append(jQuery('<p>')
                        .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/alert-white.png').css({'float': 'left', 'margin-right': '5px'}))
                        .append(jQuery('<span>').html(message)));
        jQuery(dd).dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                Ok: function () {
                    jQuery(this).dialog("close");
                }
            },
            close: function () {
                jQuery(this).dialog('destroy');
            }
        });
    };
    Map.prototype.confirm = function (message, callback) {
        var dd = jQuery('<div>').attr({'id': 'alert-dialog', 'title': 'Confirm'}).css({'background-color': 'Tomato', 'color': 'white'})
                .append(jQuery('<p>')
                        .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/alert-white.png').css({'float': 'left', 'margin-right': '5px'}))
                        .append(jQuery('<span>').html(message)));
        jQuery(dd).dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                Ok: function () {
                    jQuery(this).dialog("close");
                    callback(true);
                },
                Cancel: function () {
                    jQuery(this).dialog("close");
                    callback(false);
                }
            },
            close: function () {
                jQuery(this).dialog('destroy');
            }
        });
    }
    Map.prototype.prompt = function (message, callback) {
        var dd = jQuery('<div>').attr({'id': 'alert-dialog', 'title': 'Alert'}).css({'background-color': 'AliceBlue', 'color': 'blue'})
                .append(jQuery('<p>')
                        .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/question.png').css({'float': 'left', 'margin-right': '5px'}))
                        .append(jQuery('<span>').css({'float': 'left', 'margin-right': '5px'}).html(message))
                        .append(jQuery('<input>').attr({'id': 'answer', 'type': 'text', 'size': '30', 'value': ''})));
        jQuery(dd).dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                Ok: function () {
                    jQuery(this).dialog("close");
                    if (typeof callback === 'function') {
                        callback(jQuery(dd).find('#answer').val());
                    }
                },
                Cancel: function () {
                    jQuery(this).dialog("close");
                    if (typeof callback === 'function') {
                        callback(null);
                    }
                },
            },
            close: function () {
                jQuery(this).dialog('destroy');
            }
        });
    }
    Map.prototype.notice = function (message) {
        var dd = jQuery('<div>').attr({'id': 'notice-dialog', 'title': 'Notice'}).css({'background-color': 'AliceBlue', 'color': 'blue'})
                .append(jQuery('<p>')
                        .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/notice.png').css({'float': 'left', 'margin-right': '5px'}))
                        .append(jQuery('<span>').html(message)));
        jQuery(dd).dialog({
            autoOpen: true,
            modal: false,
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "blind",
                duration: 1000
            },
            open: function () {
                var noticeInterval = setInterval(function () {
                    jQuery(dd).dialog('close');
                    clearInterval(noticeInterval);
                }, 2500);
            },
            close: function () {
                jQuery(this).dialog('destroy');
            }
        });
    }
})(jQuery);

