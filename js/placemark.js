function Placemark(arg) {
    this.init(arg);
}
(function ($) {
    Placemark.prototype.init = function (arg) {
        this.options = {
            map: null,
            file: null,
            pid: 'P1001',
            name: null,
            desc: null,
            url: null,
            symbol: null,
            position: null,
            visible: true
        };
        for (attr in arg) {
            this.options[attr] = arg[attr];
        }
        if (this.options.name === null)
            this.options.name = this.options.pid;
        if (this.options.desc === null)
            this.options.desc = this.options.pid;
        this.placemarkList = this.options.file.placemarkList;
        this.placemarkItem = '.placemark-item-name[rel="' + this.options.pid + '"]';
        this.marker = new google.maps.Marker({
            position: this.options.position,
            map: this.options.map.googlemap,
            title: this.options.name,
            draggable: true,
            placemark: this,
            visible: this.options.visible
        });
        this.setName = function (name) {
            this.options.name = name;
            this.marker.setTitle(name);
            this.placemarkList.find(this.placemarkItem).text(name);
        };
        this.setIcon = function () {
            this.marker.setMap(null);
            if (/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(this.options.url)) {
                this.options.symbol = this.options.map.getSymbol(this.options.url);
            } else {
                this.options.url = this.options.map.getUrlFromSymbol(this.options.symbol);
            }
            this.marker.setIcon(this.options.map.getIcon(this.options.url));
            this.marker.setMap(this.options.map.googlemap);
            this.placemarkList.find('.placemark-item-image[pid=' + this.options.pid + ']').attr('src', this.marker.icon.url);
        };
        this.setIcon();
        google.maps.event.addListener(this.marker, 'click', $.proxy(function (event) {
            $(this.placemarkItem).trigger('click');
        }, this));
        google.maps.event.addListener(this.marker, 'dragend', $.proxy(function (event) {
            this.options.position = this.marker.getPosition();
        }, this));
        this.setPlacemarkItem();
    }
    Placemark.prototype.setOptions = function (options) {
        for (var attr in options) {
            this.options[attr] = options[attr];
        }
    };

    Placemark.prototype.copy = function () {
        var copy = {};
        for (var attr in this.options) {
            copy[attr] = this.options[attr]
        }
        copy.position = this.marker.getPosition();
        copy.url = this.marker.icon.url;
        return copy;
    };
    Placemark.prototype.remove = function () {
        this.marker.unbind();
        this.marker.setMap(null);
        this.options.file.removePlacemark(this.options.pid);
    };
    Placemark.prototype.open = function () {
        this.options.file.openInfo(this);
    };
    Placemark.prototype.edit = function () {
        this.placemarkDialog();
    }
})(jQuery);