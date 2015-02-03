(function($) {
    Map.prototype.elevation = function(segment) {
        this.selectedPoint = null;
        this.elevationSegment = segment;
        try {
            segment.focus();
        } catch (err) {
            this.elevationSegment = null;
            return;
        }
        this.sizeHtml();
        this.elevationService = new google.maps.ElevationService();
        this.elevationChart = new google.visualization.AreaChart(this.html['data-chart'][0]);
        this.elevations = [];
        google.visualization.events.addListener(this.elevationChart, 'onmouseout', $.proxy(function(e) {
            if (this.elevationSegment) {
                this.html['distance-info'].addClass('hide');
                this.elevationSegment.distanceMarker.setVisible(false);
            }
        }, this));
        google.visualization.events.addListener(this.elevationChart, 'onmouseover', $.proxy(function(e) {
            var nearest = this.elevationSegment.nearestPoint(this.elevations[e.row].location);
            var _gain = 0.0;
            var beg = this.selectedPoint ? this.selectedPoint : 0;
            var end = e.row;
            var a = beg < end ? beg : end;
            var b = a === beg ? end : beg;
            for (var i = a; i < b; i++) {
                _gain += parseFloat(this.elevations[i].gain);
            }
            var d = nearest.distance;
            if (this.selectedPoint) {
                nearest = this.elevationSegment.nearestPoint(this.elevations[this.selectedPoint].location);
                d = d < nearest.distance ? nearest.distance - d : d - nearest.distance;
            }
            var distance = this.convertMeters2(d);
            distance += this.measure2();
            this.html['distance-info'].html(distance + ' total gain ' + _gain.toFixed(2) + this.measure1());
            this.setMenuXY(this.html['distance-info'], this.elevations[e.row].location);
            var top = parseInt($(this.html['distance-info']).css('top').replace(/px/, ''));
            top = top - 35;
            $(this.html['distance-info']).css('top', top + 'px');
            this.html['distance-info'].removeClass('hide');
            this.elevationSegment.distanceMarker.setPosition(this.elevations[e.row].location);
            this.elevationSegment.distanceMarker.setVisible(true);
        }, this));
        google.visualization.events.addListener(this.elevationChart, 'select', $.proxy(function(e) {
            var selection = this.elevationChart.getSelection();
            if (selection.length > 0 && selection[0].row) {
                this.selectedPoint = selection[0].row;
            }
        }, this));
        this.getElevations(segment);
    };
    Map.prototype.getElevations = function(segment) {
        var accDistance = 0;
        var params = [];
        var path = segment.line.getPath();
        for (var i = 0; i < path.length; i++)
        {
            if (i) {
                accDistance += distanceFrom(path.getAt(i - 1), path.getAt(i));
            }
            params.push({
                latlng: path.getAt(i),
                distance: accDistance
            });
        }
        var chartSteps = 750; //     100/inch for 7.5 inches.  endpoints 0-750
        var step = (accDistance / 1609) / 5.0;
        var mag = Math.floor(Math.log(step) / 2.302585092994046); //log 10
        var magPow = Math.pow(10, mag);
        var magMsd = Math.floor(step / magPow);
        if (magMsd > 5.0) {
            magMsd = 10.0;
        } else if (magMsd > 2.0) {
            magMsd = 5.0;
        } else {
            magMsd = 2.0;
        }
        step = magMsd * magPow; //major division of plotting
        var decDistance = (step * 1609 * Math.ceil((accDistance / 1609) / step)) / chartSteps;
        var chartVertices = new Array;
        chartVertices.push(params[0].latlng);
        var dIndex = 1;
        var pIndex = 0;
        while (chartSteps > dIndex && dIndex * decDistance <= accDistance) {
            //last chartVertices is already set, don't count into it
            while (dIndex * decDistance > params[pIndex + 1].distance)
                pIndex++;
            var deltaDistance = params[pIndex + 1].distance - params[pIndex].distance;
            var deltaFactor = (dIndex * decDistance - params[pIndex].distance) / deltaDistance;
            try {
                chartVertices.push(google.maps.geometry.spherical.interpolate(params[pIndex].latlng, params[pIndex + 1].latlng, deltaFactor));
            } catch (e) {
                alert('geometry(?) threw error: ' + e + "\n\nArgument to interpolate: " + params[pIndex].latlng + ',' + params[pIndex + 1].latlng + ',' + deltaFactor + "\npIndex: " + pIndex);
                var error_line = '';
                for (var eIndex = pIndex - 10; pIndex + 10 > eIndex; eIndex++)
                    error_line = error_line + eIndex + "-" + params[eIndex].latlng + "| ";
                alert(error_line);
            }
            dIndex++;
        }
        chartVertices.push(params[params.length - 1].latlng);
        this.getElevationParts(chartVertices, 0);
    };
    Map.prototype.getElevationParts = function(data, index) {
        var loc = data.length > 250 ? data.slice(0, 250) : data;
        data = data.length > 250 ? data.slice(250) : [];
        this.elevationService.getElevationForLocations({locations: loc}, $.proxy(function(results, status) {
            if (status !== google.maps.ElevationStatus.OK) {
                alert('received status ' + status);
                return;
            }
            this.elevations = this.elevations.concat(results);
            index += results.length;
            if (data.length > 0) {
                this.getElevationParts(data, index);
            } else {
                this.showElevationChart();
            }
        }, this));
    };
    Map.prototype.showElevationChart = function() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
        var gain = 0.0;
        for (i = 0; i < this.elevations.length; i++) {
            if (i > 0 && this.elevations[i].elevation > this.elevations[i - 1].elevation) {
                var ce = parseFloat(this.convertMeters1(this.elevations[i].elevation));
                var le = parseFloat(this.convertMeters1(this.elevations[i - 1].elevation));
                this.elevations[i].gain = ce - le;
                gain += (ce - le);
            } else {
                this.elevations[i].gain = 0.0;
            }
            data.addRow(['', parseFloat(this.convertMeters1(this.elevations[i].elevation))]);
        }
        var title = 'Elevation ' + this.measure1();
        this.elevationChart.draw(data, {
            legend: 'none',
            titleY: title,
            focusBorderColor: '#00ff00',
            backgroundColor: 'white', //#E4E4E4',
            colors: ['Blue'],
            tooltipTextStyle: {
                visibility: "hidden"
            }
        });
        this.elevationChart.setSelection([{
                row: 0,
                col: 1
            }]);
        this.html['data'].find('.data-segment').html('<strong>Segment:</strong> ' + this.elevationSegment.options.name);
        this.html['data'].find('.data-distance').html('<strong>Distance:</strong> ' + this.convertMeters2(this.elevationSegment.distance()) + this.measure2());
        this.html['data'].find('.data-gain').html('<strong>Climbing:</strong> ' + gain.toFixed(2) + this.measure1());
        this.sizeHtml();
    };
})(jQuery);