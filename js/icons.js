(function ($) {
    Map.prototype.setIcons = function () {
        this.imageDistancePointer = new google.maps.MarkerImage(
                this.siteUrl() + 'image/crosshair-black.png', //url
                new google.maps.Size(16, 16), //size
                new google.maps.Point(0, 0), //origin
                new google.maps.Point(8, 8)//anchor
                );
        this.imageBlueMarker = new google.maps.MarkerImage(
                this.siteUrl() + 'image/blue.png', //url
                new google.maps.Size(20, 34), //size
                new google.maps.Point(0, 0), //origin
                new google.maps.Point(10, 34)//anchor
                );
        this.imageRedMarker = new google.maps.MarkerImage(
                this.siteUrl() + 'image/red.png', //url
                new google.maps.Size(20, 34), //size
                new google.maps.Point(0, 0), //origin
                new google.maps.Point(10, 34)//anchor
                );
        this.imageLineActive = new google.maps.MarkerImage(
                this.siteUrl() + "image/redCircle.png",
                new google.maps.Size(16, 16),
                new google.maps.Point(0, 0),
                new google.maps.Point(8, 8)
                );
        this.imageLineNormal = new google.maps.MarkerImage(
                this.siteUrl() + "image/blue_box.png", //image/greenCircle.png",
                new google.maps.Size(16, 16),
                new google.maps.Point(0, 0),
                new google.maps.Point(8, 8)
                );
        this.imageWaypointNormal = new google.maps.MarkerImage(
                this.siteUrl() + "image/waypoint.png",
                new google.maps.Size(32, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(15, 25)
                );
        this.imageNormal = new google.maps.MarkerImage(
                this.siteUrl() + "image/square.png",
                new google.maps.Size(11, 11),
                new google.maps.Point(0, 0),
                new google.maps.Point(6, 6)
                );
        this.imageHover = new google.maps.MarkerImage(
                this.siteUrl() + "image/square_over.png",
                new google.maps.Size(11, 11),
                new google.maps.Point(0, 0),
                new google.maps.Point(6, 6)
                );
        this.imageNormalMidpoint = new google.maps.MarkerImage(
                this.siteUrl() + "image/square_transparent.png",
                new google.maps.Size(11, 11),
                new google.maps.Point(0, 0),
                new google.maps.Point(6, 6)
                );
        var me = this;
        $.get(ibs_mappro.ajax,
                {'action': 'ibs_mappro_garmin'
                },
        function (data, status) {
            me.garmin_symbols = data;
        },
                'json');
    };
    Map.prototype.getIcon = function (url) {
        if (url.indexOf('-lv') !== -1) {
            return new google.maps.MarkerImage(
                    url,
                    new google.maps.Size(16, 16),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(8, 8),
                    new google.maps.Size(16, 16)
                    );
        } else {
            return new google.maps.MarkerImage(
                    url,
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16, 33),
                    new google.maps.Size(32, 32)
                    );
        }
    };
    Map.prototype.getSymbol = function (url) {
        for (var i = 0; i < this.garmin_symbols.length; i++) {
            if (url === this.garmin_symbols[i].url) {
                return this.garmin_symbols[i].name;
            }
        }
        if(getFilename(url) === 'icon61'){//backwards compatibility
            return 'Waypoint';
        }
        return initialCaps(getFilename(url).replace('-', ' ').replace('_', ' '));
    };
    Map.prototype.getUrlFromSymbol = function (symbol) {
        if (symbol === 'Waypoint') {
            return  this.siteUrl() + "image/waypoint.png";
        }
        var result = this.siteUrl() + "image/picture.png";
        if (symbol !== '') {
            for (var i = 0; i < this.garmin_symbols.length; i++) {
                if (symbol === this.garmin_symbols[i].name) {
                    result = this.garmin_symbols[i].url;
                    break;
                }
            }
        }
        return result;
    };
    Map.prototype.getIconOptions = function (list) {
        $.get(ibs_mappro.ajax,
                {'action': 'ibs_mappro_icon_palette'
                },
        function (data, status) {
            $(list).empty();
            for (var i in data) {
                var bg = "background:url(xxx) left top no-repeat; vertical-align:middle;".replace(/xxx/, data[i].url);
                $(list)
                        .append($('<li class="placemark-select-item" >').attr('style', bg)
                                .append($('<input>').addClass('icon-option-name').attr({disabled: true, 'type': 'text', 'value': data[i].name}))
                                .append($('<input>').addClass('icon-option-value').attr({'type': 'hidden', 'value': data[i].url}))
                                )
            }
        }, 'json');
    };
})(jQuery);