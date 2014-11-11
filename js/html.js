//mappro 2.0
(function ($) {
    Map.prototype.setHtml = function () {
        $(this.options.div)
                .append($('<div>').attr('id', this.options.mid)
                        .append($('<div>').addClass('ibs-container').resizable()
                                .append($('<div>').addClass('ibs-header'))
                                .append($('<div>').addClass('ibs-main'))
                                .append($('<div>').addClass('ibs-footer'))));
        this.html['page'] = $('#' + this.options.mid);
        this.html['ibs-container'] = this.html['page'].find('.ibs-container');
        this.html['ibs-header'] = this.html['ibs-container'].find('.ibs-header');
        if (this.options.user_type !== 'admin') {
            $('#content').css('font-size', '13px')
        }
        //--------------------------------------------------------------------------
        if (this.options.mode === 'edit') {
            this.html['ibs-header']
                    .append($('<div>')
                            .append($('<button>').addClass('ibs-map').attr({title: 'map action menu', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-map'}))
                            .append($('<button>').addClass('ibs-route').attr({title: 'route action menu', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-route'}))
                            .append($('<button>').addClass('ibs-draw').attr({title: 'drawing settings', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-options'}))
                            .append($('<button>').addClass('ibs-display').attr({title: 'display settings', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-display'}))
                            .append($('<button>').addClass('ibs-settings').attr({title: 'edit settings', href: "#"}))
                            .append($('<button>').addClass('ibs-find').attr({title: 'find address', href: "#"}))
                            .append($('<button>').addClass('ibs-reset').attr({title: 'reset map', href: "#"}))
                            .append($('<a>').addClass('ibs-size size-up').attr({title: 'restore size and position', href: "#"}).text('X'))

                            );
        } else {
            this.html['ibs-header']
                    .append($('<div>')
                            .append($('<button>').addClass('ibs-map').attr({title: 'map action menu', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-map'}))
                            .append($('<button>').addClass('ibs-display').attr({title: 'display settings', href: "#", 'data-dropdown': '#' + this.options.mid + '-dropdown-display'}))
                            .append($('<a>').addClass('ibs-size size-up').attr({title: 'restore size and position', href: "#"}).text('X'))
                            );
        }
        //--------------------------------------------------------------------------
        this.html['ibs-main'] = this.html['ibs-container'].find('.ibs-main');
        this.html['ibs-footer'] = this.html['ibs-container'].find('.ibs-footer');
        this.html['ibs-main']
                .append($('<div>').addClass('list').css({'display': this.options.mode === 'edit' ? 'block' : 'none'}).resizable()
                        .append($('<div>').addClass('file-list-name list-hdr img-kml')
                                .append('<a class="list-action-edit list-filename" href="#" title="edit file attributes"></a>'))
                        .append($('<div>').addClass('import-list-name list-hdr img-upload')
                                .append('<a class="list-action-import" href="#" title="imported maps files">Imported maps</a>'))
                        .append($('<div>').addClass('import-list-div hide').resizable({containment: "parent"})
                                .append($('<ul>').addClass('import-list')))
                        .append($('<div>').addClass('placemark-list-name list-hdr img-marker')
                                .append('<a class="list-action-placemark" href="#" title="add new placemarker">Marker</a>'))
                        .append($('<div>').addClass('placemark-list-div').resizable({containment: "parent"})
                                .append($('<ul>').addClass("placemark-list controls")))
                        .append($('<div>').addClass('segment-list-name list-hdr img-line')
                                .append('<a class="list-action-route" href="#" title="start new route">Route</a>'))
                        .append($('<div>').addClass('segment-list-div').resizable({containment: "parent"})
                                .append($('<ul>').addClass("segment-list controls")))
                        )
                .append($('<div>').addClass('app')
                        .append($('<div>').addClass('map')
                                .append($('<div>').addClass('map-div')))
                        .append($('<div>').addClass('data')));
        this.html['list'] = $(this.html['ibs-main']).find('.list');
        this.html['app'] = $(this.html['ibs-main']).find('.app');
        this.html['map'] = $(this.html['app']).find('.map');
        this.html['map-div'] = $(this.html['map']).find('.map-div');
        this.html['data'] = $(this.html['app']).find('.data');

        $(this.html['data'])
                .append($('<span>').addClass('box-span')
                        .append($('<span>').addClass('data-segment'))
                        .append($('<span>').addClass('data-distance'))
                        .append($('<span>').addClass('data-gain'))
                        .append($('<img>').addClass('chart-close').css('float', 'right').attr('src', this.siteUrl() + 'image/minus.png')))
                .append($('<div>').addClass('data-chart'));
        this.html['data-chart'] = $(this.html['data']).find('.data-chart');
        this.html['map']
                .append($('<div>').addClass('distance-info hide'))
                .append($('<div>').addClass('pend-info hide'));
        this.html['ibs-footer']
                .append($('<div>').addClass('ibs-message'));
        this.setDialogs();
        if (this.options.mode === 'edit') {
            $(document).find('body')
                    .append(
                            '<div id="' + this.options.mid + '-dropdown-map" class="dropdown dropdown-tip has-icons">' //map
                            + '<ul class="dropdown-menu dropdown-list">'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-browse"><a class="map-action-browse user-hide"  href="#">Browse server</a></li>'
                            + '<li class="img-save"><a class="map-action-save user-hide" href="#">Save to server</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-upload"><a class="map-action-upload"  href="#">Desktop upload</a></li>'
                            + '<li class="img-download"><a class="map-action-download" href="#">Desktop download</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-web"><a class="map-action-web"  href="#">Web import</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-document"><a class="map-action-show" href="#">Show xml</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-focus"><a class="map-action-focus" href="#">Focus map</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-edit"><a class="map-action-edit" href="#">Edit map info</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-delete"><a class="map-action-clear"  href="#">Clear</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-sort"><a class="map-action-sort"  href="#">Sort placemarkers</a></li>'
                            + '<li class="img-flip"><a class="map-action-flip" href="#">Reverse travel direction</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '</ul>'
                            + '</div>'
                            + '<div id="' + this.options.mid + '-dropdown-route" class="dropdown dropdown-tip has-icons">' //route
                            + '<ul class="dropdown-menu dropdown-list">'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-extend"><a class="route-action-extend" href="#">Extend route</a></li>'
                            + '<li class="img-undo"><a class="route-action-undo" href="#">Undo</a></li>'
                            + '<li class="img-refresh"><a class="route-action-rebuild" href="#">Rebuild</a></li>'
                            + '<li class="img-focus"><a class="route-action-focus" href="#">Focus</a></li>'
                            + '<li class="img-cue"><a class="route-action-cue" href="#">Google directions</a></li>'
                            + '<li class="img-cue"><a class="route-action-profile" href="#">Elevation profile</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-edit"><a class="route-action-edit" href="#">Edit</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-delete"><a class="route-action-remove" href="#">Remove</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li class="img-append"><a class="route-action-append" href="#">Append to next line</a></li>'
                            + '<li class="img-line-edit"><a class="route-action-ledit" href="#">Line edit</a></li>'
                            + '<li class="img-flip"><a class="route-action-flip" href="#">Reverse direction</a></li>'
                            + '<li class="img-thin"><a class="route-action-thin" href="#">Minimize points</a></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '</ul>'
                            + '</div>'
                            + '<div id="' + this.options.mid + '-dropdown-display" class="dropdown dropdown-tip">' //display
                            + '<ul class="dropdown-menu">'
                            + '<li class="dropdown-divider"></li>'
                            + '<li><label><input class="control-distance-flag" type="checkbox" /> Distance flag</label></li>'
                            + '<li><label><input class="control-bike-layer" type="checkbox" /> Bike layer</label></li>'
                            + '<li><label><input class="control-placemarks" type="checkbox" /> Show placemarks</label></li>'
                            + '<li><label><input class="control-waypoints" type="checkbox" /> Show waypoints</label></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '</ul>'
                            + '</div>'
                            + '<div id="' + this.options.mid + '-dropdown-options" class="dropdown dropdown-tip">' //draw
                            + '<ul class="dropdown-menu">'
                            + '<li class="dropdown-divider"></li>'
                            + '<li><label><input class="control-followroad" type="checkbox"  /> Follow road</label></li>'
                            + '<li><label><input class="control-avoidhighways" type="checkbox"  /> Avoid highways</label></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '<li><label><input class="control-rb-drive" type="radio" name="travelmode" value="DRIVING" /> Driving</label></li>'
                            + '<li><label><input class="control-rb-bike" type="radio" name="travelmode" value="BICYCLING"/> Bicycling </label></li>'
                            + '<li><label><input class="control-rb-walk" type="radio" name="travelmode" value="WALKING"/> Walking</label></li>'
                            + '<li class="dropdown-divider"></li>'
                            + '</ul>'
                            + '</div>');
            this.html['dd-route'] = $('#' + this.options.mid + '-dropdown-route');
            this.html['dd-map'] = $('#' + this.options.mid + '-dropdown-map');
            this.html['dd-options'] = $('#' + this.options.mid + '-dropdown-options');
            this.html['dd-display'] = $('#' + this.options.mid + '-dropdown-display');

            this.html['dd-options'].find('.control-followroad').prop('checked', this.options.followroad);
            this.html['dd-options'].find('.control-avoidhighways').prop('checked', this.options.avoidhighways);
            this.html['dd-options'].find('.control-rb-drive').prop('checked', this.options.travelmode === 'DRIVING');
            this.html['dd-options'].find('.control-rb-bike').prop('checked', this.options.travelmode === 'BICYCLING');
            this.html['dd-options'].find('.control-rb-walk').prop('checked', this.options.travelmode === 'WALKING');

        } else {
            if (this.options.url === '') {
                $(document).find('body')
                        .append(
                                '<div id="' + this.options.mid + '-dropdown-map" class="dropdown dropdown-tip has-icons">' //map
                                + '<ul class="dropdown-menu dropdown-list">'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-browse"><a class="map-action-browse"  href="#">Browse</a></li>'
                                + '<li class="img-upload"><a class="map-action-upload"  href="#">Upload</a></li>'
                                + '<li class="img-download"><a class="map-action-download" href="#">Download</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-web"><a class="map-action-web"  href="#">Web import</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-document"><a class="map-action-show" href="#">Show xml</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-focus"><a class="map-action-focus" href="#">Focus map</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-edit"><a class="map-action-edit" href="#">Statistics</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-delete"><a class="map-action-clear"  href="#">Clear</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '</ul>'
                                + '</div>'
                                + '<div id="' + this.options.mid + '-dropdown-display" class="dropdown dropdown-tip">' //display
                                + '<ul class="dropdown-menu">'
                                + '<li class="dropdown-divider"></li>'
                                + '<li><label><input class="control-distance-flag" type="checkbox" /> Distance flag</label></li>'
                                + '<li><label><input class="control-bike-layer" type="checkbox" /> Bike layer</label></li>'
                                + '<li><label><input class="control-placemarks" type="checkbox" /> Show placemarks</label></li>'
                                + '<li><label><input class="control-waypoints" type="checkbox" /> Show waypoints</label></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '</ul>'
                                + '</div>');
            } else {
                $(document).find('body')
                        .append(
                                '<div id="' + this.options.mid + '-dropdown-map" class="dropdown dropdown-tip has-icons">' //map
                                + '<ul class="dropdown-menu dropdown-list">'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-download"><a class="map-action-download" href="#">Download</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-document"><a class="map-action-show" href="#">Show xml</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-focus"><a class="map-action-focus" href="#">Focus map</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '<li class="img-edit"><a class="map-action-edit" href="#">Statistics</a></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '</ul>'
                                + '</div>'
                                + '<div id="' + this.options.mid + '-dropdown-display" class="dropdown dropdown-tip">' //display
                                + '<ul class="dropdown-menu">'
                                + '<li class="dropdown-divider"></li>'
                                + '<li><label><input class="control-distance-flag" type="checkbox" /> Distance flag</label></li>'
                                + '<li><label><input class="control-bike-layer" type="checkbox" /> Bike layer</label></li>'
                                + '<li><label><input class="control-placemarks" type="checkbox" /> Show placemarks</label></li>'
                                + '<li><label><input class="control-waypoints" type="checkbox" /> Show waypoints</label></li>'
                                + '<li class="dropdown-divider"></li>'
                                + '</ul>'
                                + '</div>');
            }
            this.html['dd-map'] = $('#' + this.options.mid + '-dropdown-map');
            this.html['dd-display'] = $('#' + this.options.mid + '-dropdown-display');
        }
        this.getIconOptions(this.html['placemark-dialog'].find('.placemark-dialog-select'));
        this.html['file-dialog'].find('.file-dialog-color-select').colorpicker({
            size: 20,
            label: 'Color ',
            hide: true
        });
        this.html['segment-dialog'].find('.segment-dialog-color-select').colorpicker({
            size: 20,
            label: 'Color ',
            hide: true
        });
        this.html['dialogs'].find('.cp-cancel').attr('src', this.siteUrl() + '/image/cancel.png');
        this.html['cuesheet-dialog'].find('input[name=cue_source][value=' + this.options.cuesheet_source + ']').attr('checked', true);
        $(this.html['file-dialog']).find('.reset-lines').button({
            text: true,
            label: 'Set Lines',
            icons: {
                primary: 'ui-icon-arrowreturnthick-1-e'
            }
        });
        this.uploader = this.html['upload-dialog'].find('.upload-button').fineUploader({
            listElement: this.html['upload-dialog'].find('.upload-list'),
            request: {
                endpoint: this.siteUrl() + 'js/jquery.fineuploader/server/endpoint.php',
                params: {'dir': this.siteRoot() + 'maps/upload/'}

            },
            debug: false
        });

        this.html['ibs-header'].find('.ibs-reset').button({
            text: true,
            label: 'Reset',
            icons: {
                primary: 'ui-icon-stop'
            }
        });
        this.html['ibs-header'].find('.ibs-find').button({
            text: true,
            label: 'Find address',
            icons: {
                primary: 'ui-icon-search'
            }
        });
        this.html['ibs-header'].find('.ibs-map').button({
            text: true,
            label: 'Map tools',
            icons: {
                secondary: ' ui-icon-triangle-1-s'
            }
        });
        this.html['ibs-header'].find('.ibs-route').button({
            text: true,
            label: 'Route tools',
            icons: {
                secondary: ' ui-icon-triangle-1-s'
            }
        });
        this.html['ibs-header'].find('.ibs-display').button({
            text: true,
            label: 'Display options',
            icons: {
                secondary: ' ui-icon-triangle-1-s'
            }
        });
        this.html['ibs-header'].find('.ibs-draw').button({
            text: true,
            label: 'Route options',
            icons: {
                secondary: ' ui-icon-triangle-1-s'
            }
        });
        if (this.options.user_type !== 'admin' ) {
            this.html['ibs-header'].find('.ui-button').css('font-size', '10px');
        }
        if (this.options.user_type !== 'admin') {
            this.html['dd-map'].find('.user-hide').hide();
        }
        this.html['ibs-header'].find('.ibs-route').button('option', 'disabled', true);
        this.html['ibs-container'].css({'width': this.options.width, 'height': this.options.height});
        this.uploadCount = 0;
        this.setHandlers();
        this.sizeHtml();
        $('.colorpicker-trigger').attr({'title': 'click to change color'});
    };
    File.prototype.openInfo = function (obj) {
        var info = '';
        if (typeof obj.options.sid === 'undefined') {
            var rel = obj.options.pid;
        } else {
            rel = obj.options.sid;
        }
        if (this.options.map.options.mode === 'edit') {
            info = $('<div>').addClass('info-node')
                    .append($('<div>')
                            .append($('<div>').addClass('info-name')
                                    .append($('<span>').text(obj.options.name)))
                            .append($('<div>').addClass('info-desc').html(obj.options.desc)))
                    .append($('<div>').addClass('info-footer')
                            .append($('<a>').text('edit').attr({'rel': rel, 'action': 'edit'}))
                            .append($('<a>').text('remove').attr({'rel': rel, 'action': 'remove'}))
                            .append($('<a>').text('close').attr({'rel': rel, 'action': 'close'})));
        } else {
            if (typeof obj.options.sid === 'undefined') {
                info = $('<div>').addClass('info-node')
                        .append($('<div>')
                                .append($('<div>').addClass('info-name')
                                        .append($('<span>').text(obj.options.name)))
                                .append($('<div>').addClass('info-desc').html(obj.options.desc)))
                        .append($('<div>').addClass('info-footer')
                                .append($('<a>').text('more').attr({'rel': rel, 'action': 'show'}))
                                .append($('<a>').text('close').attr({'rel': rel, 'action': 'close'})));
            } else {
                info = $('<div>').addClass('info-node')
                        .append($('<div>')
                                .append($('<div>').addClass('info-name')
                                        .append($('<span>').text(obj.options.name)))
                                .append($('<div>').addClass('info-desc').html(' miles=' + this.options.map.convertMeters2(obj.distance()).toString())))
                        .append($('<div>').addClass('info-footer')
                                .append($('<a>').text('more').attr({'rel': rel, 'action': 'show'}))
                                .append($('<a>').text('profile').attr({'rel': rel, 'action': 'elevation'}))
                                .append($('<a>').text('close').attr({'rel': rel, 'action': 'close'})));
            }

        }
        this.options.map.infowindow.setContent(info[0]);
        this.options.map.infowindow.open(this.options.map.googlemap, obj.marker);
    };
    Segment.prototype.setSegmentItem = function () {
        var rel = this.options.sid;
        this.segmentList
                .append($('<li>').addClass("segment-item").attr({'rel': rel})
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
    Placemark.prototype.setPlacemarkItem = function () {
        var rel = this.options.pid;
        var item = $('<li>').addClass('placemark-item ' + rel)
                .append($('<div>').addClass("ct-list-div")
                        .append($('<img>').addClass("placemark-item-image").css({height: '20px'}).attr({'rel': rel, 'alt': "image", 'src': this.marker.icon.url})))
                .append($('<a>').addClass(this.options.map.options.mid + ' placemark-item-name name').attr({'rel': rel, 'href': "#", 'title': ""}).text(this.options.name));
        $(this.placemarkList).append($(item));
    };
})(jQuery);