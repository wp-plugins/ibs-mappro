function KML() {
    this.options = {
        name: null,
        desc: null,
        url: null,
        position: null,
        draggable: false,
        visible: false,
        strokeColor: '#0000ff',
        strokeWeight: 3,
        strokeOpacity: 0.5,
        path: []
    };
    this.kml = null;
    this.file = null;
}
(function($) {
    KML.prototype.writer = function(file) {
        var line_styles = [];
        var icon_styles = [];
        var segment_list = file.listSegments();
        var placemark_list = file.listPlacemarks();
        function setLineStyle(style) {
            for (var i = 0; i < line_styles.length; i++) {
                if (style.color === line_styles[i].color && style.width === line_styles[i].width) {
                    return '#' + line_styles[i].id;
                }
            }
            style.id = 'LineStyle-' + padLeftStr(line_styles.length + 1, 3, '0');
            line_styles.push(style);
            return '#' + style.id;
        }
        function setIconStyle(style) {
            for (var i = 0; i < icon_styles.length; i++) {
                if (style.icon === icon_styles[i].icon) {
                    return '#' + icon_styles[i].id;
                }
            }
            style.id = 'IconStyle-' + padLeftStr(icon_styles.length + 1, 3, '0');
            icon_styles.push(style);
            return '#' + style.id;
        }
        for (var sid in file.segments) {
            var sg = file.segments[sid];
            var color = colorKML(sg.options.strokeOpacity, sg.options.strokeColor);
            sg.options.style = setLineStyle({'color': color, 'width': sg.options.strokeWeight.toString()});
        }
        for (var pid in file.placemarks) {
            var pm = file.placemarks[pid];
            pm.options.style = setIconStyle({'icon': pm.marker.icon.url});
        }
        var xml = new XMLWriter('UTF-8', '1.0');
        xml.writeStartDocument();
        xml.writeStartElement('kml');
        xml.writeAttributeString('xmlns', 'http://www.opengis.net/kml/2.2');
        xml.writeStartElement('Document');
        xml.writeStartElement('name');
        xml.writeCDATA(file.options.name);
        xml.writeEndElement();
        xml.writeElementString('open', '1');
        xml.writeStartElement('description');
        xml.writeCDATA(file.options.desc);
        xml.writeEndElement();
        for (var i = 0; i < icon_styles.length; i++) {
            xml.writeStartElement('Style');
            xml.writeAttributeString('id', icon_styles[i].id);
            xml.writeStartElement('IconStyle');
            xml.writeStartElement('Icon');
            xml.writeElementString('href', icon_styles[i].icon);
            xml.writeEndElement();//icon
            xml.writeEndElement();//icon style
            xml.writeEndElement();//style
        }
        for (var i = 0; i < line_styles.length; i++) {
            xml.writeStartElement('Style');
            xml.writeAttributeString('id', line_styles[i].id);
            xml.writeStartElement('LineStyle');
            xml.writeElementString('color', line_styles[i].color);
            xml.writeElementString('width', line_styles[i].width);
            xml.writeEndElement();//line style
            xml.writeStartElement('PolyStyle');
            xml.writeElementString('color', line_styles[i].color);
            xml.writeEndElement();//polystyle
            xml.writeEndElement();//style
        }
        xml.writeStartElement('Folder');
        xml.writeElementString('name', 'Placemarks');
        xml.writeElementString('description', 'placemarks');
        for (var i = 0; i < placemark_list.length; i++) {
            var pm = file.placemarks[placemark_list[i]];
            var lat = pm.options.position.lat().toString();
            var lng = pm.options.position.lng().toString();
            xml.writeStartElement('Placemark');
            xml.writeStartElement('name');
            xml.writeCDATA(pm.options.name);
            xml.writeEndElement();
            xml.writeStartElement('description');
            xml.writeCDATA(pm.options.desc);
            xml.writeEndElement();
            xml.writeElementString('styleUrl', pm.options.style);
            xml.writeStartElement('Point');
            xml.writeElementString('coordinates', lng + ',' + lat + ',0');
            //xml.writeElementString('styleUrl', pm.options.style);
            xml.writeEndElement();//point
            xml.writeEndElement(); //placemark
        }
        xml.writeEndElement(); //folder

        xml.writeStartElement('Folder');
        xml.writeElementString('name', 'segments');
        xml.writeElementString('description', 'segment lines');
        for (i = 0; i < segment_list.length; i++) {
            var sg = file.segments[segment_list[i]];
            var coordinates = '';
            sg.line.getPath().forEach(function(latlng) {
                coordinates += latlng.lng().toString() + ',' + latlng.lat().toString() + ',0.00000 \n';
            });
            xml.writeStartElement('Placemark');
            xml.writeStartElement('name');
            xml.writeCDATA(sg.options.name);
            xml.writeEndElement();
            xml.writeStartElement('description');
            xml.writeCDATA(sg.options.desc);
            xml.writeEndElement();
            xml.writeElementString('styleUrl', sg.options.style);
            xml.writeStartElement('LineString');
            xml.writeElementString('altitudeMode', 'clampToGround');
            xml.writeElementString('coordinates', coordinates);
            xml.writeEndElement(); //linestring
            xml.writeEndElement();//placemark
        }
        xml.writeEndElement(); //folder
        xml.writeEndElement(); //documennt
        xml.writeEndElement(); //kml
        xml.writeEndDocument();
        return xml.flush();
    };
    KML.prototype.getLineStyle = function(lineStyle) {
        var color = $(lineStyle).find('color').text();
        var width = $(lineStyle).find('width').text();
        var aa = color.substr(0, 2);
        var bb = color.substr(2, 2);
        var gg = color.substr(4, 2);
        var rr = color.substr(6, 2);
        this.options.strokeColor = "#" + rr + gg + bb;
        this.options.strokeOpacity = parseInt(aa, 16) / 256;
        this.options.strokeWeight = parseInt(width);
    };
    KML.prototype.getStyle = function(placemark) {
        $(placemark).find('styleUrl').each($.proxy(function(n, styleUrl) {
            var styleId = $(styleUrl).text().substr(1);
            $(this.kml).find('Style[id=' + styleId + ']').each($.proxy(function(n, style) {
                $(style).find('LineStyle').each($.proxy(function(n, lineStyle) {
                    this.getLineStyle(lineStyle);
                }, this));
                $(style).find('IconStyle').each($.proxy(function(n, iconStyle) {
                    this.options.url = $(iconStyle).find('href:first').text();
                }, this));
            }, this));
        }, this));
        $(placemark).children('Style').each($.proxy(function(n, style) {
            $(style).children('LineStyle').each($.proxy(function(n, lineStyle) {
                this.getLineStyle(lineStyle);
            }, this));
            $(style).children('IconStyle').each($.proxy(function(n, iconStyle) {
                this.options.url = $(iconStyle).find('href:first').text();
            }, this));
        }, this));

    };
    KML.prototype.getLineString = function(placemark) {
        $(placemark).children('LineString').each($.proxy(function(n, lineString) {
            this.options.path = [];
            var coordinates = $(lineString).children('coordinates').text();
            coordinates = coordinates.replace(/\n/g, ' ');
            coordinates = $.trim(coordinates);
            while (coordinates.indexOf('  ') > 0) {
                coordinates = coordinates.replace(/  /g, ' ');
            }
            var coordinatesArray = coordinates.split(' ');
            for (var i = 0; i < coordinatesArray.length; i++) {
                var strArray = coordinatesArray[i].split(',');
                var lng = parseFloat(strArray[0]);
                var lat = parseFloat(strArray[1]);
                this.options.path.push(new google.maps.LatLng(lat, lng));
            }
            if (this.options.path.length > 0)
                this.file._addSegment(this.options);
        }, this));
    };
    KML.prototype.getPoint = function(placemark) {
        $(placemark).children('Point').each($.proxy(function(n, point) {
            var coordinates = $(point).children('coordinates').text();
            coordinates = $.trim(coordinates);
            var strArray = coordinates.split(',');
            var lng = parseFloat(strArray[0]);
            var lat = parseFloat(strArray[1]);
            this.options.position = new google.maps.LatLng(lat, lng);
            if (this.options.name)
                this.file._addPlacemark(this.options);
        }, this));
    };

    KML.prototype.getDocument = function(document) {
        if (getCDATA($(document).contents('name').text()) === 'Track Points')
            return; //bypass Garmin track points
        this.file.options.name = getCDATA($(document).contents('name').text());
        this.file.options.desc = getCDATA($(document).contents('description').text());
        $(document).children('Placemark').each($.proxy(function(n, placemark) {
            this.options.name = getCDATA($(placemark).children('name').text());
            this.options.desc = getCDATA($(placemark).children('description').text());
            this.getStyle(placemark);
            this.getLineString(placemark);
            this.getPoint(placemark);
        }, this));
        $(document).children('Folder').each($.proxy(function(n, folder) {
            this.getDocument(folder); //recursive drill down on folders
        }, this));
    };
    KML.prototype.reader = function(xml, file) {
        this.file = file;
        $(xml).children('kml').each($.proxy(function(n, kml) {
            this.kml = kml;
            $(this.kml).children('Document').each($.proxy(function(n, document) {
                this.getDocument(document);
            }, this));
            $(this.kml).children('Folder').each($.proxy(function(n, folder) {
                this.getDocument(folder);
            }, this));
        }, this));
    };
    KML.prototype.kmlWindow = function(kml) {
        var newWindow = window.open('',
                'KML Export ' + (new Date()).getTime(), "width=800,height=1000");
        newWindow.document.write('<textarea id="kml" style="width: 100%; height: 100%">' + kml + '</textarea>');

    };
})(jQuery);