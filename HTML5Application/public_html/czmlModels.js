/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */

function czmlUpdater(dynamicObject, packet, dynamicObjectCollection, sourceUri) {
    var interval = "2016-02-02T10:00:00Z/2016-02-15T10:00:00Z";
    if (sourceUri == czml) {
//  console.log(sourceUri)
        var height = packet.position.cartographicDegrees[2];
        packet.model.nodeTransformations.Y_UP_Transform.translation = [{
                "interval": interval,
                "cartesian": [0, 0, height]//setheight(packet.position.cartographicDegrees[2])]
            } ];


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

function fitRange(num, minmax) {
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min)
            + out_min;
    };
    return num.map(minmax[0], minmax[1], minmax[2], minmax[3]);
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
        if (BaseHeight - oldHeight ) {
//   console.log( BaseHeight )
            alphaList[ idList[i]] = fitRange(BaseHeight, [270, 300, 0.7, 0.5]);
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
                image: './data/basewhite1.png',
                transparent: true,
                alpha: 0.1
            })
            ,
            height: 200
        }
    });
    viewer.scene.screenSpaceCameraController.minimumTrackBallHeight = 270;
    viewer.scene.screenSpaceCameraController.minimumCollisionTerrainHeight = 270;
     viewer.scene.screenSpaceCameraController.minimumPickingTerrainHeight = 270


}

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
 //   loadChartData(4, '2016-02-01', '592');
    updateTimeSeriesList();
    drawGauge();
 
});
viewer.dataSources.add(czmldataSourceWall).then(function (entities) {
         entities.show=false
    
    
});
viewer.dataSources.add(czmldataSourcewaterLevel).then(function () {
    viewer.dataSources.add(czmldataSourceWaterBodyUnder).then(function (data) {
        var promis = Cesium.sampleTerrain(viewer.terrainProvider, 15,
            positionN);
        promis.then(function (terrainSamplePositions) {
            var entities = data.entities;
                
           // console.log(terrainSamplePositions.length);
            setOpacityBasedOnElevation(terrainSamplePositions, entities)
            AddUndergroundLayer();
            animation(true);
            addAllButtonFunctionalities();
          onTick();
        });
    });
});
//

 






/////creaters
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

 