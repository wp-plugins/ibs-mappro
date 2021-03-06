(function ($)
{
    Map.prototype.setLineAttr = function (selectId) {
        return $('<span>').addClass('view-hide')
                .append($('<div>').addClass('section-header').html('Line Attributes'))
                .append($('<div>').addClass('line-attr')
                        .append($('<span>').addClass('line-attr-span').html('Opacity'))
                        .append($('<input>').attr({'type': 'text', 'value': '.5', 'max': '1.0', 'min': '0.1', 'step': '0.1'}).addClass('opacity-val'))
                        .append($('<span>').addClass('line-attr-span').html('Width'))
                        .append($('<input>').attr({'type': 'text', 'value': '2', 'max': '15', 'min': '1', 'step': '1'}).addClass('width-val'))
                        .append($('<select>').addClass(selectId)));
    };
    Map.prototype.setFileExtension = function () {
        return $('<span>').addClass('view-hide')
                .append($('<span>')
                        .append($('<div>').addClass('section-header').html('File type'))
                        .append($('<div>').addClass('kmlkmzgpx')
                                .append($('<span>').html('*.kml')
                                        .append($('<input>').addClass('file-kml').attr({'type': 'radio', 'value': 'kml', 'name': 'file_ext'})))
                                .append($('<span>').html('*.kmz')
                                        .append($('<input>').addClass('file-kmz').attr({'type': 'radio', 'value': 'kmz', 'name': 'file_ext'})))
                                .append($('<span>').html('*.gpx')
                                        .append($('<input>').addClass('file-gpx').attr({'type': 'radio', 'value': 'gpx', 'name': "file_ext"})))))
                .append($('<span>').addClass('file-ext-span')
                        .append($('<div>').addClass('section-header').text('GPX content settings'))
                        .append($('<div>').addClass('box-div')
                                .append($('<span>').text('Tracks')
                                        .append($('<input>').addClass('gpx_tracks').attr({type: "checkbox", title: "output tracks "})))
                                .append($('<span>').text('Routes')
                                        .append($('<input>').addClass('gpx_routes').attr({type: "checkbox", title: "output routes "})))
                                .append($('<span>').text('Waypoints')
                                        .append($('<input>').addClass('gpx_waypoints').attr({type: "checkbox", title: "output waypoints"})))
                                .append($('<span>').text('Placemarks')
                                        .append($('<input>').addClass('gpx_waypoints').attr({type: "checkbox", title: "output placemarks"})))
                                )
                        )
    };
    Map.prototype.setDialogs = function () {
        //----------------------------------------------------------------------
        //placemark dialog
        //----------------------------------------------------------------------
        this.html['dialogs'] = this.html['ibs-container'].append($('<div>'));
        this.html['dialogs']
                .append($('<div>').addClass('placemark-dialog hide dialog-map').attr({'title': 'Placemark'})
                        .append($('<div>').addClass('info-div edit-hdr-div')
                                .append(($('<span>')
                                        .append($('<div>').addClass('section-header').html('Name')))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append(($('<input>').addClass('placemark-dialog-name view-disable').attr({'type': 'text', 'size': 32, 'value': ''})))))
                                .append($('<span>')
                                        .append($('<span>').addClass('kmlkmzgpx')
                                                .append($('<div class="placemark-selected-div">')
                                                        .append($('<img>').addClass('placemark-selected-icon').attr({'src': '', 'height': '32', 'width': '32', 'title': 'current icon'}).css('vertical-align', 'middle'))
                                                        .append($('<span style="font-weight:bold; margin-left:10px">').text('Current Icon')))
                                                .append($('<div>').addClass('placemark-select-div view-hide ')
                                                        .append($('<ul>').addClass('placemark-dialog-select'))))))
                        .append($('<div>').addClass('edit-ck-div')
                                .append($('<textarea>').addClass('placemark-dialog-desc view-hide').attr({'rows': 5, 'cols': 32})))
                        .append($('<input>').addClass('placemark-dialog-pid').attr({'type': 'hidden', 'value': ''})));
        this.html['placemark-dialog'] = this.html['dialogs'].find('.placemark-dialog');
        //----------------------------------------------------------------------
        //waypoint dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('waypoint-dialog hide').attr({'title': 'Waypoint'})
                        .append($('<div>').addClass('box-div')
                                .append($('<input>').addClass('waypoint-dialog-name view-disable').attr({'type': 'text', 'size': '32', 'value': ''})))
                        .append($('<div>').addClass('edit-ck-div')
                                .append($('<textarea>').addClass('waypoint-dialog-desc view-hide').css({'margin-top': '25px'}).attr({'rows': '5', 'cols': '32'})))
                        .append($('<input>').addClass('placemark-dialog-pid').attr({'type': 'hidden', 'value': ''})));
        this.html['waypoint-dialog'] = this.html['dialogs'].find('.waypoint-dialog');
        //----------------------------------------------------------------------
        //placemark show
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('placemark-show hide dialog-map').attr('title', 'Segment')
                        .append($('<div>').addClass('info-div edit-hdr-div')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Name'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('placemark-dialog-name').attr({'type': 'text', 'value': ''}))))
                                )
                        .append($('<div>').addClass('edit-ck-div')
                                .append($('<div>').addClass('placemark-dialog-desc')))
                        .append($('<input>').addClass('placemark-dialog-pid').attr({'type': 'hidden', 'value': '0'})));
        this.html['placemark-show'] = this.html['dialogs'].find('.placemark-show');

        //----------------------------------------------------------------------
        //segment dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('segment-dialog hide dialog-map').attr('title', 'Segment')
                        .append($('<div>').addClass('info-div edit-hdr-div')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Name'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('segment-dialog-name view-disable').attr({'type': 'text', 'value': ''}))))

                                .append(this.setLineAttr('segment-dialog-color-select'))

                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Statistics'))
                                        .append($('<span>').addClass('segment-dialog-stats'))))

                        .append($('<div>').addClass('edit-ck-div')
                                .append($('<textarea>').addClass('segment-dialog-desc view-hide').attr({'rows': '2', 'cols': '50'})))
                        .append($('<input>').addClass('segment-dialog-sid').attr({'type': 'hidden', 'value': '0'})));
        this.html['segment-dialog'] = this.html['dialogs'].find('.segment-dialog');
        //----------------------------------------------------------------------
        //segment show
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('segment-show hide dialog-map').attr('title', 'Segment')
                        .append($('<div>').addClass('info-div edit-hdr-div')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Name'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('segment-dialog-name view-disable').attr({'type': 'text', 'value': ''}))))
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Statistics'))
                                        .append($('<span>').addClass('segment-dialog-stats'))))
                        .append($('<div>').addClass('edit-ck-div')
                                .append($('<div>').addClass('segment-dialog-desc view-hide')))
                        .append($('<input>').addClass('segment-dialog-sid').attr({'type': 'hidden', 'value': '0'})));
        this.html['segment-show'] = this.html['dialogs'].find('.segment-show');
        //----------------------------------------------------------------------
        //find dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('find-dialog hide dialog-map').attr({'title': 'Find Address'})
                        .append($('<div>').addClass('ibs-find-box file-list-box')
                                .append($('<input>').addClass('find-words').attr({'type': 'text', 'name': 'words', 'size': '50', 'value': ''})))
                        .append($('<div>').addClass('find-div file-list-div')
                                .append($('<ul>').addClass('find-list file-list'))));
        this.html['find-dialog'] = this.html['dialogs'].find('.find-dialog');
        //----------------------------------------------------------------------
        //save dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('save-dialog hide dialog-map').attr({'title': 'Save File'}).addClass('')
                        .append($('<div>').addClass('file-save-box').addClass('edit-hdr-div')
                                .append($('<span>').addClass('mapfolder-span')
                                        .append($('<div>').addClass('section-header').html(' Map Folders '))
                                        .append($('<div>').addClass('mapfolder-div'))
                                        .append($('<div>').addClass('mapfolder-browser JQueryFTD')))
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Save As'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<span>').html('Folder')
                                                        .append($('<input>').addClass('save-dir').attr({'type': 'text', 'size': '20', 'value': ''})))
                                                .append($('<span>').html('Name')
                                                        .append($('<input>').addClass('save-name').attr({'type': 'text', 'size': '20', 'value': ''})))
                                                .append($('<span>').html('Download').addClass('hide')
                                                        .append($('<input>').addClass('save-download').attr({'type': "checkbox"})))))
                                .append(this.setFileExtension())
                                )
                        .append($('<div>').addClass('edit-ck-div').css('width', '100%')
                                .append($('<textarea>').addClass('save-desc').attr({'rows': '10', 'cols': '50'}))
                                ));
        this.html['save-dialog'] = this.html['dialogs'].find('.save-dialog');
        //----------------------------------------------------------------------
        //file dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('file-dialog hide dialog-map').attr({'title': 'Map settings'})
                        .append($('<div>').addClass('info-div file-box edit-hdr-div')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('File Name'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('file-name view-disable').css('margin', '5px').attr({'type': 'text', 'size': '30', 'value': ''})))
                                        .append(this.setFileExtension()))
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Statistics'))
                                        .append($('<ul>').addClass('file-list ct-help-list')))

                                .append(this.setLineAttr('file-dialog-color-select')))

                        .append($('<div>').addClass('edit-ck-div').css('width', '100%')
                                .append($('<textarea>').addClass('file-desc view-hide').attr({'rows': '3', 'cols': '50'}))
                                ));
        this.html['file-dialog'] = this.html['dialogs'].find('.file-dialog');

        this.html['file-dialog'].find('.line-attr')
                .append($('<div>').css('float', 'right')
                        .append($('<button>').addClass('reset-lines').attr({'title': 'reset all lines to these attributes'}).text('Reset lines').css({'margin-left': '15px'})));
        //----------------------------------------------------------------------
        //file show
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('file-show hide dialog-map').attr({'title': 'Map settings'})
                        .append($('<div>').addClass('info-div file-box edit-hdr-div')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('File Name'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('file-name').css('margin', '5px').attr({'type': 'text', 'size': '30', 'value': ''})))
                                        )
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Statistics'))
                                        .append($('<ul>').addClass('file-list ct-help-list')))
                                )

                        .append($('<div>').addClass('edit-ck-div').css('width', '100%')
                                .append($('<div>').addClass('file-desc view-hide').attr({'rows': '3', 'cols': '50'}))
                                ));
        this.html['file-show'] = this.html['dialogs'].find('.file-show');

        //----------------------------------------------------------------------
        //cuesheet dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('cuesheet-dialog hide dialog-map').attr({'title': 'Cuesheet'})
                        .append($('<textarea>').addClass('cuesheet').attr({'rows': '50', 'cols': '70'})));
        this.html['cuesheet-dialog'] = this.html['dialogs'].find('.cuesheet-dialog');
        //----------------------------------------------------------------------
        //browse dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('browse-dialog hide dialog-map').attr('title', 'Browse maps')
                        .append($('<div>')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Map Folders'))
                                        .append($('<div>').addClass('map-browser-div')
                                                .append($('<div>').addClass('map-browser JQueryFTD'))))));

        this.html['browse-dialog'] = this.html['dialogs'].find('.browse-dialog');
        //----------------------------------------------------------------------
        //upload dialog
        //----------------------------------------------------------------------
        this.html['dialogs']
                .append($('<div>').addClass('upload-dialog hide dialog-map').attr('title', 'Upload maps')
                        .append($('<div>').addClass('upload-browser admin'))
                        .append($('<div>').addClass('admin')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Target'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').attr({type: "text", size: "75", value: "/"}).addClass("upload-target-directory")))))
                        .append($('<div>')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').css({'font-size': '.9em', 'padding-left': '5px'}).html('status'))
                                        .append($('<div>').addClass('map-upload-div file-list-div').css('height', '100px')
                                                .append($('<ul>').addClass('upload-list file-list'))))
                                .append($('<div>').css('display', 'none')
                                        .append($('<div>').addClass('upload-button').html('Browse')))));

        this.html['upload-dialog'] = this.html['dialogs'].find('.upload-dialog');
        //url dialog
        this.html['dialogs']
                .append($('<div>').addClass('web-dialog hide dialog-map').attr('title', 'Open map')
                        .append($('<div>')
                                .append($('<span>')
                                        .append($('<div>').addClass('section-header').html('Map URL to load'))
                                        .append($('<div>').addClass('kmlkmzgpx')
                                                .append($('<input>').addClass('map-web-url').attr({'type': 'text', 'title': 'enter url to load from the web', 'size': '50'}))))))

        this.html['web-dialog'] = this.html['dialogs'].find('.web-dialog');


        //----------------------------------------------------------------------
        // map context menus
        //----------------------------------------------------------------------
        this.html['map']
                .append($('<div>').addClass('segment-cm-line context-menu hide')
                        .append($('<ul>').addClass('cm-list')
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-line-action').attr({'href': '#', 'rel': 'split', 'title': 'split line here'}).html('Split')))
                                .append($('<li>').addClass('img_placemark')
                                        .append($('<a>').addClass('cm-line-action').attr({'href': '#', 'rel': 'waypoint', 'title': 'add waypoint'}).html('Waypoint')))
                                .append($('<li>').addClass('img_line-edit')
                                        .append($('<a>').addClass('cm-line-action').attr({'href': '#', rel: 'line-edit', title: 'segment line editing'}).html('Line-edit')))
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-line-action').attr({'href': '#', 'rel': 'close'}).html('Close')))));
        this.html['segment-cm-line'] = this.html['map'].find('.segment-cm-line');
        //----------------------------------------------------------------------
        //
        //----------------------------------------------------------------------
        this.html['map']
                .append($('<div>').addClass('segment-cm-edit context-menu hide')
                        .append($('<ul>').addClass('cm-list')
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-edit-action').attr({'href': '#', 'rel': 'clear'}).html('Clear')))
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-edit-action').attr({'href': '#', 'rel': 'delete'}).html('Delete point')))
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-edit-action').attr({'href': '#', 'rel': 'split'}).html('Split')))
                                .append($('<li>')
                                        .append($('<hr/>')))
                                .append($('<li>')
                                        .append($('<a>').addClass('cm-edit-action').attr({'href': '#', 'rel': 'close'}).html('Close')))));
        this.html['segment-cm-edit'] = this.html['map'].find('.segment-cm-edit');
        //----------------------------------------------------------------------
        //
        //----------------------------------------------------------------------
        this.html['map']
                .append($('<div style="width:200px;">').addClass('placemark-cm-info context-menu hide')
                        .append($('<div>').addClass('placemark-cm-name'))
                        .append($('<div>').addClass('placemark-cm-desc')));
        this.html['placemark-cm-info'] = this.html['map'].find('.placemark-cm-info');
        //----------------------------------------------------------------------
        //
        //----------------------------------------------------------------------
        this.html['map']
                .append($('<div>').addClass('distance-info hide'));
        this.html['distance-info'] = this.html['map'].find('.distance-info');
    };


    Map.prototype.findDialog = function () {
        var dialog = this.html['find-dialog'];
        dialog.dialog({
            autoOpen: true,
            modal: false,
            width: 'auto',
            buttons: {
                Find: $.proxy(function () {
                    this.findLocation();
                }, this),
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: $.proxy(function () {
                dialog.dialog('destroy');
            }, this)
        });
    };
    Map.prototype.browseDialog = function () {
        var dialog = this.html['browse-dialog'];
        var path = '';
        dialog.dialog({
            autoOpen: true,
            width: 600,
            modal: true,
            buttons: {
                Select: $.proxy(function () {
                    var files = ''
                    dialog.find('a.selected').each(function () {
                        path = $(this).attr('rel');
                        files += $(this).text() + ';';
                    })
                    if (files !== '') {
                        path = path.replace(ibs_mappro.maps_path, ibs_mappro.maps_url);
                        var uriinfo = purl(path);
                        var path = uriinfo.data.attr.base + uriinfo.data.attr.directory;
                        files = path + files.slice(0, files.length - 1);
                        this.file.importFile(files);
                    }
                    dialog.dialog('close');
                },this),
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: $.proxy(function () {
                var dir = this.isGuest() ? ibs_mappro.maps_path + "share/" : ibs_mappro.maps_path;
                dialog.find('.map-browser').fileTree({
                    root: dir,
                    script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=map',
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, $.proxy(function (file) {
                    //path = file.replace(ibs_mappro.maps_path, ibs_mappro.maps_url);
                    //this.file.importFile(map);
                    //dialog.dialog('close');
                }, this),
                        function (dir) {
                            //
                        }
                );
            }, this)
        });
    };
    Map.prototype.uploadDialog = function () {
        var dialog = this.html['upload-dialog'];
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Select Files': $.proxy(function () {
                    var a = this.html['upload-dialog'].find('.upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input')
                    c.trigger('click');
                }, this),
                Clear: function () {
                    dialog.find('.upload-list').empty();
                },
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: $.proxy(function () {
                var initdir = ibs_mappro.maps_path + 'upload/';
                dialog.find('.upload-target-directory').val('upload/');
                this.uploader.fineUploader('setParams', {'dir': initdir});
                if (this.isAdmin()) {
                    dialog.find('.admin').removeClass('hide');
                    dialog.find('.upload-browser').fileTree({
                        root: ibs_mappro.maps_path,
                        script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=dir',
                        folderEvent: 'click',
                        expandSpeed: 1000,
                        collapseSpeed: 1000,
                        multiFolder: false
                    }, function (file) {
                        alert(file);
                    }, $.proxy(function (dir) {
                        dialog.find('.upload-target-directory').val(dir);
                        dialog.find('.upload-target-directory').trigger('change');
                    }, this)
                            );
                } else {
                    dialog.find('.admin').addClass('hide');
                    var a = dialog.find('.upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input')
                    c.trigger('click');
                }
            }, this)
        });
    };
    Map.prototype.webDialog = function () {
        var dialog = this.html['web-dialog'];
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                Open: $.proxy(function () {
                    var url = this.html['web-dialog'].find('.map-web-url').val();
                    if (url && isUrl(url)) {
                        dialog.dialog('close');
                        this.file.importFile(url);
                    } else {
                        this.alert('invalid URL.');
                    }

                }, this),
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: $.proxy(function () {
            }, this)
        });
    };

    File.prototype.getOptions = function (dialog) {
        switch (getExtension(this.filename)) {
            case 'kmz':
                dialog.find('.file-kmz').attr('checked', true);
                break;
            case 'gpx':
                dialog.find('.file-gpx').attr('checked', true);
                break;
            default:
                dialog.find('.file-kml').attr('checked', true);
        }
        dialog.find('.gpx_routes').attr('checked', this.options.gpx_routes);
        dialog.find('.gpx_tracks').attr('checked', this.options.gpx_tracks);
        dialog.find('.gpx_waypoints').attr('checked', this.options.gpx_waypoints);
        dialog.find('.gpx_placemarks').attr('checked', this.options.gpx_placemarks);
    }
    File.prototype.setOptions = function (dialog) {
        this.options.gpx_routes = dialog.find('.gpx_routes').is(':checked');
        this.options.gpx_tracks = dialog.find('.gpx_tracks').is(':checked');
        this.options.gpx_waypoints = dialog.find('.gpx_waypoints').is(':checked');
        this.options.gpx_placemarks = dialog.find('.gpx_placemarks').is(':checked');
    }
    File.prototype.saveDialog = function () {
        var map = this.options.map;
        var dialog = map.html['save-dialog'];
        var config = map.getCkeditorConfig();
        this.getOptions(dialog);
        dialog.find('.save-name').val(this.filename);
        dialog.find('.save-dir').val(map.getUserFolder());
        dialog.find('.save-desc').val(this.desc);
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: 'auto',
            buttons: {
                Save: $.proxy(function () {
                    if (this.checkMapname(dialog.find('.save-name').val())) {
                        this.options.desc = dialog.find('.save-desc').val();
                        this.dir = dialog.find('.save-dir').val();
                        this.dir = map.isGuest() ? 'share/' + this.dir : this.dir
                        this.filename = dialog.find('.save-name').val();
                        if (false === getExtension(this.filename)) {

                        }
                        map.html['list'].find('a.file-list-name').text(this.filename);
                        this.setOptions(dialog);
                        dialog.dialog('close');
                        this.saveAs(false);
                    } else {
                        alert('invalid filename.\n Only "A-Z a-z 0-9 _ - space" characters are allowed\n 3 - 50 characters long.');
                    }

                }, this),
                Cancel: function () {
                    $(this).dialog('close');
                }
            },
            open: function () {
                dialog.find('.mapfolder-browser').fileTree({
                    root: ibs_mappro.maps_path,
                    script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=dir',
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                    alert(file);
                }, function (dir) {
                    var arr = dir.split('/maps/');
                    dialog.find('.save-dir').val(arr[1]);
                    dialog.find('.save-dir').trigger('change');
                });
                dialog.find('.save-desc').ckeditor(config);
                dialog.find('.save-desc').ckeditor().resize('100%', '100%', false);
            },
            close: function () {
                dialog.find('.save-desc').ckeditorGet().destroy();
                $(this).dialog('destroy');
            },
            resize: function (ev) {
                dialog.find('.save-desc').ckeditor().resize('100%', '100%', false);
            }
        });
    };
    File.prototype.fileDialog = function () {
        var dialog = this.options.map.html['file-dialog'];
        this.getOptions(dialog);
        this.options.map.stats(dialog.find('.file-list'), this.distance(), Object.keys(this.segments).length, Object.keys(this.placemarks).length);
        dialog.find('.file-name').val(this.filename);
        dialog.find('.file-desc').val(this.desc);
        dialog.find('.colorpicker-trigger').css('background-color', this.options.strokeColor);
        dialog.find('.colorpicker-trigger').css('opacity', parseFloat(this.options.strokeOpacity).toFixed(1));
        dialog.find('.colorpicker-trigger').css('height', this.options.strokeWeight + 'px');
        var pad = parseInt((30 - this.options.strokeWeight) / 2);
        dialog.find('.colorpicker-trigger').css('margin-top', pad + 'px');
        dialog.find('.opacity-val').val(parseFloat(this.options.strokeOpacity).toFixed(1));
        dialog.find('.width-val').val(parseInt(this.options.strokeWeight));
        var config = this.options.map.getCkeditorConfig()
        setCurrentColor(dialog);
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: 'auto',
            buttons: {
                Update: $.proxy(function () {
                    if (this.checkMapname(dialog.find('.file-name').val())) {
                        var obj = dialog.find('.colorpicker-trigger');
                        var color = rgb2hex($(obj).css('background-color'));
                        var opacity = parseFloat($(obj).css('opacity')).toFixed(3);
                        var width = parseInt($(obj).css('height').replace(/px/, ''));
                        this.setOptions(dialog)
                        this.options.strokeColor = color;//rgb2hex(dialog.find('.colorpicker-trigger').css('background-color'));
                        this.options.strokeOpacity = opacity;//parseFloat(dialog.find('.colorpicker-trigger').css('opacity')).toFixed(2);
                        this.options.strokeWeight = width;//parseInt(dialog.find('.colorpicker-trigger').css('height').replace(/px/, ''));
                        this.setDirty(this.dirty || dialog.find('.file-name').val() !== this.filename || dialog.find('.file-desc').val() !== this.desc);
                        this.filename = dialog.find('.file-name').val();
                        this.desc = dialog.find('.file-desc').val();
                        this.options.map.html['list'].find('.list-filename').text(this.filename);
                        dialog.dialog('close');
                    }
                    else {
                        alert('invalid kml, kmz, gpx filename.');
                    }
                }, this),
                Close: function () {
                    $(this).dialog('close');
                }
            },
            open: function () {
                dialog.find('.file-desc').ckeditor(config);
                dialog.find('.file-desc').ckeditor().resize('100%', '100%', false);
            },
            close: function () {
                dialog.find('.file-desc').ckeditorGet().destroy();
                $(this).dialog('destroy');
            },
            resize: function (ev) {
                dialog.find('.file-desc').ckeditor().resize('100%', '100%', false);
            }
        });
    };
    File.prototype.show = function () {
        var dialog = this.options.map.html['file-show'];
        this.getOptions(dialog);
        this.options.map.stats(dialog.find('.file-list'), this.distance(), Object.keys(this.segments).length, Object.keys(this.placemarks).length);
        dialog.find('.file-name').val(this.filename).attr({'disabled': true});
        dialog.find('.file-desc').html(this.desc);
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: 'auto',
            buttons: {
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            }
        });
    };
    Segment.prototype.segmentDialog = function () {
        var dialog = this.options.map.html['segment-dialog'];
        var config = this.options.map.getCkeditorConfig();

        var list = dialog.find('.segment-dialog-color-select option');
        var strokeColor = this.options.strokeColor.toLowerCase();
        $.each(list, function (index, item) {
            if (item.value.toLowerCase() === strokeColor) {
                $(item).attr('selected', true);
            } else {
                $(item).removeAttr('selected');
            }
        });
        dialog.find('.segment-dialog-fid').val(this.options.fid);
        dialog.find('.segment-dialog-sid').val(this.options.sid);
        dialog.find('.segment-dialog-desc').val(this.options.desc);
        dialog.find('.segment-dialog-name').val(this.options.name);
        dialog.find('.colorpicker-trigger').css('background-color', this.options.strokeColor);
        dialog.find('.colorpicker-trigger').css('opacity', parseFloat(this.options.strokeOpacity).toFixed(1));
        dialog.find('.colorpicker-trigger').css('height', this.options.strokeWeight + 'px');
        var pad = parseInt((30 - this.options.strokeWeight) / 2);
        dialog.find('.colorpicker-trigger').css('margin-top', pad + 'px');
        dialog.find('.opacity-val').val(parseFloat(this.options.strokeOpacity).toFixed(1));
        dialog.find('.width-val').val(this.options.strokeWeight);
        dialog.find('.segment-dialog-stats').html(' miles=' + this.options.map.convertMeters2(this.distance()).toString() + ' points: ' + this.line.getPath().getLength());
        setCurrentColor(dialog);
        dialog.dialog({
            autoOpen: true,
            width: 600,
            modal: true,
            buttons: {
                Update: $.proxy(function () {
                    var obj = dialog.find('.colorpicker-trigger');
                    this.options.strokeColor = rgb2hex($(obj).css('background-color'));
                    this.options.strokeOpacity = parseFloat($(obj).css('opacity')).toFixed(3);
                    this.options.strokeWeight = parseInt($(obj).css('height').replace(/px/, ''));
                    this.options.name = dialog.find('.segment-dialog-name').val();
                    this.options.desc = dialog.find('.segment-dialog-desc').val();
                    this.line.setOptions({
                        strokeColor: this.options.strokeColor,
                        strokeOpacity: this.options.strokeOpacity,
                        strokeWeight: this.options.strokeWeight
                    });
                    this.options.file.setDirty(true);
                    $(this.segmentList).find(this.segmentItem).html(this.options.name);
                    dialog.dialog('close');
                }, this),
                Close: function () {
                    $(this).dialog('close');
                }
            },
            open: function () {
                dialog.find('.segment-dialog-desc').ckeditor(config);
                dialog.find('.segment-dialog-desc').ckeditor().resize('100%', '100%', false);
            },
            close: function () {
                dialog.find('.segment-dialog-desc').ckeditorGet().destroy();
                $(this).dialog('destroy');
            },
            resize: function (ev) {
                dialog.find('.segment-dialog-desc').ckeditor().resize('100%', '100%', false);
            }
        });
    };
    Segment.prototype.cuesheetDialog = function () {
        var dialog = this.options.map.html['cuesheet-dialog'];
        var config = this.options.map.getCkeditorConfig();
        dialog.find('.cuesheet').data({'segment': this});
        this.options.map.html['cuesheet-dialog'].dialog({
            autoOpen: true,
            resizable: true,
            draggable: true,
            width: 600,
            modal: false,
            buttons: {
                Update: $.proxy(function () {
                    this.cueUpdatePath();
                }, this),
                Close: $.proxy(function () {
                    dialog.dialog('close');
                }, this)
            },
            open: function () {
                this.isActive = false;
                dialog.find('.cuesheet').ckeditor(config);
            },
            close: $.proxy(function () {
                this.isActive = true;
                dialog.find('.cuesheet').ckeditorGet().destroy();
                dialog.dialog('destroy');
                if (this.directionsRenderer && this.directionsRenderer.getMap()) {
                    this.directionsRenderer.setMap(null);
                }
                this.cuesheetKill();
            }, this)
        });
    };
    Segment.prototype.show = function () {
        var dialog = this.options.map.html['segment-show'];
        dialog.find('.segment-dialog-sid').val(this.options.sid);
        dialog.find('.segment-dialog-desc').html(this.options.desc);
        dialog.find('.segment-dialog-name').val(this.options.name).attr({'disabled': true});
        dialog.find('.segment-dialog-stats').html(' miles=' + this.options.map.convertMeters2(this.distance()).toString() + ' points: ' + this.line.getPath().getLength());
        dialog.dialog({
            autoOpen: true,
            width: 600,
            modal: true,
            buttons: {
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            }
        });
    };
    Placemark.prototype.show = function () {
        var dialog = this.options.map.html['placemark-show'];
        dialog.find('.placemark-dialog-pid').val(this.options.pid);
        dialog.find('.placemark-dialog-desc').html(this.options.desc);
        dialog.find('.placemark-dialog-name').val(this.options.name).attr({'disabled': true});
        dialog.dialog({
            autoOpen: true,
            width: 600,
            modal: true,
            buttons: {
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            }
        });
    };
    Placemark.prototype.placemarkDialog = function () {
        var dialog = this.options.map.html['placemark-dialog'];
        var config = this.options.map.getCkeditorConfig();
        this.options.map.infowindow.close();
        if (this.options.symbol === 'Waypoint') { //waypoint
            dialog = this.options.map.html['waypoint-dialog'];
            dialog.find('.waypoint-dialog-name').val(this.options.name);
            dialog.find('.waypoint-dialog-fid').val(this.options.fid);
            dialog.find('.waypoint-dialog-pid').val(this.options.pid);
            dialog.find('.waypoint-dialog-desc').val(this.options.desc);
            dialog.dialog({
                autoOpen: true,
                height: 'auto',
                width: 600,
                modal: true,
                zIndex: 100,
                buttons: {
                    Update: $.proxy(function () {
                        this.setName(dialog.find('.waypoint-dialog-name').val());
                        $(this.placemarkList).find(this.placemarkItem).text(dialog.find('.waypoint-dialog-name').val());
                        this.options.desc = dialog.find('.waypoint-dialog-desc').val();
                        this.marker.setVisible(true);
                        dialog.dialog('close');
                        this.options.file.setDirty(true);
                    }, this),
                    Close: function () {
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    dialog.find('.waypoint-dialog-desc').ckeditorGet().destroy();
                    $(this).dialog('destroy');
                },
                open: function () {
                    dialog.find('.waypoint-dialog-desc').ckeditor(config);
                    dialog.find('.waypoint-dialog-desc').ckeditor().resize('100%', '100%', false);
                },
                resize: function (ev) {
                    dialog.find('.waypoint-dialog-desc').ckeditor().resize('100%', '100%', false);
                }
            });

        } else {
            dialog = this.options.map.html['placemark-dialog'];
            dialog.find('.placemark-selected-icon').attr('src', this.options.url);
            dialog.find('.placemark-dialog-name').val(this.options.name);
            dialog.find('.placemark-dialog-fid').val(this.options.fid);
            dialog.find('.placemark-dialog-pid').val(this.options.pid);
            dialog.find('.placemark-dialog-desc').val(this.options.desc);
            dialog.dialog({
                autoOpen: true,
                height: 'auto',
                width: 600,
                modal: true,
                buttons: {
                    Update: $.proxy(function () {
                        this.setName(dialog.find('.placemark-dialog-name').val());
                        this.options.url = dialog.find('.placemark-selected-icon').attr('src');
                        this.setIcon();
                        $(this.placemarkList).find(this.placemarkItem).text(dialog.find('.placemark-dialog-name').val());
                        $(this.placemarkList).find(this.placemarkItem).parent().find('img').attr('src', this.options.url);
                        this.options.desc = dialog.find('.placemark-dialog-desc').val();
                        this.marker.setVisible(true);
                        dialog.dialog('close');
                        this.options.file.setDirty(true);
                    }, this),
                    Close: function () {
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    dialog.find('.placemark-dialog-desc').ckeditorGet().destroy();
                    $(this).dialog('destroy');
                },
                open: function () {
                    dialog.find('.placemark-dialog-desc').ckeditor(config);
                    dialog.find('.placemark-dialog-desc').ckeditor().resize('100%', '100%', false);

                },
                resize: function (ev) {
                    dialog.find('.placemark-dialog-desc').ckeditor().resize('100%', '100%', false);
                }
            });
        }
    };
})(jQuery);