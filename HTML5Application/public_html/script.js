/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Cesium.BingMapsApi.defaultKey =
        'ApOW9LMkerqWIVSnFauilSeaZyp8df66byy1USCTjgTdMvhb4y1iAhEsUHQfCgzq'

var s = 51.139942;
var n = 51.143203;
var w = 7.366514;
var e = 7.373476;

var viewer = new Cesium.Viewer($('#cesiumContainer')[0], {
    //   terrainExaggeration : 2.0

});
var extent = new Cesium.Rectangle.fromDegrees(w, s, e, n);
viewer.camera.setView({destination: extent})

var webMap = new WebMap3DCityDB(viewer);
webMap.activateViewChangedEvent(true);
var scene = viewer.scene;


var positionN = [];
var ellipsoid = Cesium.Ellipsoid.WGS84;
var idList = [];
var alphaList=[]
viewer.flyTo(
        viewer.dataSources.add(
                Cesium.KmlDataSource.load('./data/roadal.kml', {
                })
                ))
viewer.dataSources.add(
        Cesium.KmlDataSource.load('./data/betrieb.kml', {
        })
        )
viewer.dataSources.add(
        Cesium.KmlDataSource.load('./data/doc.kml', {
        })
        )
viewer.dataSources.add(
        Cesium.KmlDataSource.load('./data/pegel.kml', {
        })
        )



viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.showWaterEffect = true;
console.log(viewer.scene.globe)
var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://www.3dcitydb.de/3dcitydb/fileadmin/mydata/OGC_FCP1/WaterBody_Amir/terrain/'
    url: 'http://localhost/dashboard/cesium/Apps/22'
            //   url : '//assets.agi.com/stk-terrain/world'
    , requestVertexNormals: true

});
viewer.terrainProvider = terrainProvider;






// createCzml() ;

//var start = Cesium.JulianDate.fromIso8601("2016-02-01T00:00:00Z");
//var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());
//var stop = Cesium.JulianDate.fromIso8601("2016-02-27T00:00:00Z");
//var middle = Cesium.JulianDate.fromIso8601("2016-02-15T00:00:00Z");

//Make sure viewer is at the desired time.
//viewer.clock.startTime = middle.clone();
//viewer.clock.stopTime = stop.clone();
//viewer.clock.currentTime = start.clone();
//viewer.clock.ClockStep = 1;

//viewer.clock.multiplier = 50;
//viewer.timeline.zoomTo(start, stop);


czml = './data/simple2.czml';
Cesium.CzmlDataSource.updaters.push(czmlUpdater);

//czml1 = './data/aa.czml';

//var czmldataSource1 = Cesium.CzmlDataSource.load(czml1);

//viewer.dataSources.add(czmldataSource1)



var czmldataSource = Cesium.CzmlDataSource.load(czml);

viewer.dataSources.add(czmldataSource)


        .then(function (data) {

 
            var promis = Cesium.sampleTerrain(viewer.terrainProvider, 15,
                    positionN);
            promis.then(function (terrainSamplePositions) {
                var entities = data.entities;
                for (var i = 0; i < terrainSamplePositions.length; ++i) {
                    var BaseHeight =
                            terrainSamplePositions[i].height;//.toFixed(2);
                    //         console.log(BaseHeight)

                    var entity = entities.getById(
                            idList[i]);

                    var cartesianOld = entity.position._value;
                    //entity.position.getValue( currentTime);        
                    var cartesianOldToCartography =
                            ellipsoid.cartesianToCartographic(cartesianOld);
                    var newHeight2 = BaseHeight;
                    //   var newHeight2 = 290 + cartesianOldToCartography.height
                    if (BaseHeight > cartesianOldToCartography.height) {

                        //console.log(fitRange(BaseHeight-cartesianOldToCartography.height));

                        entity.model.color.intervals._intervals[0].data.alpha =
                                fitRange(BaseHeight
                                - cartesianOldToCartography.height);
                        //    entity.model.color.intervals._intervals[0].data.alpha= 0.7
alphaList[ idList[i]]= fitRange(BaseHeight
                                - cartesianOldToCartography.height);
                    }

                    //      console.log(parseFloat(cartesianOldToCartography.height).toFixed(4))
                    // entity.position.(Cesium.Cartesian3.fromRadians(cartesianOldToCartography.longitude, cartesianOldToCartography.latitude, newHeight2));



                }


            });
            viewer.clock.shouldAnimate = true;
            viewer.clock.canAnimate =
                    true;
            onTick();

        });


//node transformation of the model 
/// change position of the model 

//var rasterset = [["2016-02-01T00:00:00Z/2016-02-02T00:00:00Z", "1feb"], ["2016-02-15T00:00:00Z/2016-02-16T00:00:00Z", "28feb"], ["2016-02-26T00:00:00Z/2016-02-27T00:00:00Z", "1sep"]];

var i = 1;
$('#getNext').on('click', function () {

    if (i < rasterset.length - 1) {
        i++;
        //   callRaster(rasterset[i])
    }

});
$('#getPrevius').on('click', function () {

    if (i > 0) {
        i--
        //   callRaster(rasterset[i])
    }
});




//var startTimeWps = "2016-02-01T09:59:01.00Z";
//var endTimeWps = "2016-02-02T23:59:01.00Z";


var startTimeWps;
var endTimeWps;
var data =
        {
            "inputs": [
                {
                    "id": "timespan",
                    //     "value": "2016-02-01T10:00:00.00Z%2F2016-02-15T10:00:00.00Z",
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
        }


var url =
        "http://tamis.dev.52north.org/tamis-rest/api/v1/services/1/processes//org.n52.wps.server.r.tamis-rest-interpolation-wasserstand/"
 

// on time change

var option = {
    url: url,
    type: 'post'

};

function onTick() {

// on time change
    viewer.clock.onTick.addEventListener(function (clock) {

        //       viewer.clock.canAnimate = false;

        var entitySelect = viewer.selectedEntity;
        if (entitySelect
                && entitySelect.model.nodeTransformations.Y_UP_Transform.translation) {
            console.log(
                    entitySelect.model.nodeTransformations.Y_UP_Transform.translation.getValue(
                    clock.currentTime).z)
        }

        if (viewer.clock.shouldAnimate && viewer.clock.canAnimate) {
            //  console.log(viewer.clock.currentTime) ;

            viewer.clock.shouldAnimate = false;
            viewer.clock.canAnimate = false;
            var startTime = clock.currentTime;
            var endTime = Cesium.JulianDate.addDays(clock.currentTime, 17,
                    new Cesium.JulianDate());
            //   var  endTime = Cesium.JulianDate.addMinutes(clock.currentTime, 2280, new Cesium.JulianDate()) ;
            startTimeWps = Cesium.JulianDate.toIso8601(startTime,
                    2); // "2016-02-01T09:59:01.00Z";
            endTimeWps = Cesium.JulianDate.toIso8601(endTime,
                    2); //"2016-02-02T23:59:01.00Z";
            data.inputs[0].value = startTimeWps.substring(0, 11)
                    + "10:00:01.00Z" + "%2F" + endTimeWps.substring(0, 11)
                    + "10:00:01.00Z";
            //    console.log(startTimeWps);
            // console.log(data.inputs[0].value )
            option.data = JSON.stringify(data);

            var timeInterval = new Cesium.TimeInterval({
                start: startTime,
                stop: endTime

            });
            option.timeInterval = timeInterval;
            // viewer.clock.currentTime =  timeInterval.start;
            callRaster(option);



        }



    });
}

function ajaxgetLoop(response, callback) {
    if (!response.data)
        response.data = "";
    if (!response.type)
        response.type = "get";

    $.ajax({
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
            console.log(jqXhr, textStatus, errorThrown);
        }

    })

}

function callajx(response, rep) {
    rep = JSON.parse(rep);

    if (rep && rep.StatusInfo.Status !== "Succeeded") {

        var opt = {};
        opt.url = response;
        ajaxgetLoop(response, callajx);

    } else {

        /////   console.log(rep.StatusInfo.Output)

        // ajaxget(rep.StatusInfo.Output)
        var opt2 = {};
        opt2.url = rep.StatusInfo.Output;
        ajaxgetLoop(opt2, function (input, output) {
            var out = JSON.parse(output);
            //////    console.log(out.result[0].value);

            ajaxgetTif(out.result[0].value);

        })

    }
}

function ajaxgetTif(response) {

    // console.log(response)

    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('get', response, true);
    ajaxRequest.responseType = 'arraybuffer';
    ajaxRequest.onreadystatechange = function () {
        if (ajaxRequest.readyState === 4) {

            loadRasterToMap(ajaxRequest.response, option);


        }
    };

    ajaxRequest.send();

}

function callRaster(option) {
    //   for (var x = 0; x < viewer.dataSources.length; x++) {
    var source = viewer.dataSources.get(0);
    var dateToCheck = option.timeInterval.start;
    var entities = source.entities.values;
    //   console.log(entities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(dateToCheck))
    //    var hasInterval = entities[0].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(dateToCheck);
// console.log(hasInterval);
    if (!entities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
            dateToCheck)) {
        //    source.entities.show =false;
    }
    if (source.name === "CZML" && entities
            && entities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
            dateToCheck)) {
        viewer.clock.canAnimate = true;
        viewer.clock.shouldAnimate = true;
        //   break
    } else if (source.name === "CZML" && entities
            && !entities[1].model.nodeTransformations.Y_UP_Transform.translation.intervals.contains(
            dateToCheck)) {


        ajaxgetLoop(option, function (input1, output1, jQxhr) {

            var output = jQxhr.getResponseHeader("Location");
            console.log(output);
            ajaxgetLoop(option, function (input, output, jQxhr) {


            })
            var opp = {};
            opp.url = output;
            //  console.log(output);
            //  source.entities.show = true;
            //    console.log(source);
            ajaxgetLoop(opp, callajx);

        });

    }

    //  }




}

// call raster for a time and apply to map 
function loadRasterToMap(response, options) {
    var rasterdata = geotif(response);
    // console.log(rasterdata);
    var dataSources = viewer.dataSources;

    hash = [];

    var w1 = Math.floor(rasterdata[2][1]);
    var h1 = Math.floor(rasterdata[2][0]);

    var w2 = Math.round(rasterdata[2][1] / (10));
    var h2 = Math.round(rasterdata[2][0] / (10));
    var x_ratio = w1 / w2
    var y_ratio = h1 / h2;
    // console.log(w1, w2, h1, h2)
    //  console.log(options.timeInterval)
    for (var i = 0; i < h2; i++) {
        for (var j = 0; j < w2; j++) {
            var px = Math.floor(j * x_ratio);
            var py = Math.floor(i * y_ratio);

            hash[parseInt((i * w2) + j)] = rasterdata[0][1][(py * w1) + px];
            var cellOnOrigin = (i * w2) + j;
            var id = String(cellOnOrigin);
            var czmlEntities = dataSources.get(0).entities;
            if (czmlEntities && czmlEntities.getById(id)) {
                var entity = czmlEntities.getById(id);
                var averageHeight = rasterdata[0][1][(py * w1) + px];
                var color = setColor(averageHeight);
               color.alpha = alphaList[id]
                //  console.log(setheight( averageHeight ),averageHeight)
                //options.timeInterval.data = new Cesium.Cartesian3(0, 0,averageHeight);
               //   options.timeInterval.data = new Cesium.Cartesian3(0, 0, setheight(averageHeight));
                options.timeInterval.data = new Cesium.Cartesian3(0, 0, setheight(averageHeight));
                var colorInterval = Cesium.TimeInterval.clone(
                        options.timeInterval);
                colorInterval.data = color;
                var showInterval = new Cesium.TimeInterval({
                    start: options.timeInterval.start,
                    stop: options.timeInterval.stop

                });

                entity.model.nodeTransformations.Y_UP_Transform.translation.intervals.addInterval(
                        options.timeInterval);

                entity.model.color.intervals.addInterval(colorInterval);
                entity.availability._intervals.push(showInterval);
                var cartesianOld = entity.position._value;
                    //entity.position.getValue( currentTime);        
                var cartesianOldToCartography =
                            ellipsoid.cartesianToCartographic(cartesianOld);
                // console.log(entity.position._value.z)
               entity.position.setValue(Cesium.Cartesian3.fromRadians(cartesianOldToCartography.longitude, cartesianOldToCartography.latitude, averageHeight));
  // console.log(entity.position._value.z)

            }
        }
    }
    viewer.clock.canAnimate = true;
    viewer.clock.shouldAnimate = true;
    viewer.dataSources.get(0).entities.show = true;

}
//add color to any czml loaded 
function czmlUpdater(dynamicObject, packet, dynamicObjectCollection,
        sourceUri) {
    var height = packet.position.cartographicDegrees[2];
    // var height2 = packet.model.nodeTransformations.Y_UP_Transform.translation.cartesian[2];
    // packet.model.nodeTransformations.Y_UP_Transform.translation.cartesian[2] = height;
    var interval = "2016-02-01T10:00:00Z/2016-02-15T23:59:00Z";
    packet.model.nodeTransformations.Y_UP_Transform.translation = [{
            "interval": interval,
            "cartesian": [0, 0, setheight(
                        packet.position.cartographicDegrees[2])]
        }];
    //    console.log( packet.model.nodeTransformations.Y_UP_Transform)
    var color = setColor(height);
    color = {"rgba": [255 * color.red, 255 * color.green, 255 * color.blue, 255
                    * color.alpha]};

    //   packet.model.color =  color;
    packet.model.color = [{
            "interval": interval,
            "rgba": color.rgba
        }];
    //packet.model. show = false
    packet.availability = interval

            ;

    var currentPosition = packet.position.cartographicDegrees;
    packet.position.cartographicDegrees = [currentPosition[0],
        currentPosition[1], packet.position.cartographicDegrees[2]];
    positionN.push(new Cesium.Cartographic(Cesium.Math.toRadians(
            currentPosition[0]), Cesium.Math.toRadians(currentPosition[1])));
    idList.push(packet.id);

}



function createCzml() {
    var czml = [{
            "id": "document",
            "name": "CZML Point",
            "version": "1.0"}];
    var kmlPath =
            "https://raw.githubusercontent.com/amir-ba/WaterBody-Visualization-/master/HTML5Application/public_html/data/waterbody1/Tiles/0/0/pigel_Tile_0_0_collada.kml";
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


function setColor(height, startHeight, intervals, cssColorArray) {
    if (!cssColorArray) {
        cssColorArray = ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7",
            "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061",
            "#050861"];
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
        rangeIndex = 11;
    } else if (height > startHeight && height <= (startHeight + 1
            * interval)) {
        rangeIndex = 10;
    } else if (height > (260.3) && height <= (260.6)) {
        rangeIndex = 9;
    } else if (height > (260.6) && height <= (260.9)) {
        rangeIndex = 8;
    } else if (height > (260.9) && height <= (261.2)) {
        rangeIndex = 7;
    } else if (height > (261.2) && height <= (261.5)) {
        rangeIndex = 6;
    } else if (height > (261.5) && height <= (261.7)) {
        rangeIndex = 5;
    } else if (height > (261.7) && height <= (262.0)) {
        rangeIndex = 4;
    } else if (height > (262) && height <= (262.3)) {
        rangeIndex = 3;
    } else if (height > (262.3) && height <= (262.6)) {
        rangeIndex = 2;
    } else if (height > (262.6) && height <= (262.9)) {
        rangeIndex = 1;
    } else if (height > (262.9) && height <= (263.1)) {
        rangeIndex = 1;
    } else if (height > (263.1) && height <= (263.4)) {
        rangeIndex = 0;
    } else if (height > (263.4)) {
        rangeIndex = 0;
    }

    var color = new Cesium.Color.fromCssColorString(cssColorArray[rangeIndex]);
    return color;
}




function setheight(height, startHeight, intervals, cssColorArray) {
    if (!cssColorArray) {
        cssColorArray = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
        cssColorArray = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28,
            32, 36, 40, 44, 48, 52];
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
    var height = image.getHeight() //geoTransform[1];
    var width = Math.abs(image.getWidth())///geoTransform[5]);
    var invGeoTransform = [-geoTransform[
                0] / geoTransform[1], 1 / geoTransform[1], 0, -geoTransform[3]
                / geoTransform[5], 0, 1 / geoTransform[5]];
    return [rasters, geoTransform, [height, width]]

}
//function for changing the range of the hight   

function fitRange(num) {
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min)
                + out_min;
    };
    return num.map(0, 20, 0.2, 0.8);

}