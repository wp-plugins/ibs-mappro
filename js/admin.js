jQuery(document).ready(function ($) {
    function reorderIcons() {
        $('.current-icon-name').each(function (index, item) {
            var attr = 'ibs_mappro_icons[index][name]'.replace(/index/, index);
            $(item).attr('name', attr);
        });
        $('.current-icon-url').each(function (index, item) {
            var attr = 'ibs_mappro_icons[index][url]'.replace(/index/, index);
            $(item).attr('name', attr);
        });
    }
    $('#icon-library-select').on('change', '', {map: this}, function (event) {
        var lib = $('#icon-library-select').val();
        $('.map-icon').each(function (index, item) {
            if ($(item).data("qtip")) {
                $(item).qtip("destroy", true);
                $(item).removeData("hasqtip");
                $(item).removeAttr("data-hasqtip");
            }
        });
        $.get(ibs_mappro.ajax,
                {'action': 'ibs_mappro_icons',
                    'lib': lib
                },
        function (data, status) {
            $('#icon-library-list').empty();
            for (var i in data) {
                $('#icon-library-list')
                        .append('<img class="map-icon" src="' + data[i] + '" title="' + getFilename(data[i]) + '" width="32" height="32" />');
            }
            $('.map-icon').qtip();
            $('.map-icon').draggable({
                revert: true,
                activeClass: "ui-state-highlight"
            });
        }, 'json');
    });
    $('#current-icon-list').sortable({
        stop: function (event, ui) {
            reorderIcons();
        }
    });
    $('#garmin-library-select').on('change', '', {map: this}, function (event) {
        var lib = $('#garmin-library-select').val();
        $.get(ibs_mappro.ajax,
                {'action': 'ibs_mappro_icons',
                    'lib': lib
                },
        function (data, status) {
            $('#garmin-library-list').empty();
            for (var i in data) {
                $('#garmin-library-list')
                        .append('<img class="map-icon" src="' + data[i] + '" title="' + getFilename(data[i]) + '" width="32" height="32" />');
            }
            $('.map-icon').draggable({
                revert: true,
                activeClass: "ui-state-highlight"
            });
        }, 'json');
    });
    $('.garmin-icon-name').droppable({
        accept: '.map-icon',
        addClasses: false,
        hoverClass: "ui-state-hover",
        drop: function (event, ui) {
            var url = ui.draggable.attr('src');
            var parent = $(this).parents('li')[0];
            $(parent).find('.garmin-icon-url').val(url);
            var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, ui.draggable.attr('src'))
            $(parent).attr('style', bg);
        }
    });
    $('.current-icon-name').droppable({
        accept: '.map-icon',
        addClasses: false,
        hoverClass: "ui-state-hover",
        drop: function (event, ui) {
            var url = ui.draggable.attr('src');
            $(this).val(getFilename(url));
            var parent = $(this).parents('li')[0];
            $(parent).find('.current-icon-url').val(url);
            var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, ui.draggable.attr('src'))
            $(parent).attr('style', bg);
        }
    });
    $('#icon-add-input').droppable({
        accept: '.map-icon',
        addClasses: false,
        hoverClass: "ui-state-hover",
        drop: function (event, ui) {
            var url = ui.draggable.attr('src');
            var name = getFilename(url);
            var item = $('<input>').addClass('current-icon-name').attr({'type': 'text', 'value': name, 'name': 'ibs_mappro_icons[0][name]'});
            var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, url)
            $('#current-icon-list')
                    .prepend($('<li>').addClass('current-icon-item').attr({'style': bg})
                            .append($('<div>')
                                    .append(item)
                                    .append($('<a>').addClass('icon-delete').text(' ').attr({'href': '#', 'title': 'delete'})))
                            .append($('<input>').addClass('current-icon-url').attr({'type': 'hidden', 'value': url, 'name': 'ibs_mappro_icons[0][url]'})
                                    )
                            );
            reorderIcons()
            $(item).droppable({
                accept: '.map-icon',
                addClasses: false,
                hoverClass: "ui-state-hover",
                drop: function (event, ui) {
                    var url = ui.draggable.attr('src');
                    $(this).val(getFilename(url));
                    var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, ui.draggable.attr('src'))
                    var parent = $(this).parents('li')[0];
                    $(parent).find('.current-icon-url').val(url);
                    $(parent).attr('style', bg);
                }
            });
        }
    });
    $('#current-icon-list').on('click', '.icon-delete', {}, function (event) {
        $(this).parents('li').eq(0).remove();
        reorderIcons();
    });
    //----------------------------------------------------------------------
    //upload dialog
    //----------------------------------------------------------------------
    $('#ibs-icon-upload')
            .append($('<div id="upload-dialog" >').addClass('hide dialog-map').attr('title', 'Upload Icons')
                    .append($('<div id="upload-browser" >'))
                    .append($('<div>')
                            .append($('<span>')
                                    .append($('<div>').addClass('section-header').html('Target'))
                                    .append($('<div>').addClass('kmlkmzgpx')
                                            .append($('<input id="upload-target-directory" >').attr({type: "text", size: "75", value: "/"})))))
                    .append($('<div>')
                            .append($('<span>')
                                    .append($('<div>').addClass('section-header').css({'font-size': '.9em', 'padding-left': '5px'}).html('status'))
                                    .append($('<div >').addClass('map-upload-div file-list-div').css('height', '100px')
                                            .append($('<ul id="upload-list" >').addClass(' file-list'))))
                            .append($('<div>').css('display', 'none')
                                    .append($('<div id="upload-button" >').html('Browse')))));
    var uploader = $('#upload-button').fineUploader({
        listElement: $('#upload-list'),
        request: {
            endpoint: ibs_mappro.site + 'js/jquery.fineuploader/server/endpoint.php',
            params: {'dir': ibs_mappro.maps_path + 'upload/'}

        },
        debug: false
    });
    uploader.on('complete', '', {}, function (event, id, fileName, responseJSON) {
        var map = event.data.map;
        var lib = $('#upload-target-directory').val().replace('/', '');
        var has = false;
        $('.icon-lib').each(function (index, item) {
            if ($(item).val() === lib) {
                has = true;
            }
        });
        if (false === has) {
            $('#icon-library-select')
                    .prepend($('<option>').attr({'value': lib}).addClass('icon-lib').text(lib).trigger('change'));
        }
        $('#icon-library-select').val(lib);
        $('#icon-library-select').trigger('change');
    });
    $('#upload-target-directory').on('change', '', {}, function (event) {
        var root = ibs_mappro.icons_path;
        var newdir = $('#upload-target-directory').val().replace(root, '');
        if (newdir.indexOf(root) === -1) {
            newdir = root + newdir;
        }
        if (newdir === root) {
            newdir = root + 'new/';
        }
        newdir = newdir + "/";
        newdir = newdir.replace('//', '/');
        var dir_file = newdir.replace(root, '');
        $('#upload-target-directory').val(dir_file).focus();
        uploader.fineUploader('setParams', {'dir': newdir});
    });
    $('#ibs-upload-action').on('click', '', {}, function (event) {
        var dialog = $('#upload-dialog');
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Select Files': $.proxy(function () {
                    var a = $('#upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input');
                    c.trigger('click');
                }, this),
                Clear: function () {
                    $('#upload-list').empty();
                },
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: function () {
                var initdir = ibs_mappro.icons_path + 'new/';
                $('#upload-target-directory').val('new/');
                uploader.fineUploader('setParams', {'dir': initdir});
                $('#upload-browser').fileTree({
                    root: ibs_mappro.icons_path,
                    script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=dir',
                    folderEvent: 'click',
                    expandSpeed: 1000,
                    collapseSpeed: 1000,
                    multiFolder: false
                }, function (file) {
                    alert(file);
                }, function (dir) {
                    $('#upload-target-directory').val(dir);
                    $('#upload-target-directory').trigger('change');
                }
                );
            }
        });
    });
    $('#ibs-icon-clean')
            .append($('<div id="clean-dialog" >').addClass('hide dialog-map').attr('title', 'Manage Icon Folders')
                    .append($('<div id="clean-browser" >'))
                    .append($('<div>')
                            .append($('<span>')
                                    .append($('<div>').addClass('section-header').html('Target'))
                                    .append($('<div>').addClass('kmlkmzgpx')
                                            .append($('<input id="clean-target-directory" >').attr({type: "text", size: "75", value: "/", disabled: true}))))));
    $('#ibs-clean-action').on('click', '', {}, function (event) {
        $('#clean-target-directory').val('')
        $('#clean-dialog').dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Remove Files': function () {
                    var files = '';
                    $('#clean-browser').find('LI A.selected').each(function (index) {
                        files += $(this).attr('rel') + ';';
                    });
                    if (files.length > 0) {

                        $.get(ibs_mappro.ajax, {
                            'action': 'ibs_mappro_remove',
                            'type': 'files',
                            'dir': ibs_mappro.icons_path + $('#clean-target-directory').val(),
                            'files': files
                        }, function (data, status) {
                            $('#clean-browser').find('LI A.selected').remove();
                        }, 'TEXT');
                    }
                },
                'Remove Folder': function () {
                    $.get(ibs_mappro.ajax, {
                        action: 'ibs_mappro_remove',
                        type: 'directory',
                        'dir': ibs_mappro.icons_path + $('#clean-target-directory').val()
                    }, function (data, status) {
                        $('#clean-browser').find('LI.expanded').remove();
                        var lib = $('#clean-target-directory').val().replace('/', '');
                        $('.icon-lib').each(function (index, item) {
                            if ($(item).val() === lib) {
                                $(item).remove();
                            }
                        });
                    }, 'TEXT');
                },
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: function () {
                $('#clean-browser').fileTree({
                    root: ibs_mappro.icons_path,
                    script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=all',
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                    if (event.shiftKey) {
                        var first = false;
                        var found = false;
                        var rel = $(this).attr('rel');
                        $(this).parent().parent().find('A').each(function (n) {
                            if (!found || !first) {
                                if ($(this).attr('rel') === rel) {
                                    found = true;
                                } else {
                                    if ($(this).hasClass('selected') && !first) {
                                        first = true;
                                    }
                                }
                                if (first || found) {
                                    $(this).addClass('selected');
                                }
                            } else {
                                $(this).removeClass('selected');
                            }
                        });
                    } else {
                        if (event.ctrlKey) {
                            $(this).toggleClass('selected');
                        } else {
                            var has = $(this).hasClass('selected');
                            $(this).parent().parent().find('A').removeClass('selected');
                            if (false === has) {
                                $(this).addClass('selected');
                            }
                        }
                    }
                }, function (dir) {
                    $('#clean-target-directory').val(dir.replace(ibs_mappro.icons_path, ''));
                }
                );
            }
        });
    });
    $('#ibs-map-clean')
            .append($('<div id="map-dialog" >').addClass('hide dialog-map').attr('title', 'Manage Map Folders')
                    .append($('<div id="map-browser" >'))
                    .append($('<div>')
                            .append($('<span>')
                                    .append($('<div>').addClass('section-header').html('Target'))
                                    .append($('<div>').addClass('kmlkmzgpx')
                                            .append($('<input id="map-target-directory" >').attr({type: "text", size: "75", value: "/", disabled: true}))))));
    $('#ibs-map-manage').on('click', '', {}, function (event) {
        $('#map-target-directory').val('')
        $('#map-dialog').dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Remove Files': function () {
                    var files = '';
                    $('#map-browser').find('LI A.selected').each(function (index) {
                        files += $(this).attr('rel') + ';';
                    });
                    if (files.length > 0) {
                        $.get(ibs_mappro.ajax, {
                            'action': 'ibs_mappro_remove',
                            'type': 'files',
                            'dir': ibs_mappro.maps_path + $('#map-target-directory').val(),
                            'files': files
                        }, function (data, status) {
                            $('#map-browser').find('LI A.selected').remove();
                        }, 'TEXT');
                    }
                },
                'Remove Folder': function () {
                    $.get(ibs_mappro.ajax, {
                        action: 'ibs_mappro_remove',
                        type: 'directory',
                        'dir': ibs_mappro.maps_path + $('#map-target-directory').val()
                    }, function (data, status) {
                        $('#map-browser').find('LI.expanded').remove();
                        var lib = $('#map-target-directory').val().replace('/', '');
                    }, 'TEXT');
                },
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: function () {
                $('#map-browser').fileTree({
                    root: ibs_mappro.maps_path,
                    script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=all',
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                    if (event.shiftKey) {
                        var first = false;
                        var found = false;
                        var rel = $(this).attr('rel');
                        $(this).parent().parent().find('A').each(function (n) {
                            if (!found || !first) {
                                if ($(this).attr('rel') === rel) {
                                    found = true;
                                } else {
                                    if ($(this).hasClass('selected') && !first) {
                                        first = true;
                                    }
                                }
                                if (first || found) {
                                    $(this).addClass('selected');
                                }
                            } else {
                                $(this).removeClass('selected');
                            }
                        });
                    } else {
                        if (event.ctrlKey) {
                            $(this).toggleClass('selected');
                        } else {
                            var has = $(this).hasClass('selected');
                            $(this).parent().parent().find('A').removeClass('selected');
                            if (false === has) {
                                $(this).addClass('selected');
                            }
                        }
                    }
                }, function (dir) {
                    $('#map-target-directory').val(dir.replace(ibs_mappro.maps_path, ''));
                }
                );
            }
        });
    });
    $('#shortcode-browser').fileTree({
        root: ibs_mappro.maps_path,
        script: ibs_mappro.ajax + '?action=ibs_mappro_folders&type=map',
        folderEvent: 'click',
        expandSpeed: 0,
        collapseSpeed: 0,
        multiFolder: false
    }, function (file) {
        file = file.replace(ibs_mappro.maps_path, ibs_mappro.maps_url);
        var uriinfo = purl(file);
        var files = uriinfo.data.attr.base + uriinfo.data.attr.directory;
        $('#shortcode-browser').find('a.selected').each(function(){
            files += $(this).text() + ';';
        })
        files = files.slice(0,files.length-1);
        $('#shortcode-url').val(files);
        $('#shortcode-url').trigger('change');
    }, function (dir) {
    }
    );
    $('#shortcode-options').on('change', '.shortcode-input', {}, function (event) {
        var result = '[ibs-mappro ';
         $('#shortcode-options').find('select').each(function (index, item) {
            if ($(item).val() !== '') {
                result += $(item).attr('name') + '="' + $(item).val() + '" ';
            }
        });
        $('#shortcode-options').find('input').each(function (index, item) {
            if ($(item).val() !== '') {
                result += $(item).attr('name') + '="' + $(item).val() + '" ';
            }
        });
        $('#shortcode').val(result+']');
    });
});
