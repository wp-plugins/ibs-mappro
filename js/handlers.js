//mappro 2.0
(function ($) {
    Map.prototype.setHandlers = function () {
        $.widget("ui.dialog", $.ui.dialog, {
            _allowInteraction: function (event) {
                return !!$(event.target).closest(".cke_dialog").length || this._super(event);
            }
        });
        $(window).resize($.proxy(function (ev) {
            this.sizeHtml();
        }, this));

        window.onbeforeunload = $.proxy(function (e) {
            var ans = this.isDirty();
            if (ans)
                return ans;
            else
                return;

        }, this);

        this.html['ibs-header'].on('click', '.ibs-reset', {map: this}, function (event) {
            event.data.map.reset();

        });
        this.html['dd-display'].on('click', '.control-distance-flag', {map: this}, function (event) {
            event.data.map.options.distance = event.data.map.html['dd-display'].find('.control-distance-flag').is(':checked');
        });
        this.html['dd-display'].on('click', '.control-bike-layer', {map: this}, function (event) {
            event.data.map.setBikeLayer(event.data.map.html['dd-display'].find('.control-bike-layer').is(':checked'));
        });
        this.html['dd-display'].on('click', '.control-placemarks', {map: this}, function (event) {
            event.data.map.file.placemarkVisible(event.data.map.html['dd-display'].find('.control-placemarks').is(':checked'));
        });
        this.html['dd-display'].on('click', '.control-waypoints', {map: this}, function (event) {
            event.data.map.file.waypointVisible(event.data.map.html['dd-display'].find('.control-waypoints').is(':checked'));
        });
        this.html['dd-map'].on('click', '.map-action-browse', {map: this}, function (event) {
            event.data.map.browseDialog();
        });
        this.html['dd-map'].on('click', '.map-action-web', {map: this}, function (event) {
            event.data.map.webDialog();
        });
        this.html['dd-map'].on('click', '.map-action-show', {map: this}, function (event) {
            event.data.map.file.showXml();
        });
        this.html['dd-map'].on('click', '.map-action-upload', {map: this}, function (event) {
            event.data.map.uploadDialog();
        });
        this.html['dd-map'].on('click', '.map-action-download', {map: this}, function (event) {
            event.data.map.file.saveAs(true);
        });
        this.html['dd-map'].on('click', '.map-action-save', {map: this}, function (event) {
            event.data.map.file.saveDialog();
        });
        this.html['dd-map'].on('click', '.map-action-focus', {map: this}, function (event) {
            event.data.map.file.focus();
        });
        this.html['list'].on('click', '.list-action-edit', {map: this}, function (event) {
            event.data.map.file.fileDialog();
        });
        this.html['dd-map'].on('click', '.map-action-edit', {map: this}, function (event) {
            event.data.map.options.mode === 'edit' ? event.data.map.file.fileDialog() : event.data.map.file.show();
        });
        this.html['dd-map'].on('click', '.map-action-flip', {map: this}, function (event) {
            event.data.map.file.flip();
        });
        this.html['dd-map'].on('click', '.map-action-sort', {map: this}, function (event) {
            event.data.map.file.pendSort();
        });
        this.html['dd-map'].on('click', '.map-action-clear', {map: this}, function (event) {
            event.data.map.clear();
        });
        this.html['ibs-header'].on('click', '.ibs-find', {map: this}, function (event) {
            event.data.map.findDialog();
        });
        this.html['list'].on('click', '.list-action-route', {map: this}, function (event) {
            event.data.map.file.pendSegment();
        });
        this.html['list'].on('click', '.list-action-placemark', {map: this}, function (event) {
            event.data.map.file.pendPlacemark();
        });
        if (this.options.mode === 'edit') {
            function getMFS(event) {
                var item = event.data.map.html['list'].find('.segment-item-name.selected');
                if (item.length > 0) {
                    var rel = $(item[0]).attr('rel');
                    var segment = event.data.map.file.segments[rel];
                    return {'map': event.data.map, 'segment': segment};
                } else {
                    return null;
                }
            }
            this.html['dd-route'].on('click', '.route-action-append', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj) {
                    obj.map.file.append(obj.segment);
                }
            });
            this.html['dd-route'].on('click', '.route-action-focus', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj) {
                    obj.segment.focus();
                }
            });
            this.html['dd-route'].on('click', '.route-action-extend', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.extend();
            });
            this.html['dd-route'].on('click', '.route-action-edit', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.segmentDialog();
            });
            this.html['dd-route'].on('click', '.route-action-ledit', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.lineEdit();
            });
            this.html['dd-route'].on('click', '.route-action-flip', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.flip();
            });
            this.html['dd-route'].on('click', '.route-action-rebuild', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.rebuild();
            });
            this.html['dd-route'].on('click', '.route-action-remove', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.remove();
            });
            this.html['dd-route'].on('click', '.route-action-thin', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.thin();
            });
            this.html['dd-route'].on('click', '.route-action-undo', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.undo();
            });
            this.html['dd-route'].on('click', '.route-action-cue', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.segment.cuesheetDirections();
            });
            this.html['dd-route'].on('click', '.route-action-profile', {map: this}, function (event) {
                var obj = getMFS(event);
                if (obj)
                    obj.map.elevation(obj.segment);
            });
            this.html['dd-options'].on('click', '.control-followroad', {map: this}, function (event) {
                var onoff = event.data.map.html['dd-options'].find('.control-followroad').is(':checked');
                event.data.map.options.followroad = onoff;
            });
            this.html['dd-options'].on('click', '.control-avoidhighway', {map: this}, function (event) {
                event.data.map.options.avoidhighway = event.data.map.html['dd-options'].find('.control-avoidhighway').is(':checked');
            });
            this.html['dd-options'].on('change', 'input[name=travelmode]', {map: this}, function (event) {
                event.data.map.options.travelmode = event.data.map.html['dd-options'].find('input[name=travelmode]:checked').val();
            });
            this.html['placemark-dialog'].on('click', '.placemark-select-item', {map: this}, function (event) {
                event.data.map.html['placemark-dialog'].find('.placemark-selected-icon').attr('src', $(this).find('.icon-option-value').val());
            });
        }
        //-----------------------header buttons------------------------------------------------------
        this.html['list'].on('click', '.list-action-import', {map: this}, function (event) {
            event.data.map.html['list'].find('.import-list-div').toggleClass('hide');
        });

        this.html['find-dialog'].on('keypress', '.find-words', {map: this}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = event.data.map.html['find-dialog'];
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Find'].apply(dialog);
            }
        });
        // list 
        this.html['page'].on('click', '.info-footer a', {map: this}, function (event) {
            var map = event.data.map;
            var rel = $(this).attr('rel')
            var action = $(this).attr('action');
            var file = map.file;
            var obj = rel.substr(0, 1) == 'S' ? file.segments[rel] : file.placemarks[rel];
            map.infowindow.close();
            switch (action) {
                case 'elevation' :
                    obj.options.map.elevation(obj);
                    break;
                case 'show' :
                    obj.show();
                    break;
                case 'edit':
                    obj.edit();
                    break;
                case 'remove':
                    obj.remove();
                    break;
            }
        })
        //segment
        this.html['list'].on('click', 'img.segment-elevation', {map: this}, function (event) {
            var segment = event.data.map.file.segments[$(this).attr('rel')];
            if (segment) {
                event.preventDefault();
                event.stopPropagation();
                event.data.map.elevation(segment);
            }
        });
        //segment
        this.html['list'].on('click', 'img.segment-focus', {map: this}, function (event) {
            var segment = event.data.map.file.segments[$(this).attr('rel')];
            if (segment) {
                event.preventDefault();
                event.stopPropagation();
                segment.focus();
            }
        });
        this.html['list'].on('click', 'img.segment-cuesheet', {map: this}, function (event) {
            var segment = event.data.map.file.segments[$(this).attr('rel')];
            if (segment) {
                event.preventDefault();
                event.stopPropagation();
                segment.cuesheetDirections();
            }
        });
        //placemark
        this.html['list'].on('click', '.placemark-item-image', {map: this}, function (event) {
            event.data.map.file.placemarkFilter(this);
        });
        this.html['list'].on('click', '.placemark-item-name', {map: this}, function (event) {
            var placemark = event.data.map.file.placemarks[$(this).attr('rel')];
            if (placemark) {
                $(event.data.map.placemarkInfo).addClass('hide');
                event.data.map.html['placemark-cm-info'].addClass('hide');
                event.data.map.infowindow.close();
                event.data.map.file.selectPlacemark(this, event);
                if (1 == 1 || $(this).hasClass('selected')) {
                    placemark.open();
                } else {
                    event.data.map.infowindow.close();
                }
            }
        });

        this.html['list'].on('mouseover', '.placemark-item-name', {map: this}, function (event) {
            var rel = $(this).attr('rel');
            var placemark = event.data.map.file.placemarks[rel];
            if (placemark) {
                placemark.marker.setVisible(true);
                var pm = event.data.map.html['placemark-cm-info'];
                $(pm).find('.placemark-cm-desc').text($('<div>').html(placemark.options.desc).text());//strip html
                $(pm).find('.placemark-cm-name').text(placemark.options.name);
                event.data.map.setMenuXY($(pm), placemark.marker.getPosition());
                $(pm).removeClass('hide');
            }
        });

        this.html['list'].on('mouseout', '.placemark-item-name', {map: this}, function (event) {
            var placemark = event.data.map.file.placemarks[$(this).attr('rel')];
            if (placemark) {
                var visible = event.data.map.file.visiblePlacemark || $(this).hasClass('selected') ? true : false;
                visible = event.data.map.html['dd-display'].find('.control-placemarks').is(':checked') ? true : visible;
                placemark.marker.setVisible(visible);
                $(event.data.map.file.options.map.placemarkInfo).addClass('hide');
                event.data.map.html['placemark-cm-info'].addClass('hide');
            }
        });

        //segment

        this.html['list'].on('click', 'a.segment-item-name', {map: this}, function (event) {
            event.stopPropagation();
            var segment = event.data.map.file.segments[$(this).attr('rel')];
            if (segment) {
                $(event.data.map.placemarkInfo).addClass('hide');
                event.data.map.html['placemark-cm-info'].addClass('hide');
                event.data.map.infowindow.close();
                event.data.map.file.selectSegment(this, event);
                if ($(this).hasClass('selected')) {
                    segment.open();
                } else {
                    event.data.map.infowindow.close();
                }
            }
        });
        this.html['list'].on('mouseover', 'a.segment-item-name', {map: this}, function (event) {
            var map = event.data.map;
            var rel = $(this).attr('rel');
            var file = map.file;
            var segment = file.segments[rel];
            if (segment) {
                var pm = map.html['placemark-cm-info'];
                pm.find('.placemark-cm-desc').html('');
                pm.find('.placemark-cm-name').html(segment.options.name);
                map.setMenuXY(pm, segment.marker.getPosition());
                pm.removeClass('hide');
                google.maps.event.trigger(segment.marker, 'mouseover');
            }
        });
        this.html['list'].on('mouseout', 'a.segment-item-name', {map: this}, function (event) {
            var map = event.data.map;
            var rel = $(this).attr('rel');
            var file = map.file;
            var segment = file.segments[rel];
            if (segment) {
                map.html['ibs-container'].find('.placemark-cm-info').addClass('hide');
                google.maps.event.trigger(segment.marker, 'mouseout');
            }
        });

        $(this.html['list']).mousedown(function (e) {
            e.stopPropagation();
        });

        this.html['segment-cm-edit'].on('click', '.cm-edit-action', {map: this}, function (event) {
            var segment = $(this).data().segment;
            event.data.map.html['segment-cm-edit'].addClass('hide');
            var action = $(this).attr('rel');
            switch (action) {
                case 'clear':
                    if (segment) {
                        segment.stopEditing();
                    }
                    break;
                case 'delete':
                    var point = parseInt($(this).data('index'));
                    if (segment) {
                        segment.removePoint(point);
                    }
                    break;
                case 'split':
                    if (segment) {
                        var index = parseInt($(this).data('index'));
                        segment.split(index);
                    }
                    break;
            }
        });

        this.html['segment-cm-line'].on('click', '.cm-line-action', {map: this}, function (event) {
            var segment = $(this).data().segment;
            event.data.map.html['segment-cm-line'].addClass('hide');
            var action = $(this).attr('rel');
            switch (action) {
                case 'line-edit':
                    segment.lineEdit();
                    break;
                case 'waypoint':
                    if (segment) {
                        var index = parseInt($(this).data('point'));
                        segment.waypoint(index);
                    }
                    break;
                case 'split':
                    if (segment) {
                        var index = parseInt($(this).data('point'));
                        segment.split(index);
                    }
                    break;
            }
        });
        this.html['segment-dialog'].find('.opacity-val').spinner({'spin': $.proxy(function (event, ui) {
                var val = ui.value;
                this.html['segment-dialog'].find('.colorpicker-trigger').css('opacity', val);
            }, this)});

        this.html['segment-dialog'].find('.width-val').spinner({'spin': $.proxy(function (event, ui) {
                var val = ui.value;
                var pad = parseInt((30 - val) / 2);
                this.html['segment-dialog'].find('.colorpicker-trigger').css('height', val + 'px');
                this.html['segment-dialog'].find('.colorpicker-trigger').css('margin-top', pad + 'px');
            }, this)});

        this.html['segment-dialog'].on('change', '.segment-color-select', {map: this}, function (event) {
            $(event.data.map.html['segment-dialog'].find('.segment-color')).css('background-color', $(event.data.map.mids('segment-color-select')).val());
            $(event.data.map.html['segment-dialog'].find('.segment-color')).css('color', '#FFFFFF');
            $(event.data.map.html['segment-dialog'].find('.segment-color')).val($(event.data.map.html['segment-dialog'].find('.segment-color-select')).val());
        });
        this.html['file-dialog'].find('.opacity-val').spinner({'spin': $.proxy(function (event, ui) {
                var val = ui.value;
                this.html['file-dialog'].find('.colorpicker-trigger').css('opacity', val);
            }, this)});

        this.html['file-dialog'].find('.width-val').spinner({'spin': $.proxy(function (event, ui) {
                var val = ui.value;
                var pad = parseInt((30 - val) / 2);
                this.html['file-dialog'].find('.colorpicker-trigger').css('height', val + 'px');
                this.html['file-dialog'].find('.colorpicker-trigger').css('margin-top', pad + 'px');
            }, this)});

        this.html['file-dialog'].on('change', '.file-color-select', {map: this}, function (event) {
            event.data.map.html['file-dialog'].find('.file-color').css('background-color', event.data.map.html['file-dialog'].find('.file-color-select').val());
            event.data.map.html['file-dialog'].find('.file-color').css('color', '#FFFFFF');
            event.data.map.html['file-dialog'].find('.file-color').val(event.data.map.html['file-dialog'].find('.file-color-select').val());
        });
        this.html['file-dialog'].on('keypress', '.file-settings-name', {map: this}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = event.data.map.html['file-dialog'];
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Update'].apply(dialog);
            }
        });

        this.html['file-dialog'].on('change', '.file-name', {map: this}, function (event) {
            event.data.map.html['file-dialog'].find('input[name=file_settings_ext]:radio').trigger('change');
        });

        this.html['file-dialog'].on('change', 'input[name=file_ext]:radio', {map: this}, function (event) {
            var ext = event.data.map.html['file-dialog'].find('input[name=file_ext]:checked').val();
            var name = event.data.map.html['file-dialog'].find('.file-name').val();
            if (name.length < 3) {
                name += '*';
            }
            name = getFilename(name) + '.' + ext;
            event.data.map.html['file-dialog'].find('.file-name').val(name);
        });
        this.html['file-dialog'].on('click', '.reset-lines', {map: this}, function (event) {
            var map = event.data.map;
            var file = map.file;
            var obj = map.html['file-dialog'].find('.colorpicker-trigger');
            var options = {
                strokeColor: rgb2hex($(obj).css('background-color')),
                strokeOpacity: parseFloat($(obj).css('opacity')).toFixed(3),
                strokeWeight: parseInt($(obj).css('height').replace(/px/, ''))
            };
            for (var sid in file.segments) {
                file.segments[sid].setOptions(options);
                file.segments[sid].line.setOptions(options);
                file.setDirty(true);
            }
        });
        this.html['save-dialog'].on('keypress', '.save-name', {map: this}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = event.data.html['save-dialog'];
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Save'].apply(dialog);
            }
        });

        this.html['save-dialog'].on('change', '.save-name', {map: this}, function (event) {
            event.data.map.html['save-dialog'].find('input[name="file_ext"]:radio').trigger('change');
        });
        this.html['save-dialog'].on('change', '.save-dir', {map: this}, function (event) {
            var dir = event.data.map.html['save-dialog'].find('.save-dir').val();
            var dir = dir + '/';
            dir = dir.replace('//', '/');
            event.data.map.html['save-dialog'].find('.save-dir').val(dir);
        });

        this.html['save-dialog'].on('change', 'input[name="file_ext"]:radio', {map: this}, function (event) {
            var ext = event.data.map.html['save-dialog'].find('input[name="file_ext"]:checked').val();
            var name = event.data.map.html['save-dialog'].find('.save-name').val();
            if (name.length < 3) {
                name += '*';
            }
            name = getFilename(name) + '.' + ext;
            event.data.map.html['save-dialog'].find('.save-name').val(name);
        });
        this.uploader.on('submit', '', {}, $.proxy(function () {
            this.uploadCount++;
        }, this));
        this.uploader.on('complete', '', {map: this}, function (event, id, fileName, responseJSON) {
            var map = event.data.map;
            map.uploadCount--;
            if (map.uploadCount === 0) {
                map.html['upload-dialog'].dialog('close');
            }
            var ext = getExtension(fileName).toLowerCase();
            if (ext === 'kml' || ext === 'kmz' || ext === 'gpx') {
                var dir = map.html['upload-dialog'].find('.upload-target-directory').val();
                dir = map.siteUrl() + 'maps/' + dir;
                map.file.importFile(dir + fileName);
            }
        });
        this.html['data'].on('click', '.chart-close', {map: this}, function (event) {
            event.data.map.elevationSegment = null;
            event.data.map.sizeHtml();
        })
        this.html['file-dialog'].find('.reset-lines').button({
            text: true,
            label: 'Set Lines',
            icons: {
                primary: 'ui-icon-arrowreturnthick-1-e'
            }
        });
        this.html['upload-dialog'].on('change', '.upload-target-directory', {map: this}, function (event) {
            var map = event.data.map;
            var newdir = map.html['upload-dialog'].find('.upload-target-directory').val();
            newdir = newdir + "/";
            newdir = newdir.replace('//', '/');
            map.html['upload-dialog'].find('.upload-target-directory').val(newdir.replace(map.siteRoot() + 'maps/', ''));
            map.uploader.fineUploader('setParams', {'dir': newdir});
        });
        //----------------------------------------------------------------------
        //resize
        //----------------------------------------------------------------------
        var init_height = this.options.height === '100%' ? $(window).height() : this.options.height;
        var init_width = this.options.width === '100%' ? $(window).width() : this.options.width;
        this.html['ibs-container'].width(init_width);
        this.html['ibs-container'].height(init_height);

        this.html['ibs-container'].on('resizestop', '', {map: this}, function (event) {
            event.data.map.sizeHtml();
        });
        this.html['list'].on('resizestop', '', {map: this}, function (event) {
            event.data.map.sizeHtml();
        });

        this.html['ibs-header'].on('click', '.ibs-size', {map: this}, function (event) {
            event.data.map.resetSize();
        });
        this.resetSize();
    };
    Map.prototype.resetSize = function () {
        var init_height = this.options.height === '100%' ? $(window).height() : this.options.height;
        var init_width = this.options.width === '100%' ? $(window).width() : this.options.width;
        this.html['ibs-container'].css({'top': this.options.top, 'left': this.options.left})
        this.html['ibs-container'].width(init_width);
        this.html['ibs-container'].height(init_height);
        this.sizeHtml();
    }
    Map.prototype.sizeHtml = function () {
        if (this.elevationSegment) {
            this.html['data'].height(200)
        } else {
            this.html['data'].height(0);
        }
        var height = $(window).height() < this.html['ibs-container'].height() ? $(window).height() : this.html['ibs-container'].height();
        var width = $(window).width() < this.html['ibs-container'].width() ? $(window).width() : this.html['ibs-container'].width();
        height -= this.options.top;
        width -= this.options.left;
        this.html['ibs-container'].width(width);
        this.html['ibs-container'].height(height);
        var v = this.html['ibs-container'].height();
        var x = this.html['ibs-header'].find('div').height();
        var y = this.html['ibs-footer'].height();
        var h = v - x - y - 4;
        $(this.html['ibs-main']).css('height', h - 10 + 'px');
        var hh = 0;
        x = $(this.html['ibs-container']).width();
        y = this.options.mode !== 'edit' ? 0 : $(this.html['list']).width();
        var w = x - y - 5;

        this.html['app'].width(w);
        x = $(this.html['data']).height();
        this.html['map'].width(w);
        this.html['map'].height(h - x);
        this.html['data-chart'].height(this.html['data'].height() - $(this.html['data']).find('span:first').height())
        this.html['data-chart'].width(this.html['data'].width());
        if (this.googlemap)
            google.maps.event.trigger(this.googlemap, 'resize');
    };
})(jQuery);