/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */
//grlobal variables 

//extend
var s = 51.139942;
var n = 51.143203;
var w = 7.366514;
var e = 7.373476;
//
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
var waterLevelColorArray = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1',
    '#4575b4', '#313695']
waterLevelColorArray = waterLevelColorArray.reverse()
//  ['#006837', '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43', '#d73027', '#a50026'];
var chartColorArray = ['#F5D156', '#D1AC91', '#50B1B5', '#84B14A', '#E75E37', '#D13074', '#51879F', '#5A7147',
    '#0E5A81', '#DE9C90'];
var seepageCssColorArray =
    ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221',
        '#276419']
//['#40004b','#762a83','#9970ab','#c2a5cf','#e7d4e8','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b']    //['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858','#03253a'];
seepageCssColorArray = seepageCssColorArray.reverse()
 

Cesium.BingMapsApi.defaultKey = 'ApOW9LMkerqWIVSnFauilSeaZyp8df66byy1USCTjgTdMvhb4y1iAhEsUHQfCgzq';
var viewer = new Cesium.Viewer($('#cesiumContainer')[0], {
    // terrainExaggeration : 1.2
    skyBox: false,
    skyAtmosphere: false    
    , contextOptions: {
        webgl: {
            alpha: false
        }
    }
});
var extent = new Cesium.Rectangle.fromDegrees(w, s, e, n);
viewer.camera.setView({destination: extent});
var webMap = new WebMap3DCityDB(viewer);
webMap.activateViewChangedEvent(true);
var scene = viewer.scene;
viewer.scene.backgroundColor = Cesium.Color.BLACK;
viewer.scene.globe.orderIndependentTranslucency=false
//Set the globe base color to transparent
//viewer.scene.globe.baseColor = Cesium.Color.BLACK;
//viewer.scene.fxaa = true;
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
    Cesium.KmlDataSource.load('./data/underground2.kml', {
    })
    );

viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.showWaterEffect = true;
viewer.scene.globe.enableLighting = true;
// add terrain
var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://www.3dcitydb.de/3dcitydb/fileadmin/mydata/OGC_FCP1/WaterBody_Amir/terrain/'
     url: 'http://localhost/dashboard/cesium/Apps/terrain'
        //      url : '//assets.agi.com/stk-terrain/world'
    , requestVertexNormals: true
        //,ellipsoid: new Cesium. Ellipsoid(2000+6378137.0, 2000+6378137.0,2000+ 6356752.3142451793)

});
viewer.terrainProvider = terrainProvider;
//add czml data 




console.log(viewer)



function addAllButtonFunctionalities() {

    toggleElement('#cesiumbuttonlegend', '#legends');
    //  toggleElement('#cesiumbuttongauge', '#container1');
    toggleGauge('#cesiumbuttongauge')
    toggleLayer('#cesiumbuttonwps', "CZML");
    toggleLayer('#cesiumbuttonsos', "CZML waterLevels");
    toggleLayer('#cesiumbuttonwpswall', "CZML Wall");
    toggleDepthVisiality('#cesiumbuttondepth');
    SelectionButtonClickClassChange('#selection-button');
}




// style editers
function callSeriesManager(chart) {
    chart = Highcharts.charts[0];

    $('#series-remove-button').click(function () {
        createGaugeOnMap();

        var selectedSeriesId = $('#select-list').find(":selected") [0].value;

        removeSeriesFromChart(selectedSeriesId);
        emptyChartText();

    });
    $('#series-add-button').click(function () {

        var selectedSeriesId = $('#select-list').find(":selected") [0].value;
        if (selectedSeriesId != "Select TimeSeries") addSeriesToChart(selectedSeriesId);
        emptyChartText();
        // emptyChartText(chart);             

    });
}

function setLoadingIndicator(dataExists, elementClass) {

    if (dataExists) {
        $('#status').removeClass(elementClass);
        if (!($('#status').hasClass("waterlevel")) && !($('#status').hasClass("seepage"))) {
            // $('#status').css('display', 'none');

            $('#status').addClass("hide")
        }


    } else {
        //    $('#status').css('display', 'block');
        $('#status').removeClass("hide")

        $('#status').addClass(elementClass)
    }


}
function emptyChartText(series) {
    if (!series) series = Highcharts.charts[0].series.length
    var x = $('#start-text');
    if (series > 0) {
        x.css('display', 'none');
    } else {
        x.css('display', 'block');
    }


}
function deSelectionButton() {
    removeSeriesFromChart("Selected");
    viewer.selectedEntity = null
    emptyChartText();

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
function displaySelectionButton(button, intervals) {


    $(button).click(function (event) {

        var $this = $(this);
        if ($this.hasClass('on')) {


            displaySelectedOnChart(intervals);
            //    event.stopPropagation();
        }

    });

}
function SelectionButtonClickClassChange(button) {

    $('#selection-button-dummy').click(function (e) {
        //  console.log(e)
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
function toggleElement(buttonId, elementId) {
    $(buttonId).click(function () {
        var x = $(elementId);
        if (x.css('display') === 'block') {
            x.css('display', 'none');
        } else {
            x.css('display', 'block');
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
function toggleGauge(buttonId) {
    $(buttonId).click(function () {
        var gauge = viewer.entities.getById("gauge")
        if (gauge) gauge.show = !gauge.show;
        var checked = $(buttonId).find('input[type="checkbox"]') [0].checked
        $(buttonId).find('input[type="checkbox"]') [0].checked = !checked

    })
}















 