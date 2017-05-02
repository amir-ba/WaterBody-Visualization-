/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */
var s = 51.139942;
var n = 51.143203;
var w = 7.366514;
var e = 7.373476;
var czml = './data/simple2.czml';
var czmlOver = './data/simple3.czml';
var stationCzml = './data/simple4.czml';
var waterLevelCzml = './data/simple5.czml';
var wallCzml = './data/simple6Wall.czml';
var TimeSeriesOfInterest = {
    stationsHeightCoordinates: {
        107: 297.46,
        108: 298.32,
        109: 287.07,
        110: 286.75,
        111: 275.67,
        112: 296.71,
        113: 298.43,
        114: 287.11,
        115: 287.21,
        116: 275.96,
        117: 276.01,
        118: 296.26,
        119: 298.36,
        120: 287.07,
        121: 287.06,
        122: 275.96,
        123: 275.99,
        124: 298.52,
        125: 298.09,
        126: 298.53,
        127: 298.07,
        128: 298.54,
        129: 298.16
    },
    timeSeriesId: ["592", "593", "594", "584", "585", "586", "587", "588",
        "589", "590", "596", "597", "580", "578", "579"]
    , stations: {
        592: "MQA1"
        , 593: "MQA3"
        , 594: "MQA4"
        , 584: "MQA7"
        , 580: 'MQC6'
        , 579: 'MQC5'
        , 578: 'MQC4'
        , 596: 'MQC1'
        , 597: 'MQC2'
        , 590: 'MQB7'
        , 589: 'MQB6'
        , 588: 'MQB5'
        , 587: 'MQB4'
        , 586: 'MQB2'
        , 585: 'MQB1'

    }


};
var positionN = [];
var idList = [];
var alphaList = [];
var isRunning = false;
var isRunning2 = false;
//var loadingSeepage = false;

var waterLevelColorArray = ['#006837', '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43',
    '#d73027', '#a50026'];
var chartColorArray = ['#F5D156', '#D1AC91', '#50B1B5', '#84B14A', '#E75E37', '#D13074', '#51879F', '#5A7147',
    '#0E5A81', '#DE9C90'];
var seepageCssColorArray =
    ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858',
        '#03253a'];
// code to create the czml from sos data or the 3DCityDb
//var path = "https://raw.githubusercontent.com/amir-ba/WaterBody-Visualization-/master/HTML5Application/public_html/data/wall/Tiles/0/0/wall_Tile_0_0_collada.kml";
//console.log(createCzml(path)) ;
//createCzmlFromSOS() ;   

Cesium.BingMapsApi.defaultKey = 'ApOW9LMkerqWIVSnFauilSeaZyp8df66byy1USCTjgTdMvhb4y1iAhEsUHQfCgzq';
var viewer = new Cesium.Viewer($('#cesiumContainer')[0], {
    // terrainExaggeration : 1.2
});
var extent = new Cesium.Rectangle.fromDegrees(w, s, e, n);
viewer.camera.setView({destination: extent});
var webMap = new WebMap3DCityDB(viewer);
webMap.activateViewChangedEvent(true);
var scene = viewer.scene;
viewer.infoBox.frame.removeAttribute('sandbox');
// add KML data
viewer.flyTo(
    viewer.dataSources.add(
        Cesium.KmlDataSource.load('./data/roadal.kml', {
        })
        ));
viewer.dataSources.add(
    Cesium.KmlDataSource.load('./data/betrieb.kml', {
    })
    );
viewer.dataSources.add(
    Cesium.KmlDataSource.load('./data/doc.kml', {
    })
    );
viewer.dataSources.add(
    Cesium.KmlDataSource.load('./data/pegel.kml', {
    })
    );
viewer.dataSources.add(
    Cesium.KmlDataSource.load('./data/underground.kml', {
    })
    );
//viewer.dataSources.add(
//    Cesium.KmlDataSource.load('./data/overground.kml', {
//    })
//    );

viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.showWaterEffect = true;
viewer.scene.globe.enableLighting = true;
// add terrain
var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://www.3dcitydb.de/3dcitydb/fileadmin/mydata/OGC_FCP1/WaterBody_Amir/terrain/'
    url: 'http://localhost/dashboard/cesium/Apps/22'
        //      url : '//assets.agi.com/stk-terrain/world'
    , requestVertexNormals: true
        //,ellipsoid: new Cesium. Ellipsoid(2000+6378137.0, 2000+6378137.0,2000+ 6356752.3142451793)

});
viewer.terrainProvider = terrainProvider;
//add czml data 
Cesium.CzmlDataSource.updaters.push(czmlUpdater);
var czmldataSourceWaterBodyUnder = Cesium.CzmlDataSource.load(czml);
//var czmldataSourceWaterBodyover = Cesium.CzmlDataSource.load(czmlOver);
var czmldataSourceStations = Cesium.CzmlDataSource.load(stationCzml);
var czmldataSourcewaterLevel = Cesium.CzmlDataSource.load(waterLevelCzml);
var czmldataSourceWall = Cesium.CzmlDataSource.load(wallCzml);
//viewer.dataSources.add(czmldataSourceWaterBodyover);

viewer.dataSources.add(czmldataSourceStations).then(function () {
    drawChart();
    loadChartData(4, '2016-02-01', '592');
    updateTimeSeriesList();
    drawGauge();
});
viewer.dataSources.add(czmldataSourceWall);
viewer.dataSources.add(czmldataSourcewaterLevel).then(function () {
    viewer.dataSources.add(czmldataSourceWaterBodyUnder).then(function (data) {
        var promis = Cesium.sampleTerrain(viewer.terrainProvider, 15,
            positionN);
        promis.then(function (terrainSamplePositions) {
            var entities = data.entities;
            console.log(terrainSamplePositions.length);
            setOpacityBasedOnElevation(terrainSamplePositions, entities)
            AddUndergroundLayer();
            animation(true);
            onTick();
        });
    });
});
///functions
function removeSeriesFromChart(selectedSeriesId) {
    Highcharts.charts[0].series.forEach(function (dataSeries) {
        if (dataSeries.name === selectedSeriesId) {
            dataSeries.remove();
        }
        console.log(Highcharts.charts[0])
    });
}
function animation(action1, action2) {
    viewer.clock.shouldAnimate = action1;
    viewer.clock.canAnimate = (typeof (action2) === "boolean") ? action2 : action1;
}
function setOpacityBasedOnElevation(terrainSamplePositions, entities) {
    for (var i = 0, j = terrainSamplePositions.length; i < j; ++i) {
        var BaseHeight = terrainSamplePositions[i].height; //.toFixed(2);
        var entity = entities.getById(idList[i]);
        //    console.log(entity)
        var oldHeight = entity.model.nodeTransformations.Y_UP_Transform.translation.intervals.get(0).data.z;
        if (BaseHeight - oldHeight < 20) {
//   console.log( BaseHeight )
            alphaList[ idList[i]] = fitRange(BaseHeight, [270, 310, 0.7, 0.2]);
            entity.model.color.intervals._intervals[0].data.alpha = alphaList[ idList[i]];
        } else {
            entity.model.color.intervals._intervals[0].data.alpha = 0.4;

        }
    }

}
function AddUndergroundLayer() {
    var depth100 = viewer.entities.add({
        id: "underground",
        rectangle: {
            coordinates: new Cesium.Rectangle.fromDegrees(7.34181, 51.1378, 7.4009, 51.1581),
            material: new Cesium.ImageMaterialProperty({
                image: './data/basewhite.png',
                transparent: true,
                alpha: 0.1
            })
            ,
            height: 200
        }
    });
    viewer.scene.screenSpaceCameraController.minimumTrackBallHeight = 150;
    viewer.scene.screenSpaceCameraController.minimumCollisionTerrainHeight = 150;
    viewer.scene.screenSpaceCameraController.minimumPickingTerrainHeight = 150


}

function drawGauge() {

    var chart = new Highcharts.Chart({
        chart: {
            type: 'gauge',
            renderTo: "container1",
            marginTop: -60,
            marginRight: 0,
            spacingLeft: 0,
            spacingBottom: 0,
            backgroundColor: null,
        },
        pane: {
            center: ['50%', '57%'],
            size: '50%',
            startAngle: -150,
            endAngle: 150,
            background: [{
                    borderColor: '#000',
                }],
        },
        tooltip: {
            enabled: false
        },
        title: {
            text: null,
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                y: -20,
                useHTML: true,
                text: 'graphTitle',
                style: {
                    fontFamily: 'Raleway',
                    fontSize: '2em',
                    textAlign: 'center',
                }
            },
            labels: {
                enabled: false,
            },
            tickInterval: 16.66,
            tickWidth: 5,
            tickPosition: 'outside',
            tickLength: 10,
            tickColor: '#000',
            minorTickColor: '#000',
            lineColor: null,
            plotBands: [{
                    from: 0,
                    to: 33,
                    color: '#00A600', // green
                    outerRadius: '100%',
                    thickness: '15%'
                }]
        },
        plotOptions: {
            gauge: {
                innerRadius: '60%',
                dial: {
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }
            }
        },
        series: [{
                data: [33],
                dataLabels: {
                    useHTML: true,
                    //format: gaugeFormat, //Modify here to change the radial center values
                    borderWidth: 0,
                    style: {
                        fontFamily: 'Raleway',
                        fontWeight: 'normal',
                    },
                    x: 5,
                },
                tooltip: {
                    enabled: false,
                }
            }]
    },
        function (chart) { // on complete
            chart.renderer.text('End Time', 500, 370)
                .css({
                    color: '#000',
                    fontSize: '16px'
                })
                .add();
            var point = chart.series[0].data[0],
                text = chart.renderer.text(
                    'Needle Position',
                    point.plotX,
                    point.plotY
                    ).attr({
                zIndex: 5
            }).add();
            chart.renderer.text('Start Time', 240, 370)

                .css({
                    color: '#000',
                    fontSize: '16px'
                })
                .add();
            chart.renderer.text('33', 240, 95)

                .css({
                    color: '#000',
                    fontSize: '16px'
                })
                .add();
        });
    $('.highcharts-container ').css("z-index", "1")


}


function drawChart() {
    $('#chart').css('width', $(".cesium-viewer-timelineContainer").width() + 'px')
    //  $('#chart').css('right', $('div.cesium-viewer-fullscreenContainer').width() + 'px');
    Highcharts.setOptions({
        global: {
            useUTC: true
        }
    });
// Create the chart

    var chart = Highcharts.chart('container', {
        chart: {
            renderTo: 'container'
            , width: viewer.timeline._timeBarEle.clientWidth //$('cesium-viewer-timelineContainer').width(),
            , height: 100 //$('#chart-container').height(),
            , backgroundColor: 'rgba(53,53,53,0.8)'
            , margin: [20, 0, 20, 0]
            , exporting: {
                buttons: {
                    printButton: {
                        symbol: 'circle'
                    },
                    exportButton: {
                        enabled: false
                    }
                }
            }

        }
        , plotOptions: {
            line: {
                point: {
                    events: {
                        click: function (event) {
                            //    viewer.timeline._scrubJulian
                            var scrubJulian = new Cesium.JulianDate.fromDate(new Date(this.x));
                            var seconds = Cesium.JulianDate.secondsDifference(scrubJulian,
                                viewer.timeline._startJulian);
                            var xPos = Math.round(seconds * $(".cesium-timeline-bar").clientWidth
                                / viewer.timeline._timeBarSecondsSpan);

                            viewer.timeline._setTimeBarTime(xPos, seconds)

                        }
                    }
                }
            }
        }

        , legend: {
            enabled: false
        }
        , credits: {
            enabled: false
        }
        , xAxis: {
            type: 'datetime',
            tickLength: 0,
            //   maxZoom: 20 * 1000, 
            min: Date.parse(Cesium.JulianDate.toIso8601(viewer.clock.startTime))
            , max: Date.parse(Cesium.JulianDate.toIso8601(viewer.clock.stopTime))
            , lineWidth: 0
            , minorGridLineWidth: 0

            , labels:
                {
                    enabled: false

                }
            , enabled: true

        }
        , yAxis: {
            //   min: 285,
            //    max: 291,
            //    gridLineColor: 'rgba(53,53,34,0.2)',
            gridLineColor: 'rgba(130,130,130,0.3)'
                // tickPixelInterval: 25,
            , minTickInterval: 1
            , startOnTick: false
                //  , endOnTick: false
                //, maxPadding: 1
            , lineWidth: 0

            , title: {
                enabled: false
            },
            labels:
                {
                    y: -1
                    , enabled: true
                    , style: {
                        color: 'rgba(224, 225, 226,0.5)'
                    }
                }
            , offset: -47


        }
        , tooltip: {
            shared: true
                //   , stickyTracking: true

                //   , crosshairs: [true] 
            , useHTML: true
            , formatter: function (aa) {
                //,TimeSeriesOfInterest.stations[series.name]
                var text = '<small>' +
                    Highcharts.dateFormat('%e, %b, %Y', new Date(this.x))
                this.points.forEach(function (point) {
                    var category = ((TimeSeriesOfInterest.stations[point.series.name])
                        ? TimeSeriesOfInterest.stations[point.series.name] : "Selected Cell"); //point.series.name );
                    text += '</small><table>' + '<tr><td style="color:' + point.color + '">'
                        + category +
                        ' </td>' + '<td style="text-align: right"><b>' + ':' + point.y + ' mNHN</b></td></tr>'
                        + '</table>'

                });
                return text

            }
//            headerFormat: '<small>{point.key}</small><table>',
//                pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
//                '<td style="text-align: right"><b>{point.y} mNHN</b></td></tr>',
//                footerFormat: '</table>',
        }

    });
    var chart = Highcharts.charts[0];
    $('.highcharts-button').css('display', 'none');
    $('.highcharts-title').css('display', 'none');
    addChartCrosshairs(chart);
    $('#chart-container').css('right', ($('div.cesium-viewer-fullscreenContainer').width()) + 'px');
    viewer.timeline._timeBarEle.addEventListener("mousewheel", function () {
        xAxisUpdater(chart)
    })
    viewer.timeline._timeBarEle.addEventListener("mousemove", function () {
        xAxisUpdater(chart)
    });
    viewer.timeline._timeBarEle.addEventListener("mousemove", function () {
        xAxisUpdater(chart)
    });
    window.onresize = function () {
        $('#chart').css('width', $(".cesium-timeline-bar").width() + 'px')
        //   chart.width = viewer.timeline._timeBarEle.clientWidth
        chart.reflow();
        chart.redraw();
    }

    callSeriesManager(chart);
}
function callSeriesManager(chart) {

    $('#series-remove-button').click(function () {
        var selectedSeriesId = $('#select-list').find(":selected") [0].value;
        removeSeriesFromChart(selectedSeriesId)

    });
    $('#series-add-button').click(function () {
        var selectedSeriesId = $('#select-list').find(":selected") [0].value;
        addSeriesToChart(selectedSeriesId);
    });
}
function addSeriesToChart(selectedSeriesId) {
    var chart = Highcharts.charts[0];
    var duplicateCheck;
    if (chart.series.length === 0) {
        loadChartData(4, '2016-02-01', selectedSeriesId);


    } else {
        chart.series.forEach(function (dataSeries, index) {

            if (dataSeries.name === selectedSeriesId) {
                duplicateCheck = selectedSeriesId

            }
            if (!duplicateCheck && (chart.series.length - 1) === index) {
                loadChartData(4, '2016-02-01', selectedSeriesId);
            }

        });
    }
}
function updateTimeSeriesList() {
    TimeSeriesOfInterest.timeSeriesId.forEach(function (id) {
        $('#select-list').append($("<option></option>")
            .attr("value", id)
            .text(TimeSeriesOfInterest.stations[id]));
    });
}
function addChartCrosshairs(chart) {

    var crosshairY = chart.renderer.path(['M', 0, chart.plotTop, 'L', 0, chart.plotTop + chart.plotHeight]).attr({
        stroke: 'black',
        'stroke-width': 1,
        zIndex: 0
    }).add()
        .toFront()
        .hide();
    var widthTimeline = $(".cesium-viewer-timelineContainer").offset();
    $(".cesium-viewer-timelineContainer").mousemove(function (event) {
        SetCrossHairPosition(event, widthTimeline, chart, crosshairY);
    });
//    $(chart.container).mousemove(function (event) {
//        SetCrossHairPosition(event, widthTimeline, chart, crosshairY)
//    });

    ;
}
function SetCrossHairPosition(event, elementOffset, chart, crosshairY) {
    crosshairY.translate(event.offsetX, 0);
    if (event.offsetX > elementOffset.left && event.offsetX < elementOffset.left + chart.plotWidth &&
        event.offsetY > chart.plotTop && event.offsetY < chart.plotTop + chart.plotHeight) {
        crosshairY.show();
    } else {
        crosshairY.hide();
    }
}
function xAxisUpdater(chart) {
    chart.xAxis[0].update({
        min: Date.parse(Cesium.JulianDate.toIso8601(viewer.timeline._startJulian)),
        max: Date.parse(Cesium.JulianDate.toIso8601(viewer.timeline._endJulian))
    });
}
function addChartSeries(chart, time, value, seriesName, style) {
    if (typeof time != "number") time = Date.parse(time);
    //   var shift = Highcharts.charts[0].series[0].data.length > 20
    var existingSeriesName;
    // console.log(time, value, seriesName)

    var seriesColor = (style && style.color) ? style.color : chartColorArray[chart.series.length];
    var seriesLineType = (style && style.dashStyle) ? style.dashStyle : false;

    if (chart.series.length === 0) {
        chart.addSeries({
            name: seriesName,
            data: [time, value],
            color: seriesColor,
            dashStyle: seriesLineType

        });
    } else {
        chart.series.forEach(function (series, index) {
            if (series.name === seriesName) {
                existingSeriesName = series.name;
                if (series.xData.indexOf(time) === -1) {
                    series.addPoint([time, value], true);

                }
            }
            if ((chart.series.length - 1) === index && !existingSeriesName) {
                //       var seriesColor = (color) ? color : chartColorArray[index + 1];
                chart.addSeries({
                    name: seriesName,
                    data: [time, value],
                    color: seriesColor,
                    dashStyle: seriesLineType

                });
                //    Highcharts.charts[0].series[index].addPoint([time, value], true);

            }
        });
    }
}
function loadChartData(span, time, timeseries) {
    // chart.time.push(timespan)
    var date = new Date(time);
    var newEndTime = date.setMonth(date.getMonth() + span);
    // console.log(newEndTime)

    var isoEndTime = new Date(newEndTime).toISOString().slice(0, 10);
    time = isoEndTime
    var tomcatServer = "http://localhost:8080/tamis-proxy/proxy?requestUrl=";
    var apiUrl = "http://fluggs.wupperverband.de/sos2-tamis/api/v1/";
    var lastyear = "P" + span + "M29DT6h/"
        + time + "TZ" // "2017-02-26TZ"// Cesium.JulianDate.toIso8601(option.timeInterval.stop, 2);

    var requestParams = {
        type: "GET",
        url: tomcatServer + apiUrl + "timeseries/" + timeseries
            + "/" + "getData?timespan=" + lastyear // "PT6h/2016-08-16TZ"  
    };
    ajaxgetLoop(requestParams, function (a, requestback, c) {
        var result = JSON.parse(requestback);
        var timeStampValue = result.values;
        var chart = Highcharts.charts[0];
        ;
        // console.log(chart.series)

        timeStampValue.forEach(function (interval) {
            console.log(interval.timestamp, interval.value, timeseries)
            addChartSeries(chart, interval.timestamp, interval.value, timeseries)
        })
    });
}


function seepageTifToGltf(request, interval) {
    // var interval = "2016-02-02T10:00:00Z/2016-02-04T10:00:00Z";
    var rasterdata = geotif(request);
    var options = interval;
//    var cssColorArray = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9',   '#74add1', '#4575b4', '#313695'];
    var cssColorArray = seepageCssColorArray;
    var w1 = Math.floor(rasterdata[2][1]);
    var h1 = Math.floor(rasterdata[2][0]);
    var w2 = Math.round(rasterdata[2][1] / (10));
    var h2 = Math.round(rasterdata[2][0] / (10));
    var x_ratio = w1 / w2;
    var y_ratio = h1 / h2;
    var sourceCzmlWall = sourceFincer("CZML Wall");
    var showInterval = createTimeIntervalInstanse(options.timeInterval, "");
    for (var i = 0; i < h2; i++) {
        for (var j = 0; j < w2; j++) {
            var px = Math.floor(j * x_ratio);
            var py = Math.floor(i * y_ratio);
            var cellOnOrigin = (i * w2) + j;
            var id = String(cellOnOrigin);
            var cellValue = rasterdata[0][1][(py * w1) + px];
            var color = setColor(cellValue, 0.1, 0.2, cssColorArray);
            color.alpha = 0.7;
            px = j * x_ratio;
            py = i * y_ratio;
            var colorInterval = createTimeIntervalInstanse(options.timeInterval, color);
            var descriptionInterval = createTimeIntervalInstanse(options.timeInterval, cellValue);
            var modelCzmlSources = sourceCzmlWall;
            var entity = modelCzmlSources.entities.getById(id);
            if (entity) {
                entity.model.color.intervals.addInterval(colorInterval);
                entity.availability._intervals.push(showInterval);
                entity.description.intervals.addInterval(descriptionInterval);
            }

        }
    }
    isRunning2 = false;
    animation(true)

}

function setLoadingIndicator(testVarible) {

    if (testVarible) {
        $('#status').css('display', 'none');

    } else {
        $('#status').css('display', 'block');

    }


}
function onTick() {
    toggleLegends('#cesiumbuttonlegend');
    toggleLayer('#cesiumbuttonwps', "CZML");
    toggleLayer('#cesiumbuttonsos', "CZML waterLevels");
    toggleLayer('#cesiumbuttonwpsover', "CZML Over");
    toggleLayer('#cesiumbuttonwpswall', "CZML Wall");
    toggleDepthVisiality('#cesiumbuttondepth');
    SelectionButtonClickClassChange('#selection-button')
    // on time change
    viewer.clock.onTick.addEventListener(function (clock) {
        var startTime = clock.currentTime;
        var chart = Highcharts.charts[0];
        var currentTime = clock.currentTime;
        updateChartPlotLine(chart, currentTime);
        var selectedEntity = viewer.selectedEntity;
        var showSelectionOnChart;
        if (selectedEntity && selectedEntity.model && selectedEntity.model.nodeTransformations
            && selectedEntity.model.nodeTransformations.Y_UP_Transform.translation.intervals) {
            //     console.log(selectedEntity)
            Selectionbutton(selectedEntity);

        }
        if (viewer.clock.shouldAnimate && viewer.clock.canAnimate) {

            var compare = Cesium.JulianDate.compare(startTime, Cesium.JulianDate.fromDate(new Date(2017, 01, 1)))
            if (compare < 0) callRaster(startTime, showSelectionOnChart);

        }
    });
}


function deSelectionButton() {
    removeSeriesFromChart("Selected");
    viewer.selectedEntity = null

}
function Selectionbutton(selectedEntity) {


    if ($('#selection-button').hasClass('mute')) { //.text()=='Add Selected To Chart')
        //   $('#selection-button').addClass('activeshow')
        if ($('#selection-button').hasClass('mute')) $('#selection-button').toggleClass(
                'mute on') //.css('display', 'inline-block')  

        var intervals = selectedEntity.model.nodeTransformations.Y_UP_Transform.translation.intervals._intervals;
        displaySelectionButton('#selection-button', intervals)

    }

}
function displaySelectedOnChart(intervals, callback) {
    //  console.log(intervals)

    var chart = Highcharts.charts[0];
    intervals.forEach(function (interval, index) {
        // console.log(interval.data)
        var time = Cesium.JulianDate.toDate(interval.start);
        var value = interval.data.z;
        addChartSeries(chart, time, value, "Selected", {color: '#f55656', dashStyle: 'longdash'})
        //      console.log(chart.series)
        if ((intervals.length - 1) === index) {
            if (callback) callback();

        }

    });

}
function displaySelectionButton(button, intervals) {


    $(button).click(function (event) {

        var $this = $(this);
        if ($this.hasClass('on')) {
            console.log(1)

            displaySelectedOnChart(intervals);
            //    event.stopPropagation();
        }

    });

}
function SelectionButtonClickClassChange(button) {

    $('#selection-button-dummy').click(function (e) {
        console.log(e)
        if ($('#selection-button')) {
            var $this = $('#selection-button');
            if ($this.hasClass('on')) {
                $this.toggleClass("on off")

                $(button).text('Remove Selected From Chart');
            } else if ($this.hasClass('off')) {
                $this.toggleClass("off mute");
                deSelectionButton(button);
                $(button).text('Add Selected To Chart');
                //     e.stopPropagation();
            }
        }
    })

}
function checkAndUpdateChartTimeseries(chart, scrubPoint, monthAdded, selectedEntity) {

    scrubPoint = Date.parse(Cesium.JulianDate.toIso8601(scrubPoint));
    if (chart.series.length > 0 && chart.series[0].data.length > 0) {

        if (selectedEntity) {
            var intervals = selectedEntity.model.nodeTransformations.Y_UP_Transform.translation.intervals._intervals;
        }
        chart.series.forEach(function (seriesofIntreest) {

            if (seriesofIntreest.name === "Selected") {
                if (intervals) {
                    displaySelectedOnChart(intervals)
                }
            } else {
                var series = seriesofIntreest.data;
                var last = series.length - 1;
                findClosestData(scrubPoint, series, series[last].x, false, function (current) {
                    //  console.log(last - current)
                    if (last - current < 6) {
                        var lastAvailableTime = new Date(series[last].x);
                        // console.log(newEndTime)

                        loadChartData(6, lastAvailableTime, seriesofIntreest.name)
                    }
                });
            }
        });
    }
}
function findClosestData(scrubPoint, series, max, lookBackwardOnly, callback) {
    var distance = max;
    var current;
    Highcharts.each(series, function (point, index) {

        var dist = (lookBackwardOnly ? (scrubPoint - point.x) : Math.abs(point.x - scrubPoint));
        if (lookBackwardOnly) {
            if (dist < 0 && Math.abs(dist) < Math.abs(distance)) {
                distance = dist;
                current = index;
            }
        } else {
            if (dist < distance) {
                distance = dist;
                current = index;
            }

        }

        if ((series.length - 1) === index) {
            callback(current)
        }
    });
}
function updateChartPlotLine(chart, currentTime) {
    if (chart.xAxis[0].plotLinesAndBands[0] && chart.xAxis[0].plotLinesAndBands[0].id === 1)
    {
//console.log( $(".highcharts-plot-lines-0")["0"].childNodes["0"].attributes[3].value)
// add every 6 month 
// add new 
// chart.xAxis[0].plotLinesAndBands[0].options.value =Cesium.JulianDate.toDate(currentTime)// Cesium.JulianDate.toDate(currentTime);
        var left = $('span.cesium-timeline-icon16').offset().left;
        var extend = $('.cesium-viewer-animationContainer').width();
        var leftZero = left - extend + 8;
//                 $(".highcharts-plot-lines-0")["0"].childNodes["0"].attributes[3].value = "M "+leftZero+" "+0+" L "+leftZero+" 80" ;
        chart.xAxis[0].plotLinesAndBands[0].svgElem.attr({
            d: "M " + leftZero + " " + 0 + " L " + leftZero + " 100"

        });
    } else {
        chart.xAxis[0].addPlotLine({
            value: Date.parse(Cesium.JulianDate.toIso8601(currentTime)),
            width: 3,
            color: 'red',
            id: 1

        });
    }

}




function createPostRequestParam(startTime, param) {
    if (!param) var param = {}
    if (!param.leapDays) param.leapDays = 14;
    if (!param.data) param.data = {
            "inputs": [
                {
                    "id": "timespan",
                    //   "value": " " ,//2016-02-01T10:00:00.00Z%2F2016-02-15T10:00:00.00Z",
                    "type": "text/plain"
                },
                {
                    "id": "target",
                    "value"
                        : "https://github.com/52North/tamis/raw/master/geotiff.tiff",
                    "type": "application/geotiff"
                }
            ],
            "outputs": [
                {
                    "id": "predictions",
                    "type": "application/geotiff"
                }

            ]
        };
    if (!param.url) param.url =
            "http://tamis.dev.52north.org/tamis-rest/api/v1/services/1/processes//org.n52.wps.server.r.tamis-rest-interpolation-wasserstand/";
    if (!param.defaultValue) param.defaultValue = ''
    var option = {
        url: param.url,
        type: 'post'
    };
    if (typeof param.data != 'object') {

        param.data = JSON.parse(param.data);
        //console.log(param);
    }

    var startTimeWps, endTimeWps;
    startTime = Cesium.JulianDate.addMinutes(startTime, 1, new Cesium.JulianDate());
    var endTime = Cesium.JulianDate.addDays(startTime, param.leapDays, new Cesium.JulianDate());
    startTimeWps = Cesium.JulianDate.toIso8601(startTime, 2); // "2016-02-01T09:59:01.00Z";
    endTimeWps = Cesium.JulianDate.toIso8601(endTime, 2); //"2016-02-02T23:59:01.00Z";
    startTimeWps = startTimeWps.substring(0, 11) + "9:00:02.00Z";
    endTimeWps = endTimeWps.substring(0, 11) + "23:59:01.00Z";
    var defaultDataValue = param.defaultValue;
    param.data.inputs[0]["value"] = (defaultDataValue ? defaultDataValue + startTimeWps + "%2F" + endTimeWps
        : startTimeWps + "%2F" + endTimeWps);
    option.data = (typeof param.data === 'object' ? JSON.stringify(param.data) : param.data);
    var timeInterval = new Cesium.TimeInterval({
        start: startTime, // Cesium.JulianDate.fromIso8601(startTimeWps)   ,
        stop: endTime// Cesium.JulianDate.fromIso8601(endTimeWps)
    });
    option.timeInterval = timeInterval;
    option.leapDays = param.leapDays;
    return option;
}


function toggleLayer(layerId, layerName) {

    $(layerId).click(function () {
        for (var x = 0; x < viewer.dataSources.length; x++) {
            var source = viewer.dataSources.get(x);
            if (source.name === layerName) {
                source.show = !source.show

                var checked = $(layerId).find('input[type="checkbox"]') [0].checked
                $(layerId).find('input[type="checkbox"]') [0].checked = !checked



            }
        }
    });
}
function toggleLegends(buttonId) {
    $(buttonId).click(function () {
        var x = $('#legends');
        if (x.css('display') === 'none') {
            x.css('display', 'block');
        } else {
            x.css('display', 'none');
        }
        var checked = $(buttonId).find('input[type="checkbox"]') [0].checked
        $(buttonId).find('input[type="checkbox"]') [0].checked = !checked
    })


}
function toggleDepthVisiality(elementID) {
    $(elementID).click(function () {
        viewer.scene.globe.depthTestAgainstTerrain = !viewer.scene.globe.depthTestAgainstTerrain;
        var checked = $(elementID).find('input[type="checkbox"]') [0].checked
        $(elementID).find('input[type="checkbox"]') [0].checked = !checked;
        //   var entity = source.entities.values[i];
        if (checked) {
            var depth100 = new Cesium.Entity({
                id: "undergroundimage",
                rectangle: {
                    coordinates: new Cesium.Rectangle.fromDegrees(7.31519, 51.1161, 7.44788, 51.1729),
                    material: new Cesium.ImageMaterialProperty({
                        image: './data/base.png', // './data/rgb2048.jpg',
                        transparent: true,
                        alpha: 0.5
                    })
                    ,
                    height: 200
                }
            });
            viewer.entities.add(depth100)
        }
        if (!checked) {

            viewer.entities.removeById("undergroundimage")
        }


        for (var x = 0; x < viewer.dataSources.length; x++) {

            var source = viewer.dataSources.get(x);
            if (source.name === "CZML Wall") {

                for (var i = 0, length = source.entities.values.length; i < length; i++) {
                    var entity = source.entities.values[i];
                    if (checked) {
                        entity.model.nodeTransformations.Y_UP_Transform.translation.setValue(new Cesium.Cartesian3(0,
                            0, 3));
                    }
                    if (!checked) {
                        entity.model.nodeTransformations.Y_UP_Transform.translation.setValue(new Cesium.Cartesian3(0,
                            0, 0));
                    }
                }
            }
            if (source.name === "CZML") {
                if (checked) {
                    for (var i = 0, entityLength = source.entities.values.length; i < entityLength; i++) {
                        var entity = source.entities.values[i];
                        var intervals = entity.model.nodeTransformations.Y_UP_Transform.translation.intervals
                        for (var l = 0, intervalLength = intervals.length; l < intervalLength; l++) {
                            var zStart = intervals.get(l).data.z;
                            var zNew = zStart + 0.2;
                            intervals.get(l).data.z = zNew;
                        }

                    }

                }
                if (!checked) {
                    for (var i = 0, entityLength = source.entities.values.length; i < entityLength; i++) {
                        var entity = source.entities.values[i];
                        var intervals = entity.model.nodeTransformations.Y_UP_Transform.translation.intervals
                        for (var l = 0, intervalLength = intervals.length; l < intervalLength; l++) {
                            var zStart = intervals.get(l).data.z;
                            var zNew = zStart - 0.2;
                            intervals.get(l).data.z = zNew;
                        }
                    }
                }

            }






        }
    });
}

function ajaxgetLoop(response, callback) {

    if (!response.data)
        response.data = "";
    if (!response.type)
        response.type = "get";
    if (!response.tryCount)
        response.tryCount = 0
    var request = {
        url: response.url,
        dataType: 'text',
        type: response.type,
        data: response.data,
        contentType: 'application/json',
        tryCount: response.tryCount,
        retryLimit: 3,
        success: function (data, textStatus, jQxhr) {
            //               console.log( data, textStatus, jQxhr );

            callback(response, data, jQxhr);
        },
        error: function (jqXhr, textStatus, errorThrown) {

            console.log(jqXhr, textStatus, errorThrown);
            if (jqXhr.status == 500) {
                response.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    setTimeout(function () {
                        ajaxgetLoop(response, callback);
                    }, 2000);
                }
                if (this.tryCount > this.retryLimit) {

                    alert("Unable to connect to WPS REST API" + "<br>" + "internal server error");
                }

            }

        }

    }


    $.ajax(request)

}
function callajx(response, rep) {
    rep = JSON.parse(rep);
    if (rep.StatusInfo.Status === "Failed") {
        viewer.clock.canAnimate = false;
        var repeat = response.repeat;
        if (!repeat) repeat = 1;
        var requestParam = {leapDays: response.interval.leapDays + repeat, url: response.interval.url,
            data: response.interval.data, defaultValue: response.interval.defaultValue}
        var postParam = createPostRequestParam(response.interval.timeInterval.start, requestParam);
        repeat++;
        if (repeat > 4) repeat += 7;
        ajaxgetLoop(postParam, function (input1, output1, jQxhr) {
            var output = jQxhr.getResponseHeader("Location");
            console.log("RE" + Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2))

            console.log(output);
            var opp = {};
            opp.url = output;
            opp.interval = postParam;
            opp.repeat = repeat;
            ajaxgetLoop(opp, callajx);
        });
    } else if (rep.StatusInfo.Status === "Accepted") {
        animation(false)
        //  viewer.clock.shouldAnimate = false;
        //  viewer.clock.canAnimate = false;
    } else if (rep && rep.StatusInfo.Status === "Running") {
// console.log(rep.StatusInfo.Status)
        var opt = {};
        opt.url = response;
        setTimeout(function () {
            ajaxgetLoop(response, callajx);
        }, 2000);
    } else if (rep && rep.StatusInfo.Status === "Succeeded") {


        var opt2 = {};
        opt2.url = rep.StatusInfo.Output;
        opt2.interval = response.startTime;
        ajaxgetLoop(opt2, function (input, output) {
            var out = JSON.parse(output);
            var linkUrl = input.url
            ajaxgetTif(out.result[0].value, response.interval, linkUrl);
        });
    } else if (rep && rep.status == 500) {
        console.log(rep);
        ajaxgetLoop(response, callajx);
    }
    ;
    try {
        if (rep.StatusInfo.Status === "Accepted")
            throw "POST REQUEST NOT SUCCESSFUL. RETUREND Accepted INSTEAD OF SUCCEEDED";
        //    if (rep.StatusInfo.Status === "Failed")
        //    throw "POST REQUEST NOT SUCCESSFUL. RETUREND Failed INSTEAD OF SUCCEEDED";
    } catch (err) {
        console.error(err);
        //      console.error(response.url);
    }
}
function ajaxgetTif(response, interval, linkUrl) {

// console.log(response)
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('get', response, true);
    ajaxRequest.responseType = 'arraybuffer';
    ajaxRequest.onreadystatechange = function () {
        if (ajaxRequest.readyState === 4) {
            var seepageWpsResult = "tamis-interpolation";
            var waterLevelWpsResult = "tamis-rest-interpolation-wasserstand";
//linkUrl.includes(seepageWpsResult) NOT SUPPORTED BY IE
            if (linkUrl.indexOf(waterLevelWpsResult) != -1) {
                loadRasterToMap(ajaxRequest.response, interval);
            } else if (linkUrl.indexOf(seepageWpsResult) != -1) {
                //  console.log(out.result[0].value)
                seepageTifToGltf(ajaxRequest.response, interval);
            }

        }
        if (ajaxRequest.status == 500) {
            console.log(response);
            ajaxgetTif(response, interval, linkUrl);
        }

    };
    ajaxRequest.send();
}

function callRaster(startTime, showSelectionOnChart) {

    var postParam = createPostRequestParam(startTime);
    // var stationEntities = stations.entities.values;
    var sourceCzml = sourceFincer("CZML");
    var czmlEntities = sourceCzml.entities.values;
    //   var sourceCzmlOver = sourceFincer("CZML Over");
    //var CzmlOverEntities = (sourceCzmlOver ? sourceCzmlOver.entities.values : null);
    var sourceCzmlWaterLevel = sourceFincer("CZML waterLevels");
    var CzmlWaterLevelEntities = (sourceCzmlWaterLevel ? sourceCzmlWaterLevel.entities.values : null);
    var sourceWallCzml = sourceFincer("CZML Wall");
    var CzmlWallEntities = (sourceWallCzml ? sourceWallCzml.entities.values : null);
    // sourceCzmlWaterLevel.entities.values;
    if (czmlEntities) {
        checkAndAddWaterLevels(czmlEntities, postParam);
    }

    if (CzmlWaterLevelEntities) {
        var dateToCheck = postParam.timeInterval.start;
        if (!CzmlWaterLevelEntities[1].polyline.positions.intervals.contains(dateToCheck)) {
// console.log(Cesium.JulianDate.toIso8601(postParam.timeInterval.stop, 2))
            TimeSeriesOfInterest.timeSeriesId.forEach(function (series) {
                getSosDataLast14Days(series, postParam, sourceCzmlWaterLevel);
            });
        }



    }


    if (CzmlWallEntities && true == false) {

        var data = {
            "inputs": [
                {
                    "id": "sosInputData",
                    "value": '',
                    "type": "text/plain"
                },
                {
                    "id": "target",
                    "value"
                        : "https://github.com/52North/tamis/raw/master/geotiff.tiff",
                    "type": "application/geotiff"
                }
            ],
            "outputs": [
                {
                    "id": "predictions",
                    "type": "application/geotiff"
                }



            ]
        };
        var postRequestParam = {data: data, leapDays: 4,
            url: "http://tamis.dev.52north.org/tamis-rest/api/v1/services/1/processes/org.n52.wps.server.r.tamis-interpolation",
            defaultValue: "http://fluggs.wupperverband.de/sos2-tamis/service?service%3DSOS&version%3D2.0.0&request%3DGetObservation&responseformat%3Dhttp://www.opengis.net/om/2.0&observedProperty%3DSchuettmenge&procedure%3DTageswert_Prozessleitsystem&namespaces%3Dxmlns%28sams%2Chttp%3A%2F%2Fwww.opengis.net%2FsamplingSpatial%2F2.0%29%2Cxmlns%28om%2Chttp%3A%2F%2Fwww.opengis.net%2Fom%2F2.0%29&temporalFilter%3Dom%3AphenomenonTime%2C"
        }
        checkAndAddSeepage(CzmlWallEntities, data, postRequestParam, startTime);
    }

    checkAndUpdateChartTimeseries(Highcharts.charts[0], startTime, 6, showSelectionOnChart);
}
function checkAndAddWaterLevels(czmlEntities, postParam) {

    var dateToCheckStart = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
        postParam.timeInterval.start);
    var dateToCheckStop = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
        postParam.timeInterval.stop);
    setLoadingIndicator(dateToCheckStart);
    if (dateToCheckStart && !isRunning) {

        var intervals = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals._intervals;
        var postParamNew = createPostRequestParam(intervals[intervals.length - 1].stop);
        console.log("WATERLEVEL", Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2));
        loadPridictionMap(postParamNew)

    } else if (!dateToCheckStart && !dateToCheckStop && !isRunning) {
//  running = true;
        animation(false);
        //viewer.clock.shouldAnimate = false;
        // viewer.clock.canAnimate = false;
        console.log("WATERLEVEL", Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2));
        loadPridictionMap(postParam);
    } else if (!dateToCheckStart && !dateToCheckStop && isRunning) {
        animation(false);
        // viewer.clock.shouldAnimate = false;
        // viewer.clock.canAnimate = false;
    }



}
function checkAndAddSeepage(CzmlWallEntities, data, postRequestParam, startTime) {
    var postParamWall = createPostRequestParam(startTime, postRequestParam);
    var dateToCheckStart =
        CzmlWallEntities[1].model.color.intervals.contains(
        postParamWall.timeInterval.start);
    var dateToCheckStop =
        CzmlWallEntities[1].model.color.intervals.contains(
        postParamWall.timeInterval.stop);
    setLoadingIndicator(dateToCheckStart);
    if (dateToCheckStart && !isRunning2) {

        var intervals = CzmlWallEntities[1].model.color.intervals._intervals;
        var postParamNew = createPostRequestParam(intervals[intervals.length - 1].stop, postRequestParam);
        console.log("WALL", Cesium.TimeInterval.toIso8601(postParamNew.timeInterval, 2));
        loadSeepagePridictionMap(postParamNew);
    } else if (!dateToCheckStart && !dateToCheckStop && !isRunning2) {
        animation(false);
        // viewer.clock.shouldAnimate = false;
        // viewer.clock.canAnimate = false;
        console.log("WALL", Cesium.TimeInterval.toIso8601(postParamWall.timeInterval, 2));
        loadSeepagePridictionMap(postParamWall);
    } else if (!dateToCheckStart && !dateToCheckStop && isRunning2) {
        animation(false);
//viewer.clock.shouldAnimate = false;
        //   viewer.clock.canAnimate = false;
    }





}
function loadPridictionMap(postParam) {
    isRunning = true;
    ajaxgetLoop(postParam, function (input1, output1, jQxhr) {
        var output = jQxhr.getResponseHeader("Location");
        console.log(output);
        var opp = {};
        opp.url = output;
        opp.interval = postParam;
        ajaxgetLoop(opp, callajx);
    });
}
function loadSeepagePridictionMap(postParam) {
    isRunning2 = true;
    //console.log(postParam)
    ajaxgetLoop(postParam, function (input1, output1, jQxhr) {
        var output = jQxhr.getResponseHeader("Location");
        console.log(output);
        var opp = {};
        opp.url = output;
        opp.interval = postParam;
        ajaxgetLoop(opp, callajx);
    });
}
function getSosDataLast14Days(series, option, source) {

    var tomcatServer = "http://localhost:8080/tamis-proxy/proxy?requestUrl=";
    var apiUrl = "http://fluggs.wupperverband.de/sos2-tamis/api/v1/";
    var last14Days = "P14DT0h/" + Cesium.JulianDate.toIso8601(option.timeInterval.stop, 2);
    var requestParams = {
        type: "GET",
        url: tomcatServer + apiUrl + "timeseries/" + series
            + "/" + "getData?timespan=" + last14Days // "PT6h/2016-08-16TZ"  
    };
    if (source.name == "CZML waterLevels") {

        ajaxgetLoop(requestParams, function (a, requestback, c) {

            var timeStampValueJson = JSON.parse(requestback);
            var timeStampValue = timeStampValueJson.values;
            if (timeStampValue) {
                updateSosWaterTubes(timeStampValue, source, series, option);
            } else {
                s
                console.log("ERROR IN READING SOS DATA , RETRY THE REQUEST")
            }

        });
    }
}
function updateSosWaterTubes(timeStampValue, source, series, option) {

    var czmlWaterLevelEntities = source.entities;
    var entity = czmlWaterLevelEntities.getById(series);
    var cartesianOld = entity.polyline.positions.intervals.get(0).data;
    var cartesianOldToCartography = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesianOld[1]);
    var cartesianWithNewHeight = Cesium.Cartesian3.fromRadians(cartesianOldToCartography.longitude,
        cartesianOldToCartography.latitude, timeStampValue[0].value);
    var start = cartesianOld[0];
    var end = cartesianWithNewHeight;
    var optionInterval = createTimeIntervalInstanse(option.timeInterval, [start, end]);
    var descriptionInterval = createTimeIntervalInstanse(option.timeInterval,
        timeStampValue[0].value.toString());
    entity.polyline.positions.intervals.addInterval(optionInterval);
    entity.description.intervals.addInterval(descriptionInterval);
    var showInterval = createTimeIntervalInstanse(option.timeInterval, '');
    entity.availability.addInterval(showInterval);
}
function sourceFincer(sourceName) {

    for (var x = 0; x < viewer.dataSources.length; x++) {
        var modelCzmlSources = viewer.dataSources.get(x);
        if (modelCzmlSources.name === sourceName) {
            return modelCzmlSources
        }
    }
}
//call raster for a time and apply to map 
function loadRasterToMap(response, interval) {
    var rasterdata = geotif(response);
    var options = interval;
    var w1 = Math.floor(rasterdata[2][1]);
    var h1 = Math.floor(rasterdata[2][0]);
    var w2 = Math.round(rasterdata[2][1] / (10));
    var h2 = Math.round(rasterdata[2][0] / (10));
    var x_ratio = w1 / w2;
    var y_ratio = h1 / h2;
    for (var i = 0; i < h2; i++) {
        for (var j = 0; j < w2; j++) {
            var px = Math.floor(j * x_ratio);
            var py = Math.floor(i * y_ratio);
            var cellOnOrigin = (i * w2) + j;
            var id = String(cellOnOrigin);
            // var czmlSource = sourceFincer('CZML');
            //  var sourceCzmlOver = sourceFincer("CZML Over");
            var averageHeight = rasterdata[0][1][(py * w1) + px];
            var color = setColor(averageHeight);
            var colorInterval = createTimeIntervalInstanse(options.timeInterval, color);
            var showInterval = createTimeIntervalInstanse(options.timeInterval, "");
            var descriptionInterval = createTimeIntervalInstanse(options.timeInterval,
                averageHeight.toString());
            for (var x = 0; x < viewer.dataSources.length; x++) {
                var modelCzmlSources = viewer.dataSources.get(x);
                if (modelCzmlSources.name === 'CZML') {
                    if (modelCzmlSources.entities.getById(id)) {
                        var entity = modelCzmlSources.entities.getById(id);
                        updateWaterLevelEntity(entity, options, averageHeight, id, color)
                        var intervalsList = [colorInterval, showInterval, descriptionInterval];
                        updateEntityIntervals(entity, intervalsList)

                    }

                }

            }

        }
    }
    isRunning = false;
    animation(true)

    //viewer.clock.shouldAnimate = true;
    // viewer.clock.canAnimate = true;
}
function updateWaterLevelEntity(entity, options, averageHeight, id, color) {

    var transformIntervalCzml = createTimeIntervalInstanse(options.timeInterval,
        new Cesium.Cartesian3(0, 0, (averageHeight)));
    if (alphaList[id]) color.alpha = alphaList[id];
    entity.model.nodeTransformations.Y_UP_Transform.translation.intervals.addInterval(
        transformIntervalCzml);
}
function updateEntityIntervals(entity, intervals) {

    entity.model.color.intervals.addInterval(intervals[0]);
    entity.availability._intervals.push(intervals[1]);
    entity.description.intervals.addInterval(intervals[2]);
}
function createTimeIntervalInstanse(timeinterval, data) {
    var newInterval = Cesium.TimeInterval.clone(
        timeinterval);
    newInterval.data = data;
    return newInterval;
}
//add color to any czml loaded 
function czmlUpdater(dynamicObject, packet, dynamicObjectCollection, sourceUri) {
    var interval = "2016-02-02T10:00:00Z/2016-02-15T10:00:00Z";
    if (sourceUri == czml) {
//  console.log(sourceUri)
        var height = packet.position.cartographicDegrees[2];
        packet.model.nodeTransformations.Y_UP_Transform.translation = [{
                "interval": interval,
                "cartesian": [0, 0, height]//setheight(packet.position.cartographicDegrees[2])]
            },
            {
                "interval": "2016-02-15T10:00:10Z/2016-02-27T10:00:00Z",
                "cartesian": [0, 0, 275]//setheight(packet.position.cartographicDegrees[2])]
            }

            , {
                "interval": "2016-02-27T11:00:01Z/2016-03-29T10:00:00Z",
                "cartesian": [0, 0, 266]//setheight(packet.position.cartographicDegrees[2])]
            }
            , {
                "interval": "2016-03-30T11:00:01Z/2016-05-15T10:00:00Z",
                "cartesian": [0, 0, 262.5]//setheight(packet.position.cartographicDegrees[2])]
            }
        ];


        var color = setColor(height);
        color = {"rgba": [255 * color.red, 255 * color.green, 255 * color.blue, 255 * color.alpha]};
        packet.model.color = [{
                "interval": interval,
                "rgba": color.rgba
            }];
        packet.availability = interval;
        var currentPosition = packet.position.cartographicDegrees;
        packet.position.cartographicDegrees = [currentPosition[0], currentPosition[1], 0];
        packet.description = [{
                "interval": interval,
                "string": height
            }];
        positionN.push(new Cesium.Cartographic(Cesium.Math.toRadians(currentPosition[0]),
            Cesium.Math.toRadians(currentPosition[1])));
        idList.push(packet.id);
    } else if (sourceUri == czmlOver) {
//  console.log(sourceUri)
        var height = packet.position.cartographicDegrees[2];
        var heightNew = packet.position.cartographicDegrees[2] - 260
        packet.model.nodeTransformations.Y_UP_Transform.translation = [{
                "interval": interval,
                "cartesian": [0, 0, heightNew + setheight(height)]
            }];
        var color = setColor(height);
        color = {"rgba": [255 * color.red, 255 * color.green, 255 * color.blue,
                255
                    * color.alpha]};
        packet.model.color = [{
                "interval": interval,
                "rgba": color.rgba
            }];
        //packet.model. show = false
        packet.availability = interval;
        packet.description = [{
                "interval": interval,
                "string": height
            }];
        var currentPosition = packet.position.cartographicDegrees;
        packet.position.cartographicDegrees = [currentPosition[0],
            currentPosition[1], 290];
        idList.push(packet.id);
    } else if (sourceUri == waterLevelCzml) {
        var coorinates = packet.polyline.positions.cartographicDegrees;
        var julianTime = new Cesium.JulianDate.fromIso8601("2016-02-02T10:00:00Z")

        var interval = "2016-02-02T10:00:00Z/2016-02-15T10:00:00Z";
        packet.polyline.positions = [{
                "interval": interval,
                "cartographicDegrees": coorinates
            }];
        packet.description = [{
                "interval": interval,
                "string": packet.description
            }];
        packet.availability = interval;
    } else if (sourceUri == wallCzml) {
//  console.log(sourceUri)

        var intervalSeepage = "2016-02-02T10:00:00Z/2016-02-04T10:00:00Z";
        var cssColorArray = seepageCssColorArray;
        var value = packet.description;
        var color = setColor(value, 0.1, 0.2, cssColorArray);
        color.alpha = 0.6
        color = {"rgba": [255 * color.red, 255 * color.green, 255 * color.blue, 255 * color.alpha]};
        packet.model.color = [{
                "interval": intervalSeepage,
                "rgba": color.rgba
            }];
        packet.description = [{
                "interval": intervalSeepage,
                "string": value
            }];
        packet.availability = intervalSeepage;
    } else if (sourceUri == stationCzml) {
        var series = packet.id.substr(packet.id.length - 3);
        packet.description = ' <button type="button" id="infobox-button" \n\
onClick=parent.addSeriesToChart(' + series
            + ')   class="cesium-button">Add selected series to chart </button>'
            + ' <button type="button" id="infobox-button" \n\
onClick=parent.removeSeriesFromChart(' + series
            + ')   class="cesium-button">Remove selected series from chart </button>'




    }

}

function createCzml(kmlPath) {
    var czml = [{
            "id": "document",
            "name": "CZML Point",
            "version": "1.0"}];
    if (!kmlPath) var kmlPath = './data/0/inside_Tile_0_0_collada.kml';
    //    "https://raw.githubusercontent.com/amir-ba/WaterBody-Visualization-/master/HTML5Application/public_html/data/waterbody1/Tiles/0/0/pigel_Tile_0_0_collada.kml";

    var kmlFolder = kmlPath.replace(/\/[^\/]+$/, '');
    $.get(kmlPath, function (data) {

        $(data).find("Placemark").each(function (index, value) {
            var that = $(this);
            var id = that.attr("id");
            var name = that.find("name").text();
            var regex = /\d+(?=_)/ig;
            var reg = regex.exec(name);
            var cellId = reg ? reg[0] : name;
            var locationNode = that.find("Location");
            var location = [parseFloat(locationNode.find("longitude").text()),
                parseFloat(locationNode.find("latitude").text()), parseFloat(
                    locationNode.find("altitude").text())];
            var path = that.find("href").text();
            if (id) {

                var packet = {
                    "id": cellId,
                    "name": name,
                    "position": {
                        "cartographicDegrees": location
                    },
                    "model": {
                        "gltf": kmlFolder + "/" + path,
                        "colorBlendModes": "Replace",
                        "colorBlendAmount": 1,
                        "nodeTransformations": {
                            "Y_UP_Transform": {
                                "translation": [{
                                        "interval": "2016-02-15T16:00:00Z/2016-02-24T16:30:00Z",
                                        "cartesian": [0, 0, 0]


                                    }]
                            }
                        }

                    }
                }
                czml.push(packet);
            }
        });
        console.log(JSON.stringify(czml));
        return czml;
    });
}

function createCzmlFromSOS() {
    var response = {};
    var czml = [{
            "id": "document",
            "name": "CZML Point",
            "version": "1.0"}];
    var czmlWaterLevel = [{
            "id": "document",
            "name": "CZML Point",
            "version": "1.0"}];
    var timeSeriesId = TimeSeriesOfInterest.timeSeriesId;
    var tomcatServer = "http://localhost:8080/tamis-proxy/proxy?requestUrl=";
    var apiUrl = "http://fluggs.wupperverband.de/sos2-tamis/api/v1/";
    //  response.url= tomcatServer+ apiUrl+"/"+ "593";
    response.type = "GET";
    response.url = tomcatServer + apiUrl + "timeseries/";
    ajaxgetLoop(response, function (a, allTimeserisResponse, c) {
        var json = JSON.parse(allTimeserisResponse);
        json.forEach(function (series) {
            if (timeSeriesId.includes(series.id)) {
                series.station.geometry.coordinates[2] =
                    TimeSeriesOfInterest.stationsHeightCoordinates[series.station.properties.id];
                var coordinate = series.station.geometry.coordinates;
                var days14 = 14 * 24 * 60 * 60 * 1000;
                var last14Days = "P14DT1h/" + (new Date(Date.now() - days14).toISOString());
                var requestParams = {
                    type: "GET",
                    url: tomcatServer + apiUrl + "timeseries/" + series.id
                        + "/" + "getData?timespan=" + last14Days // "PT6h/2016-08-16TZ"  
                };
                //  console.log( requestParams)


                var packet1 = {
                    "id": "Station " + series.id,
                    "name": series.station.properties.label,
                    "position": {
                        "cartographicDegrees": [coordinate[0], coordinate[1], coordinate[2]]
                    },
                    "cylinder": {
                        "length": 3.0,
                        "topRadius": 0.5,
                        "bottomRadius": 0.5,
                        "material": {
                            "solidColor": {
                                "color": {
                                    "rgba": [0, 255, 0, 128]
                                }
                            }
                        },
                        //  color: Cesium.Color.DARK_GREEN
                    }
                };
                var packet2 = {
                    "id": "Water Guideline " + series.id,
                    "name": series.station.properties.label,
                    "polyline": {
                        "positions": {
                            "cartographicDegrees": [
                                coordinate[0], coordinate[1], 245,
                                coordinate[0], coordinate[1], coordinate[2]]
                        },
                        "material": {
                            "solidColor": {
                                "color": {
                                    "rgba": [30, 144, 255, 60]
                                }
                            }
                        },
                        "width": 1
                    }
                };
                czml.push(packet1);
                czml.push(packet2);
                ajaxgetLoop(requestParams, function (a, requestback, c) {
                    var timeStampValueJson = JSON.parse(requestback);
                    var timeStampValue = timeStampValueJson.values;
                    var packet3 = {
                        "id": "WaterLevel " + series.id,
                        "name": series.station.properties.label,
                        "description": timeStampValue[0].value,
                        "polyline": {
                            "positions": {
                                "cartographicDegrees": [
                                    coordinate[0], coordinate[1], 100,
                                    coordinate[0], coordinate[1], timeStampValue[0].value]
                            },
                            "material": {
                                "solidColor": {
                                    "color": {
                                        "rgba": [30, 144, 255, 255]
                                    }
                                }
                            },
                            "width": 4
                        }
                    };
                    czmlWaterLevel.push(packet3);
                });
            }

        });
        console.log(JSON.stringify(czml));
        console.log((czmlWaterLevel));
        return [czml, czmlWaterLevel];
    });
}

function setColor(height, startHeight, interval, cssColorArray) {
    var cssColorArray, interval, startHeight;
    if (typeof cssColorArray === 'undefined') cssColorArray = waterLevelColorArray

//        ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000' ,'#fff5eb','#ffffff']


    //  ['#061539', '#023858', '#045a8d', '#0570b0', '#3690c0',           '#3690c0', '#a6bddb', '#d0d1e6', '#ece7f2', '#fff7fb', '#e0f3f8'       ];
    if (typeof interval === 'undefined') interval = 0.3;
    if (typeof startHeight === 'undefined') startHeight = 260;
    var rangeIndex;
    if (height <= startHeight) {
        rangeIndex = 0;
    } else if (height > startHeight && height <= (startHeight + 1
        * interval)) {
        rangeIndex = 0;
    } else if (height > (startHeight + 1
        * interval) && height <= (startHeight + 2
        * interval)) {
        rangeIndex = 1;
    } else if (height > (startHeight + 2
        * interval) && height <= (startHeight + 3
        * interval)) {
        rangeIndex = 2;
    } else if (height > (startHeight + 3
        * interval) && height <= (startHeight + 4
        * interval)) {
        rangeIndex = 3;
    } else if (height > (startHeight + 4
        * interval) && height <= (startHeight + 5
        * interval)) {
        rangeIndex = 4;
    } else if (height > (startHeight + 5
        * interval) && height <= (startHeight + 6
        * interval)) {
        rangeIndex = 5;
    } else if (height > (startHeight + 6
        * interval) && height <= (startHeight + 7
        * interval)) {
        rangeIndex = 6;
    } else if (height > (startHeight + 7
        * interval) && height <= (startHeight + 8
        * interval)) {
        rangeIndex = 7;
    } else if (height > (startHeight + 8
        * interval) && height <= (startHeight + 9
        * interval)) {
        rangeIndex = 8;
    } else if (height > (startHeight + 9
        * interval)) {
        rangeIndex = 9;
    }
    var color = new Cesium.Color.fromCssColorString(cssColorArray[rangeIndex]);
    //color.alpha = rangeIndex/10
    return color;
}

function setheight(height, startHeight, intervals, cssColorArray) {
    if (!cssColorArray) {
//  cssColorArray = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
//   cssColorArray = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28    ];
        cssColorArray = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 14, 15, 16,
            17];
    }
    if (!intervals) {
        var interval = 0.3
    }
    if (!startHeight) {
        var startHeight = 260
    }

// var startHeight= heightIntervals[0];
//  var interval = heightIntervals[1];
//   var endHeight= heightIntervals[2];
    var rangeIndex;
    if (height <= startHeight) {
        rangeIndex = 0;
    } else if (height > startHeight && height <= (startHeight + 1
        * interval)) {
        rangeIndex = 0;
    } else if (height > (260.3) && height <= (260.6)) {
        rangeIndex = 1;
    } else if (height > (260.6) && height <= (260.9)) {
        rangeIndex = 2;
    } else if (height > (260.9) && height <= (261.2)) {
        rangeIndex = 3;
    } else if (height > (261.2) && height <= (261.5)) {
        rangeIndex = 4;
    } else if (height > (261.5) && height <= (261.7)) {
        rangeIndex = 5;
    } else if (height > (261.7) && height <= (262.0)) {
        rangeIndex = 6;
    } else if (height > (262) && height <= (262.3)) {
        rangeIndex = 7;
    } else if (height > (262.3) && height <= (262.6)) {
        rangeIndex = 8;
    } else if (height > (262.6) && height <= (262.9)) {
        rangeIndex = 9;
    } else if (height > (262.9) && height <= (263.1)) {
        rangeIndex = 10;
    } else if (height > (263.1) && height <= (263.4)) {
        rangeIndex = 11;
    } else if (height > (263.4)) {
        rangeIndex = 11;
    }

    var height = cssColorArray[rangeIndex];
    return height;
}

function geotif(RR) {

    var tiff = GeoTIFF.parse(RR);
    var image = tiff.getImage();
    var rasters = image.readRasters();
    var tiepoint = image.getTiePoints()[0];
    var pixelScale = image.getFileDirectory().ModelPixelScale;
    var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1
            * pixelScale[1]];
    var height = image.getHeight(); //geoTransform[1];
    var width = Math.abs(image.getWidth()); ///geoTransform[5]);
    var invGeoTransform = [-geoTransform[
            0] / geoTransform[1], 1 / geoTransform[1], 0, -geoTransform[3]
            / geoTransform[5], 0, 1 / geoTransform[5]];
    return [rasters, geoTransform, [height, width]];
}
//function for changing the range of the hight   

function fitRange(num, minmax) {
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min)
            + out_min;
    };
    return num.map(minmax[0], minmax[1], minmax[2], minmax[3]);
}




//function findNextIntervalTime(startTime, series, callback) {
//    findClosestData(startTime, series, series[series.length-1].x, true, function (current) {
//         var next = current + 1;
//        var lastAvailableTime =  new Cesium.JulianDate.fromDate(new Date(series[current].x));
//        var newEndTime = Cesium.JulianDate.fromDate(new Date(series[next].x));
//        callback(lastAvailableTime, newEndTime);
//
//    });
//
//
//
//}