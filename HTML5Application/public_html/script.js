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



};

var positionN = [];
var idList = [];
var alphaList = [];

var isRunning = false;
var isRunning2 = false;

//var loadingSeepage = false;

 var seepageCssColorArray = ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837']


// code to create the czml from sos data or the 3DCityDb
//var path = "https://raw.githubusercontent.com/amir-ba/WaterBody-Visualization-/master/HTML5Application/public_html/data/wall/Tiles/0/0/wall_Tile_0_0_collada.kml";
//console.log(createCzml(path)) ;
//createCzmlFromSOS() ;   

Cesium.BingMapsApi.defaultKey = 'ApOW9LMkerqWIVSnFauilSeaZyp8df66byy1USCTjgTdMvhb4y1iAhEsUHQfCgzq';
var viewer = new Cesium.Viewer($('#cesiumContainer')[0], {
    //   terrainExaggeration : 2.0

});
var extent = new Cesium.Rectangle.fromDegrees(w, s, e, n);
viewer.camera.setView({destination: extent});
var webMap = new WebMap3DCityDB(viewer);
webMap.activateViewChangedEvent(true);
var scene = viewer.scene;


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


viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.showWaterEffect = true;
viewer.scene.globe.enableLighting = true;
// add terrain
var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://www.3dcitydb.de/3dcitydb/fileadmin/mydata/OGC_FCP1/WaterBody_Amir/terrain/'
    url: 'http://localhost/dashboard/cesium/Apps/22'
        //   url : '//assets.agi.com/stk-terrain/world'
    , requestVertexNormals: true

});
viewer.terrainProvider = terrainProvider;


  
//add czml data 
Cesium.CzmlDataSource.updaters.push(czmlUpdater);

var czmldataSourceWaterBodyUnder = Cesium.CzmlDataSource.load(czml);
//var czmldataSourceWaterBodyover = Cesium.CzmlDataSource.load(czmlOver);
var czmldataSourceStations = Cesium.CzmlDataSource.load(stationCzml);
var czmldataSourcewaterLevel = Cesium.CzmlDataSource.load(waterLevelCzml);
var czmldataSourceWall = Cesium.CzmlDataSource.load(wallCzml);


viewer.dataSources.add(czmldataSourceStations);
//viewer.dataSources.add(czmldataSourceWaterBodyover);
viewer.dataSources.add(czmldataSourceWall) 

viewer.dataSources.add(czmldataSourcewaterLevel).then(function () {
    viewer.dataSources.add(czmldataSourceWaterBodyUnder).then(function (data) {
        var promis = Cesium.sampleTerrain(viewer.terrainProvider, 15,
            positionN);
        promis.then(function (terrainSamplePositions) {
            var entities = data.entities;
            console.log(terrainSamplePositions.length);

            for (var i = 0, j = terrainSamplePositions.length; i < j; ++i) {
                var BaseHeight = terrainSamplePositions[i].height;//.toFixed(2);
                var entity = entities.getById(idList[i]);
                //    console.log(entity)
                var oldHeight = entity.model.nodeTransformations.Y_UP_Transform.translation.intervals.get(0).data.z;
                if (BaseHeight > oldHeight) {
                  //  console.log(oldHeight - BaseHeight)
                    if (oldHeight - BaseHeight < -35 && parseInt(entity.id)<360) {
                        //           console.log(BaseHeight -oldHeight)

                        alphaList[ idList[i]] = fitRange(oldHeight - BaseHeight, [-49, -30, 0.4, 0.5]);
                    } else {
                        alphaList[ idList[i]] = fitRange(oldHeight - BaseHeight, [-35, 0, 0.3, 0.85]);
                    }
                    entity.model.color.intervals._intervals[0].data.alpha = alphaList[ idList[i]];
                }
            }
            viewer.clock.shouldAnimate = true;
            viewer.clock.canAnimate = true;
            onTick();

        });

    });
});


function seepageTifToGltf(request,interval) {
   // var interval = "2016-02-02T10:00:00Z/2016-02-04T10:00:00Z";
    var rasterdata = geotif(request);
    var options = interval;
//    var cssColorArray = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9',   '#74add1', '#4575b4', '#313695'];
    var cssColorArray = seepageCssColorArray ;
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
    viewer.clock.shouldAnimate = true;
    viewer.clock.canAnimate = true;

}

function setLoadingIndicator(testVarible) {

    if (!testVarible) {
        $('#status').css('display', 'block');
    } else {
        $('#status').css('display', 'none');
    }


}
function onTick() {
toggleLegends('#cesiumbuttonlegend' )

    toggleLayer('#cesiumbuttonwps', "CZML");
    toggleLayer('#cesiumbuttonsos', "CZML waterLevels");
    toggleLayer('#cesiumbuttonwpsover', "CZML Over");
    toggleLayer('#cesiumbuttonwpswall', "CZML Wall");
    toggleDepthVisiality('#cesiumbuttondepth');

    // on time change
    viewer.clock.onTick.addEventListener(function (clock) {
        if (viewer.clock.shouldAnimate && viewer.clock.canAnimate) {
            var startTime = clock.currentTime;

            callRaster(startTime);

        }
    });
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
    startTime = Cesium.JulianDate.addMinutes(startTime, 1, new Cesium.JulianDate());
    var endTime = Cesium.JulianDate.addDays(startTime, param.leapDays, new Cesium.JulianDate());
    var startTimeWps = Cesium.JulianDate.toIso8601(startTime, 2); // "2016-02-01T09:59:01.00Z";
    var endTimeWps = Cesium.JulianDate.toIso8601(endTime, 2); //"2016-02-02T23:59:01.00Z";
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
function toggleLegends(buttonId){
    $(buttonId).click(function () {
         var x = $('#legends');
 if (x.css('display')==='none'){
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
        $(elementID).find('input[type="checkbox"]') [0].checked = !checked
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

    var request = {
        url: response.url,
        dataType: 'text',
        type: response.type,
        data: response.data,
        contentType: 'application/json',
        success: function (data, textStatus, jQxhr) {
            //               console.log( data, textStatus, jQxhr );

            callback(response, data, jQxhr);

        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
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
            console.log(Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2))

            console.log(output);

            var opp = {};
            opp.url = output;
            opp.interval = postParam;
            opp.repeat = repeat;

            ajaxgetLoop(opp, callajx);
        });

    } else if (rep.StatusInfo.Status === "Accepted") {

        viewer.clock.shouldAnimate = false;
        viewer.clock.canAnimate = false;
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
    }
    try {
        if (rep.StatusInfo.Status === "Accepted")
            throw "POST REQUEST NOT SUCCESSFUL. RETUREND Accepted INSTEAD OF SUCCEEDED";
        if (rep.StatusInfo.Status === "Failed")
            throw "POST REQUEST NOT SUCCESSFUL. RETUREND Failed INSTEAD OF SUCCEEDED";
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
            if (linkUrl.indexOf(waterLevelWpsResult)!=-1) {
                loadRasterToMap(ajaxRequest.response, interval);

            } else if (linkUrl.indexOf(seepageWpsResult)!=-1) {
                //  console.log(out.result[0].value)
                seepageTifToGltf(ajaxRequest.response, interval)

            }

        }
    };
    ajaxRequest.send();
}

function callRaster(startTime) {

    var postParam = createPostRequestParam(startTime);

    // var stationEntities = stations.entities.values;
    var sourceCzml = sourceFincer("CZML");
    var czmlEntities= sourceCzml.entities.values;
    var sourceCzmlOver = sourceFincer("CZML Over");
    var CzmlOverEntities = (sourceCzmlOver ? sourceCzmlOver.entities.values : null);
    var sourceCzmlWaterLevel = sourceFincer("CZML waterLevels");
    var CzmlWaterLevelEntities = (sourceCzmlWaterLevel ? sourceCzmlWaterLevel.entities.values : null);
    var sourceWallCzml = sourceFincer("CZML Wall");
    var CzmlWallEntities = (sourceWallCzml ? sourceWallCzml.entities.values : null);

    // sourceCzmlWaterLevel.entities.values;
    if (czmlEntities) {
        var dateToCheckStart = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
            postParam.timeInterval.start);
        var dateToCheckStop = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
            postParam.timeInterval.stop);
        setLoadingIndicator(dateToCheckStart);

        if (dateToCheckStart && !isRunning) {

            var intervals = czmlEntities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals._intervals;
            var postParamNew = createPostRequestParam(intervals[intervals.length - 1].stop);

            console.log("WATERLEVEL",Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2));

               loadPridictionMap(postParamNew)

        } else if (!dateToCheckStart && !dateToCheckStop && !isRunning) {
            //  running = true;
            viewer.clock.shouldAnimate = false;
            viewer.clock.canAnimate = false;
          console.log("WATERLEVEL",Cesium.TimeInterval.toIso8601(postParam.timeInterval, 2));
             loadPridictionMap(postParam);
        } else if (!dateToCheckStart && !dateToCheckStop && isRunning) {
            viewer.clock.shouldAnimate = false;
            viewer.clock.canAnimate = false;
        }
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


    if (CzmlWallEntities) {

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
          //  console.log("WALL",Cesium.TimeInterval.toIso8601(postParamNew.timeInterval, 2));
          loadSeepagePridictionMap(postParamNew);

        } else if (!dateToCheckStart && !dateToCheckStop && !isRunning2) {
              
            viewer.clock.shouldAnimate = false;
            viewer.clock.canAnimate = false;
         //   console.log("WALL",Cesium.TimeInterval.toIso8601(postParamWall.timeInterval, 2));
         loadSeepagePridictionMap(postParamWall);
        } else if (!dateToCheckStart && !dateToCheckStop && isRunning2) {
            viewer.clock.shouldAnimate = false;
            viewer.clock.canAnimate = false;
        }
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

        });
    }
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
            var czmlSource = sourceFincer('CZML');
            var sourceCzmlOver = sourceFincer("CZML Over");
            //   var czmlEntities = czmlSource.entities;
            //  var CzmlOverEntities =  (sourceCzmlOver ? sourceCzmlOver.entities.values : null);  
            //sourceCzmlOver.entities;
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
                        var transformIntervalCzml = createTimeIntervalInstanse(options.timeInterval,
                            new Cesium.Cartesian3(0, 0, (averageHeight)));
                        if (alphaList[id]) color.alpha = alphaList[id];
                        entity.model.nodeTransformations.Y_UP_Transform.translation.intervals.addInterval(
                            transformIntervalCzml);
                        entity.model.color.intervals.addInterval(colorInterval);
                        entity.availability._intervals.push(showInterval);
                        entity.description.intervals.addInterval(descriptionInterval);
                    }

                }

                if (modelCzmlSources.name === "CZML Over") {
                    if (modelCzmlSources.entities.getById("u" + id)) {

                        var entity1 = modelCzmlSources.entities.getById("u" + id);

                        var transformIntervalCzmlOver = createTimeIntervalInstanse(options.timeInterval,
                            new Cesium.Cartesian3(0, 0, (averageHeight - 260)));
                        entity1.model.nodeTransformations.Y_UP_Transform.translation.intervals.addInterval(
                            transformIntervalCzmlOver);
                        var colorOver = setColor(averageHeight);
                        colorOver.alpha = 1;
                        var colorInterval1 = createTimeIntervalInstanse(options.timeInterval, colorOver);
                        //   colorInterval1.data.alpha=1
                        entity1.model.color.intervals.addInterval(colorInterval1);
                        entity1.availability._intervals.push(showInterval);
                        entity1.description.intervals.addInterval(descriptionInterval);

                    }

                }

            }

            //       px = j * x_ratio;
            //          py = i * y_ratio;
//drawSickerWasser(rasterdata, px, py, x_ratio, y_ratio,color,id);
//console.log(viewer.scene.primitives);
        }
    }
    isRunning = false;
    viewer.clock.shouldAnimate = true;
    viewer.clock.canAnimate = true;
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
            }];
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
    } 
    else if (sourceUri == wallCzml) {
        //  console.log(sourceUri)

        var intervalSeepage = "2016-02-02T10:00:00Z/2016-02-04T10:00:00Z";
 var cssColorArray = seepageCssColorArray;
        var value = packet.description;
       
                var color =  setColor(value, 0.1, 0.2, cssColorArray);

         color.alpha = 0.6
        color = {"rgba": [255 * color.red, 255 * color.green, 255 * color.blue, 255 *  color.alpha]};
        packet.model.color = [{
                "interval": intervalSeepage,
                "rgba": color.rgba
            }];
        packet.description = [{
                "interval": intervalSeepage,
                "string": value
            }];
        packet.availability = intervalSeepage;
 
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
                                coordinate[0], coordinate[1], 100,
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
    if (typeof cssColorArray === 'undefined') cssColorArray = 
       ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858','#03253a'] ;
    
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
        * interval) ) {
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
    var width = Math.abs(image.getWidth());///geoTransform[5]);
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