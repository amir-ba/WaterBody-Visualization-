/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */





function onTick() {

    var gauge = Highcharts.charts[1];

    var position = $("#container1").offset();
    createGaugeOnMap(gauge, position);

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
            showSelectionOnChart = selectedEntity;
            Selectionbutton(selectedEntity);

        }
        if (viewer.clock.shouldAnimate && viewer.clock.canAnimate) {

            var compare = Cesium.JulianDate.compare(startTime, Cesium.JulianDate.fromDate(new Date(2017, 01, 1)))
            if (compare < 0) callRaster(startTime, showSelectionOnChart);

        }
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
    var notExeedToday = Cesium.JulianDate.compare(endTime, new Cesium.JulianDate.now);
    var notExeedTimeFrame = Cesium.JulianDate.compare(endTime, viewer.clock.stopTime);
  ////  console.log(notExeedTimeFrame)
    if (notExeedToday < 0 && notExeedTimeFrame < 17) {
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
    } else {
        return null
    }
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
        if (postParam) {
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
        }
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

        updateGaugeValue(czmlEntities, postParam.timeInterval.start);

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
    // if (sourceWallCzml.show) console.log(sourceWallCzml.show)

    if (CzmlWallEntities && sourceWallCzml.show) {
        // CzmlWallEntities.show = true;

        //console.log(111)
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

    setLoadingIndicator(dateToCheckStart, 'waterlevel');
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
    setLoadingIndicator(dateToCheckStart, "seepage");
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
    if (postParam) {
        ajaxgetLoop(postParam, function (input1, output1, jQxhr) {
            var output = jQxhr.getResponseHeader("Location");
            console.log(output);
            var opp = {};
            opp.url = output;
            opp.interval = postParam;
            ajaxgetLoop(opp, callajx);
        });
    }
}
function loadSeepagePridictionMap(postParam) {
    isRunning2 = true;
    //console.log(postParam)
    if (postParam) {
        ajaxgetLoop(postParam, function (input1, output1, jQxhr) {
            var output = jQxhr.getResponseHeader("Location");
            console.log(output);
            var opp = {};
            opp.url = output;
            opp.interval = postParam;
            ajaxgetLoop(opp, callajx);
        });
    }
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
            if (timeStampValue.length) {

                updateSosWaterTubes(timeStampValue, source, series, option);
            } else {

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



 