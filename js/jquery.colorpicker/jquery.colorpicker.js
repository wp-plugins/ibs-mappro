/*
 * INFORMATION
 * ---------------------------
 * Owner:     jquery.webspirited.com
 * Developer: Matthew Hailwood
 * ---------------------------
 *
 * CHANGELOG:
 * ---------------------------
 * 1.1
 * Fixed bug 01
 * Fixed bug 02
 *
 * ---------------------------
 * Bug Fix Credits:
 * --
 * * Number: 01
 * * Bug:  Initial color should be option "selected" from select
 * * Name: Nico <unknown>
 * --
 * * Number: 02
 * * Bug: Selects Change event should be called on color pick
 * * Name: Bob Farrell <unknown>
 */
/*
 */
(function($) {
    $.fn.extend({
        colorpicker: function(options) {
            var htmlx =
                    '<option value="#FFA500">#FFA500</option>' +
                    '<option value="#800080">#800080</option>' +
                    '<option value="#008000">#008000</option>' +
                    '<option value="#C0C0C0">#C0C0C0</option>' +
                    '<option value="#FFFFFF">#FFFFFF</option>' +
                    '<option value="#4EE2EC">#4EE2EC</option>' +
                    '<option value="#00FF00">#00FF00</option>' +
                    '<option value="#FFFF00">#FFFF00</option>' +
                    '<option value="#808080">#808080</option>' +
                    '<option value="#808000">#808000</option>' +
                    '<option value="#FF0000">#FF0000</option>' +
                    '<option value="#0000FF">#0000FF</option>' +
                    '<option value="#FF00FF">#FF00FF</option>' +
                    '<option value="#800000">#800000</option>' +
                    '<option value="#0000A0">#0000A0</option>' +
                    '<option value="#00FFFF">#00FFFF</option>' +
                    '<option value="#000000">#000000</option>';
            var html =
                    //'<option value="#FFA500">Orange</option>' +  
                    '<option value="#8B008B">DarkMagenta</option>' +
                    '<option value="#008000">Green</option>' +
                    '<option value="#D3D3D3">LightGray</option>' +
                    //'<option value="#FFFFFF">White</option>' +
                    '<option value="#00008B">DarkBlue</option>' +
                    '<option value="#FFF380">Gold</option>' +
                    '<option value="#FFFF00">Yellow</option>' +
                    '<option value="#A9A9A9">DarkGray</option>' +
                    '<option value="#008B8B">DarkCyan</option>' +
                    '<option value="#FF0000">Red</option>' +
                    '<option value="#0000FF">Blue</option>' +
                    '<option value="#FF00FF">Magenta</option>' +
                    '<option value="#8B0000">DarkRed</option>' +
                    '<option value="#006400">DarkGreen</option>' +
                    '<option value="#00FFFF">Cyan</option>' +
                    '<option value="#000000">Black</option>';

            //Settings list and the default values
            var defaults = {
                label: '',
                size: 20,
                count: 6,
                hide: true
            };

            var options = $.extend(defaults, options);
            var obj;
            var colors = {};

            var wrap = $('<div class="colorpicker-wrap"></div>');
            var label = $('<div class="colorpicker-label"></div>');
            var trigger = $('<div class="colorpicker-trigger"></div>');
            var picker = $('<div style="width: ' + (options.size + 4) * options.count + 'px" class="colorpicker-picker"></div>');
            var info = $('<div class="colorpicker-picker-info"></div>');
            var exit = $('<div>').addClass('cp-exit').css('float', 'right')
                    .append($('<img>').addClass('cp-cancel'));//.attr('src', siteUrl() + '/image/cancel.png'));
            var clear = $('<div style="clear:both;"></div>');

            return this.each(function() {
                obj = this;
                $(obj).html(html);
                //build an array of colors
                $(obj).children('option').each(function(i, elm) {
                    colors[i] = {};
                    colors[i].color = $(elm).text();
                    colors[i].value = $(elm).val();
                });
                create_wrap();
                if (options.label != '')
                    create_label();
                create_trigger();
                create_picker();
                wrap.append(label);
                wrap.append(trigger);
                wrap.append(picker);
                wrap.append(clear);
                $(obj).after(wrap);
                if (options.hide)
                    $(obj).css({
                        position: 'absolute',
                        left: -10000
                    });
            });


            function create_wrap() {
                wrap.mouseleave(function() {
                    // picker.fadeOut('slow');
                });
            }

            function create_label() {
                label.text(options.label);
                label.click(function() {
                    trigger.click()
                });
            }

            function create_trigger() {
                trigger.click(function() {
                    var offset = $(this).position();
                    var top = offset.top;
                    var left = offset.left + $(this).width() + 5;
                    $(picker).css({
                        'top': top,
                        'left': left
                    }).fadeIn('slow');
                    $(picker).find('.colorpicker-picker-span:first').trigger('mouseover');
                    $(picker).find('.colorpicker-picker-span.active').trigger('mouseover');
                    ;
                });
            }

            function create_picker() {
                picker.append(exit);
                picker.append(info);

                for (var i in colors) {
                    picker.append('<span class="colorpicker-picker-span ' +
                            (colors[i].color == $(obj).children(":selected").text() ? ' active' : '') + '" rel="' + colors[i].value + '" style="background-color: ' + colors[i].color + '; width: ' + options.size + 'px; height: ' + options.size + 'px;"><div class="cpind"></div></span>');
                }
                trigger.css('background-color', $(obj).children(":selected").text());
                info.text($(obj).children(":selected").attr('rel'));
                $(picker).on('mouseover', '.colorpicker-picker-span', {}, function() {
                    var color = $(this).attr('rel')
                    var cname = $(obj).find('option[value="'+color+'"]').text();
                    if (cname) {
                        var cname = cname.replace(/Dark/, 'Dark ').replace(/Light/, 'Light' );
                    } else {
                        cname = color;
                    }
                    info.text(cname);
                    //info.text($(this).attr('rel'));
                }, function() {
                    info.text(picker.children('.colorpicker-picker-span.active').attr('rel'));
                });
                $(picker).on('click', '.colorpicker-picker-span', {}, function() {
                    info.text($(this).attr('rel'));
                    $(obj).val($(this).attr('rel'));
                    $(obj).change();
                    picker.children('.colorpicker-picker-span.active').removeClass('active');
                    $(this).addClass('active');
                    trigger.css('background-color', $(this).css('background-color'));
                    picker.fadeOut('slow')
                });
                $(picker).on('click', '.cp-exit', {}, function(event) {
                    picker.fadeOut('slow')
                })
                $(obj).after(picker);
            }
        }
    });
})(jQuery);