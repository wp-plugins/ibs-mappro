function File(arg) {
    this.init(arg);
}
(function ($) {
    File.prototype.init = function (arg) {
        this.options = {
            filename: '(un-named).kml',
            name: null,
            desc: null,
            map: null,
            strokeColor: null,
            strokeWeight: null,
            strokeOpacity: null,
            gpx_routes: false,
            gpx_tracks: true,
            gpx_waypoints: true,
            gpx_placemarks: true,
            import_dir: null,
            import_files: []
        };
        for (var attr in arg) {
            this.options[attr] = arg[attr];
        }
        this.visiblePlacemark = false;
        this.dir = this.options.map.getUser() + '/';
        this.filename = this.options.filename;
        this.options.name = this.filename;
        this.options.desc = this.filename;
        this.fileList = this.options.map.html['list'];
        this.options.map.html['list'].find('.list-filename').text(this.filename);
        this.placemarkList = this.options.map.html['list'].find('.placemark-list');
        this.segmentList = this.options.map.html['list'].find('.segment-list');
        this.segmentList.sortable();
        this.segmentList.disableSelection();
        this.placemarkList.sortable();
        this.placemarkList.disableSelection();
        this.segments = {};
        this.placemarks = {};
        this.segmentId = 1000;
        this.placemarkId = 1000;
        this.removeFile = false;
        this.pend = null;
        this.setDirty = function (bool) {
            this.dirty = bool;
            if (this.dirty) {
                this.fileList.find('.file-list-name').addClass('dirty');
            } else {
                this.fileList.find('.file-list-name').removeClass('dirty');
            }
        };
    };
    File.prototype.importFile = function (url) {
        spin(true);
        this.options.import_files = url.split(';');
        var uriinfo = purl(this.options.import_files[0]);
        this.options.import_dir = uriinfo.data.attr.base + uriinfo.data.attr.directory;
        this.options.import_files[0] = uriinfo.data.attr.file;
        this._importFile();
    };
    File.prototype._importFile = function () {
        if (this.options.import_files.length) {
            var url = this.options.import_dir + this.options.import_files.pop();
            $.post(ibs_mappro.ajax, {
                action: 'ibs_mappro_CORS',
                path: url,
                cache: false
            }, $.proxy(function (data, status) {
                try {
                    if (status === 'success') {
                        try {
                            var xml = $.parseXML(data);
                        } catch (err) {
                            alert(err);
                        }
                        if ($(xml).find('kml').length > 0) {
                            this.options.map.kml.reader(xml, this);
                        } else {
                            if ($(xml).find('gpx').length > 0) {
                                this.options.map.gpx.reader(xml, this);
                            } else {
                                alert('invalid file contents');
                            }
                        }
                    } else {
                        alert('server load failed.');
                    }
                } catch (err) {
                    alert('process map failed.');
                }
                var fname = getFilename(url) + '.' + getExtension(url);
                if (this.filename === this.options.map.options.filename) {
                    this.filename = fname;
                    this.options.map.html['list'].find('.list-filename').text(fname);
                }
                this.options.map.html['list'].find('.import-list').append($('<li>').text(fname));
                this.postLoad();
                this._importFile();
                spin(false);
            }, this));
        }
    };

    File.prototype.checkMapname = function (filename, default_ext) {
        if (typeof filename === 'string' && filename.length > 3) {
            var ext = getExtension(filename);
            var name = getFilename(filename);
            if (/^[\w\s-()]{3,50}$/.test(name)) {
                if (ext !== 'kml' || ext !== 'kmz' || ext !== 'gpx') {
                    ext = default_ext;
                }
                return name + '.' + ext;
            }
        }
        return false;
    };
    File.prototype.listSegments = function () {
        var list = [];
        var items = this.segmentList.find('li a.segment-item-name');
        $(items).each(function (index, item) {
            list.push($(item).attr('rel'));
        });
        return list;
    };
    File.prototype.listPlacemarks = function () {
        var list = [];
        var items = this.placemarkList.find('li a.placemark-item-name');
        $(items).each(function (index, item) {
            list.push($(item).attr('rel'))
        });
        return list;
    };
    File.prototype.sortSegments = function (event) {
        var latlng = event.latLng;
        var items = [];
        for (var ss in this.segments) {
            var item = {
                distance: distanceFrom(latlng, this.segments[ss].marker.getPosition()),
                sid: ss
            };
            items.push(item);
        }
        items.sort(function (a, b) {
            if (a.distance < b.distance) {
                return -1;
            }
            if (a.distance > b.distance) {
                return 1;
            }
            return 0;
        });
        var last = null;
        for (var i in items) {
            if (last) {
                var target = '.' + last;
                var subject = '.' + items[i].sid;
                $(subject).insertAfter(target);
            }
            last = items[i].sid;
        }
    };
    File.prototype.sortPlacemarks = function (event) {
        var latlng = event.latLng;
        var items = [];
        for (var pp in this.placemarks) {
            var item = {
                distance: distanceFrom(latlng, this.placemarks[pp].marker.getPosition()),
                pid: pp
            };
            items.push(item);
        }
        items.sort(function (a, b) {
            if (a.distance < b.distance) {
                return -1;
            }
            if (a.distance > b.distance) {
                return 1;
            }
            return 0;
        });
        var last = null;
        for (var i in items) {
            if (last) {
                var target = '.' + last;
                var subject = '.' + items[i].pid;
                $(subject).insertAfter(target);
            }
            last = items[i].pid;
        }
    };
    File.prototype._orderPlacemark = function (pid) {
        var d = null;
        var p = null;
        for (var pp in this.placemarks) {
            if (pp === pid) {
                continue;
            }
            var dd = distanceFrom(this.placemarks[pid].marker.getPosition(), this.placemarks[pp].marker.getPosition());
            if (!d || dd < d) {
                d = dd;
                p = pp;
            }
        }
        if (p) {
            var target = '#' + p;
            var subject = '#' + pid;
            $(subject).insertAfter(target);
        }
    };
    File.prototype._undoSegment = function (options) {
        options.path = [];
        for (var i = 0; i < options.latlngs.length; i++) {
            options.path.push(new google.maps.LatLng(options.latlngs[i].lat, options.latlngs[i].lng));
        }
        delete options.latlng;
        this.segments[options.sid] = new Segment(options);
    };
    File.prototype._undoPlacemark = function (options) {
        if (!this.placemarks[options.pid]) {
            this.placemarks[options.pid] = new Placemark(options);
        }
    };
    File.prototype.undo = function (clipboard) {
        spin(true);
        try {
            for (var i = 0; i < clipboard.length; i++) {
                if (clipboard[i].pid) {
                    this._undoPlacemark(clipboard[i]);
                } else {
                    if (clipboard[i].sid) {
                        this._undoSegment(clipboard[i]);
                    }
                }
                this.postLoad(true);
                this.setDirty(true);
            }
        } catch (e) {
            spin(false);
        }
        spin(false);
    };
    File.prototype.postLoad = function () {
        this.dirty = false;
        this.options.map.setClick(null);
        this.focus();
        this.updatePid();
    };
    File.prototype.getPids = function (data, index) {
        this.options.map.geocoder.geocode({
            'address': data[index][1]
        }, $.proxy(function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                lng = parseFloat(lng);
                lat = parseFloat(lat);
                if (typeof lat === 'number' && typeof lng === 'number') {
                    var latlng = new google.maps.LatLng(lat, lng);
                    var p = data[index][0];
                    this.placemarks[p].options.position = latlng;
                    this.placemarks[p].options.desc = results[0].formatted_address;
                    this.placemarks[p].marker.setPosition(latlng);
                    this.placemarks[p].marker.setVisible(true);
                }
                index++;
                if (index < data.length) {
                    this.getPids(data, index, bounds);
                } else {
                    var bounds = new google.maps.LatLngBounds();
                    this.getBounds(bounds)
                    this.options.map.googlemap.fitBounds(bounds);
                    //this.options.map.html['dd-display'].find('.control-placemarks').trigger('click');
                }
            }
        }, this));
    };
    File.prototype.updatePid = function () {
        if (this.options.map.options.pid !== '') {
            var results = [];

            $.post(ibs_mappro.ajax, {
                action: 'ibs_mappro_pid',
                pid: this.options.map.options.pid,
            }, $.proxy(function (data, status) {
                if (status === 'success') {
                    for (var id in data) {
                        for (var pid in this.placemarks) {
                            if (this.placemarks[pid].options.name === id) {
                                results.push([pid, data[id]]);
                            }
                        }
                    }
                    if (results.length > 0) {
                        this.getPids(results, 0);
                    }
                }
            }, this),
                    'json'
                    );
        }
    };
    File.prototype._add = function (options) {
        options.mid = this.options.mid;
        options.map = this.options.map;
        options.file = this;
    };
    File.prototype._addSegment = function (options) {
        for (var seg in this.segments) {
            if (this.segments[seg].options.name === options.name) {
                this.segments[seg].line.setPath(options.path);
                return;
            }
        }
        this.segmentId++;
        this._add(options);
        options.sid = "S" + this.segmentId.toString();
        this.segments[options.sid] = new Segment(options);
        return options.sid;
    };
    File.prototype.addSegment = function (options) {
        this.segments[this._addSegment(options)].extend();
        this.setDirty(true);
    };
    File.prototype._addPlacemark = function (options) {
        this.placemarkId++;
        this._add(options);
        options.pid = "P" + this.placemarkId.toString();
        if (options.name === '')
            options.name = options.pid;
        this.placemarks[options.pid] = new Placemark(options);
        if (this.placemarks[options.pid].options.symbol === 'Waypoint') {
            this.placemarks[options.pid].marker.setVisible(this.options.map.html['dd-display'].find('.control-waypoints').is(':checked'));
        } else {
            this.placemarks[options.pid].marker.setVisible(this.options.map.html['dd-display'].find('.control-placemarks').is(':checked'));
        }
        return options.pid;
    };
    File.prototype.addPlacemark = function (options) {
        var pid = this._addPlacemark(options);
        this.placemarks[pid].marker.setVisible(true);
        this.setDirty(true);
        this._orderPlacemark(pid);
        return pid;
    };
    File.prototype.click = function (event) {
        if (this.pend) {
            switch (this.pend) {
                case 'sort':
                    this.sortPlacemarks(event);
                    this.sortSegments(event);
                    break;
                case  'placemark':
                    this.addPlacemark({
                        position: event.latLng
                    });
                    this.pendReset();
                    break;
                case 'segment' :
                    this.addSegment({
                        path: [event.latLng],
                        strokeColor: this.options.strokeColor,
                        strokeWeight: this.options.strokeWeight,
                        strokeOpacity: this.options.strokeOpacity
                    });
                    break;
            }
            this.pend = null;
        }
    };

    File.prototype.pendReset = function () {
        this.options.map.html['map'].find('.pend-info').addClass('hide');
        for (var sid in this.segments) {
            this.segments[sid].pend === '';
        }
        this.pend = null;
    };
    File.prototype.pendSegment = function () {
        if (this.pend === 'segment') {
            this.options.map.setClick();
            this.options.map.html['map'].find('.pend-info').addClass('hide');
        } else {
            this.options.map.setClick({
                sid: null,
                pid: null
            });
            this.pend = 'segment';
            this.options.map.showPend(this.options.map.googlemap.getCenter());
        }
    };
    File.prototype.pendSort = function () {
        this.options.map.setClick({
            sid: null,
            pid: null
        });
        this.pend = 'sort';
        this.options.map.showPend(this.map.googlemap.getCenter());
    };
    File.prototype.pendPlacemark = function () {
        if (this.pend === 'placemark') {
            this.options.map.setClick();
        } else {
            this.options.map.setClick({
                sid: null,
                pid: null

            });
            this.pend = 'placemark';
            this.options.map.showPend(this.options.map.googlemap.getCenter());
        }
    };
    File.prototype.placemarkVisible = function (visible) {
        for (var pid in this.placemarks) {
            var wp = this.placemarks[pid];
            if (wp.options.symbol === 'Waypoint') {
                wp.marker.setVisible(this.options.map.html['dd-display'].find('.control-waypoints').is(':checked'));
            } else {
                wp.marker.setVisible(visible);
            }
        }
    };
    File.prototype.waypointVisible = function (visible) {
        for (var pid in this.placemarks) {
            var wp = this.placemarks[pid];
            if (wp.options.symbol === 'Waypoint') {
                wp.marker.setVisible(visible);
            }
        }
    };

    File.prototype.placemarkFilter = function (item) {
        var url = $(item).attr('src');
        for (var i in this.placemarks) {
            var isVisible = this.placemarks[i].marker.getVisible();
            var visible = this.placemarks[i].marker.icon.url === url && !isVisible;
            this.placemarks[i].marker.setVisible(visible);
        }
    };
    File.prototype.flip = function () {
        for (var sid in this.segments) {
            this.segments[sid].flip();
        }
    };
    File.prototype.distance = function () {
        var distance = 0;
        for (var sid in this.segments) {
            distance += this.segments[sid].distance();
        }
        return distance;
    };
    File.prototype.removePlacemark = function (pid) {
        if (!this.removeFile) {
            delete this.placemarks[pid];
            this.placemarkList.find('.' + pid).remove();
            this.setDirty(true);
        }
    };
    File.prototype.removePlacemarks = function () {
        for (var pid in this.placemarks) {
            this.placemarks[pid].remove();
        }
    };
    File.prototype.removeSegment = function (sid) {
        if (!this.removeFile) {
            delete this.segments[sid];
            this.setDirty(true);
            this.options.map.reset();
        }
    };
    File.prototype.removeSegments = function () {
        for (var sid in this.segments) {
            this.segments[sid].remove();
        }
    };
    File.prototype.remove = function () {
        this.removeFile = true;
        this.removePlacemarks();
        this.removeSegments();
        this.options.map.removeFile();
    };
    File.prototype.getBounds = function (bounds) {
        for (var sid in this.segments) {
            this.segments[sid].getBounds(bounds);
        }
        for (var pid in this.placemarks) {
            bounds.extend(this.placemarks[pid].marker.getPosition());
        }
    };
    File.prototype.refresh = function () {
        for (var sid in this.segments) {
            this.segments[sid].refresh();
        }
    };
    File.prototype.isPlacemark = function (latlng) {
        for (var pid in this.placemarks) {
            if (this.placemarks[pid].options.position.equals(latlng))
                return pid;
        }
        return false;
    };
    File.prototype.append = function (segment) {
        var target = null;
        var path = segment.line.getPath();
        var latlng = path.getAt(path.getLength() - 1);
        var d = 0;
        for (var sid in this.segments) {
            if (sid === segment.sid) {
                continue;
            }
            var test_path = this.segments[sid].line.getPath();
            var test_latlng = test_path.getAt(0);
            var b = distanceFrom(latlng, test_latlng);
            if (target === null || d > b) {
                target = this.segments[sid];
                d = b;
            }
        }
        if (target) {
            while (path.getLength() > 0) {
                var point = path.pop();
                target.line.getPath().insertAt(0, point);
            }
            segment.remove();
            target.refresh();
        }
    };
    File.prototype.focus = function () {
        if (Object.keys(this.segments).length > 0) {
            var bounds = new google.maps.LatLngBounds();
            this.getBounds(bounds);
            this.options.map.googlemap.fitBounds(bounds);
        }
    };
    File.prototype.getXml = function () {
        if (getExtension(this.filename) === 'gpx') {
            return this.options.map.gpx.writer(this);
        } else {
            return this.options.map.kml.writer(this);
        }
    };
    File.prototype.showXml = function () {
        this.options.map.kml.kmlWindow(this.getXml());
        var newWindow = window.open('',
                'XML Export ' + (new Date()).getTime(), "width=800,height=1000");
        newWindow.document.write('<textarea id="xml" style="width: 100%; height: 100%">' + this.getXml() + '</textarea>');
    };
    File.prototype.saveAs = function (download) {
        if (typeof download === 'undefined')
            download = false;
        var data = this.getXml();
        if (data) {
            $.post(ibs_mappro.ajax, {
                action: 'ibs_mappro_savexml',
                data: encodeURIComponent(data),
                filename: this.dir + this.filename
            },
            $.proxy(function (data, status) {
                var map = this.options.map;
                spin(false);
                if (status === 'success') {
                    this.setDirty(false);
                    if (download) {
                        var data_url = decodeURIComponent(data);
                        var file_url = ibs_mappro.ajax+'?action=ibs_mappro_download&file=' + data_url;
                        //var file_url = this.options.map.siteUrl() + 'lib/download.php?file=' + data_url;
                        $.fileDownload(file_url, {
                            successCallback: $.proxy(function (url) {
                                this.options.map.notice('Save ' + this.filename + ' completed.');
                            }, this),
                            failCallback: $.proxy(function (html, url) {
                                this.options.map.alert('File download failed. ' + this.filename);
                            }, this)
                        });
                    } else {
                        this.options.map.notice('Save ' + this.filename + ' completed.');
                    }
                } else {
                    this.options.map.alert('Save ' + this.filename + ' failed.');
                }
            }, this));
        } else {
            this.options.map.alert('Error creating XML document.');
        }
    };
    File.prototype.selectPlacemark = function (item, e) {
        var has = $(item).hasClass('selected');
        this.placemarkList.find('.placemark-item-name').removeClass('selected');
        if (false === has) {
            $(item).addClass('selected');
            $(item).parent().ScrollTo({onlyIfOutside: true});
        }
    };
    File.prototype.selectSegmentCheck = function () {
        if (this.segmentList.find('.segment-item-name.selected').length > 0) {
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('enable');
            this.options.map.html['ibs-header'].find('.ibs-route').button('option', 'disabled', false);
            return true;
        } else {
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('hide');
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('disable');
            $this.options.map.html['ibs-header'].find('.ibs-route').button('option', 'disabled', true);
            return false;
        }
    };
    File.prototype.selectSegment = function (item) {
        var has = $(item).hasClass('selected');
        this.segmentList.find('.segment-item-name').removeClass('selected');
        this.segmentList.find('.ct-list-div').addClass('hide');
        if (false === has) {
            $(item).addClass('selected');
            $(item).parent().find('.ct-list-div').removeClass('hide');
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('enable');
            this.options.map.html['ibs-header'].find('.ibs-route').button('option', 'disabled', false);
            $(item).parent().ScrollTo({onlyIfOutside: true});
        } else {
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('hide');
            this.options.map.html['ibs-header'].find('.ibs-route').dropdown('disable');
            this.options.map.html['ibs-header'].find('.ibs-route').button('option', 'disabled', true);
        }
    };
})(jQuery);