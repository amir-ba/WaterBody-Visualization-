/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */
 
 
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


var czmlIntervals = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals
    var dateToCheckStart =czmlIntervals .contains(   postParam.timeInterval.start);
    var dateToCheckStop = czmlIntervals.contains(  postParam.timeInterval.stop);
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


  

 

///functions


function removeSeriesFromChart(selectedSeriesId) {
    Highcharts.charts[0].series.forEach(function (dataSeries) {
        if (dataSeries.name === selectedSeriesId) {
            dataSeries.remove();
        }
        console.log(Highcharts.charts[0])
    });
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
        credits:{
            enabled:false
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
            enabled:false
              
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
$('.highcharts-button').css('display', 'none');
 
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
function addSeriesToChart(selectedSeriesId,callback) {
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
    if (callback) callback()
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



 