/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint white: true plusplus: true*/
/*global Cesium */

///functions
function removeSeriesFromChart(selectedSeriesId) {
    Highcharts.charts[0].series.forEach(function (dataSeries) {
        if (dataSeries.name === selectedSeriesId) {
            dataSeries.remove();
        }
        //  console.log(Highcharts.charts[0])
    });
}
function drawGauge() {

//
    Highcharts.chart('container1', {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            backgroundColor: null,
            spacingTop: 0,
            spacingLeft: 0,
            spacingRight: 0,
            spacingBottom: 0
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        pane: {
            startAngle: -90,
            endAngle: 90,
            center: ['50%', '100%']
            , background: [{
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '99%',
                    innerRadius: '98%'
                }]
        },
        // the value axis
        yAxis: {
            min: 260,
            max: 265,
            minorTickInterval: 'auto',
            minorTickWidth: 0.5,
            minorTickLength: 5,
            minorTickPosition: 'inside',
            minorTickColor: '#666',
            tickInterval: 2,
            tickPixelInterval: 20,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto',
                style: {
                    fontSize: '13px'
                }

            },
            title: {
                text: 'Mean Water Level <br>on the air side <br> (mNHN)'
            },
            plotBands: [{
                    from: 260,
                    to: 260.6,thickness: '11%',
                    color: '#4575b4'  // green 
                }, {
                    from: 260.6,
                    to: 260.9,thickness: '11%',
                       thickness: '11%',
                    color: '#e0f3f8' // yellow
                }, {
                    from: 260.9,
                    to: 261.2,  thickness: '11%',
                    color: '#fee090' // red
                }, {
                    from: 261.2,
                    to: 261.5,  thickness: '11%',
                    color: '#fdae61' // red
                }
                , {
                    from: 261.5,
                    to: 261.8,  thickness: '11%',
                    color: '#fdae61' // yellow
                }, {
                    from: 261.8,
                    to: 262.1,  thickness: '11%',
                    color: '#f46d43' // yellow
                }
                , {
                    from: 262.1,
                    to: 262.4,  thickness: '11%',
                    color: '#d73027' // yellow
                }
                , {
                    from: 262.4,
                    to: 262.7,  thickness: '11%',
                    color: '#d73027' // yellow
                },
                {
                    from: 262.7,
                    to: 290.,  thickness: '11%',
                    color: '#a50026' // yellow
                }

            ]
        },
        series: [{
                name: 'Mean Level',
                data: [260],
                dataLabels: {
                    y: -45 ,
                     fontSize: '22px',
                },
                tooltip: {
                    fontSize: '22px',
                    pointFormat: 'Mean Level:{point.y}'
                }

            }]


    })



// Add some life

    $('.highcharts-container ').css("z-index", "1")
    $('.highcharts-button').css('display', 'none');
    $(".highcharts-container").css('overflow', 'visible');
    $(".highcharts-tooltip").css('overflow', 'visible');
   // $(".highcharts-tooltip").css('font-size', '10px');
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
                        ' </td>' + '<td style="text-align: right"><b>' + ':' + Highcharts.numberFormat(point.y, 2)
                        + ' mNHN</b></td></tr>'
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
    //  addChartCrosshairs(chart);
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
function addSeriesToChart(selectedSeriesId) {
    var chart = Highcharts.charts[0];
    var duplicateCheck;
    //   console.log(selectedSeriesId)
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
        emptyChartText(chart.series.length)
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

            } else if ((chart.series.length - 1) === index) {
                emptyChartText(chart.series.length)
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
            //   console.log(interval.timestamp, interval.value, timeseries)
            addChartSeries(chart, interval.timestamp, interval.value, timeseries)
        })
    });
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
                        console.log(seriesofIntreest.name)
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
    if (chart.xAxis[0].plotLinesAndBands.length === 1)// && chart.xAxis[0].plotLinesAndBands[0].id === 1)
    {

        var left = $('span.cesium-timeline-icon16').offset().left;
        var extend = $('.cesium-viewer-animationContainer').width();
        var leftZero = left - extend + 8;
//                 $(".highcharts-plot-lines-0")["0"].childNodes["0"].attributes[3].value = "M "+leftZero+" "+0+" L "+leftZero+" 80" ;
        chart.xAxis[0].plotLinesAndBands[0].svgElem.attr({
            d: "M " + leftZero + " " + 0 + " L " + leftZero + " 100"

        });
    } else if (chart.xAxis[0].plotLinesAndBands.length === 0) {
        chart.xAxis[0].addPlotLine({
            value: chart.xAxis[0].min, //Date.parse(Cesium.JulianDate.toIso8601(currentTime)),
            width: 3,
            color: 'red',
            id: 1

        });
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

function updateGaugeValue(czmlentities, timestamp, callback) {
    var sum = 0;
    var curentValue = (Highcharts.charts[1].series[0].points[0]) ? Highcharts.charts[1].series[0].points[0].y : 0;
    czmlentities.forEach(function (entity, index) {
        var intervals = entity.model.nodeTransformations.Y_UP_Transform.translation.intervals
        var data = intervals.findDataForIntervalContainingDate(timestamp)
        if (data) sum = sum + data.z;

        if (czmlentities.length - 1 === index) {
            var mean = roundNumber(sum / czmlentities.length, 2);
              if (sum > 0 && mean != curentValue) {
              //  console.log(sum, curentValue)
                Highcharts.charts[1].series[0].points[0].update(mean);
                updategauge();



            }

            if (callback) callback();
        }

    })

}

function roundNumber(num, scale) {
   
    if (!("" + num) .indexOf("e") != -1) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}
function createGaugeOnMap(chart, position) {
    var element = $("#cesiumbuttongauge");
    var geoOverlay = $("#container1")[0];
    var svg = "data:image/svg+xml," + Highcharts.charts[1].getSVG();
    var anchor = Cesium.Cartesian3.fromDegrees(7.365249, 51.142939, 320);
    var tmp = new Cesium.Cartesian2();

    var svgString = svg //svgDataDeclare +svgPrefix + svgCircle + svgSuffix;
    if (!viewer.entities.getById("gauge")) {
        var redBox = viewer.entities.add({
            id: "gauge",
            name: 'Red box with black outline',
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([ 
                   7.366945, 51.142925, 290.0,7.368425, 51.142589, 290.0]),
                minimumHeights: [300, 300],
                maximumHeights: [400, 400],
                material: new Cesium.ImageMaterialProperty({
                    image: "data:image/svg+xml," + Highcharts.charts[1].getSVG(),
                    transparent: true
                })    //  "data:image/svg+xml," +            Highcharts.charts[1].getSVG()// './data/legend.png' 
            }


        });
    }
//    viewer.scene.preRender.addEventListener(function () {
//        if (element.find('input[type="checkbox"]') [0].checked) {
//            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(viewer.scene.camera.positionWC);
//            //  console.log(cartographic, viewer.scene.camera.positionWC)
//            var result = SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, anchor, tmp)
//            //  var result = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, anchor, tmp);
//            if (Cesium.defined(result) && Cesium.defined(cartographic) && cartographic.height < 800
//                && cartographic.height
//                > 250) {
//                geoOverlay.style.display = 'block';
//                geoOverlay.style.top = tmp.y - 65 + 'px'; //position.top+
//                geoOverlay.style.left = tmp.x - 65 + 'px'; //position.right+
//            } 
//            else {
//                geoOverlay.style.display = 'none';
//            }
//            
//         
//   
//
//        
//        }
//    });
}

function updategauge() {
 
    if (viewer.entities.getById("gauge")) {
        viewer.entities.remove(viewer.entities.getById("gauge"))
        var redBox = viewer.entities.add({
            id: "gauge",
            name: 'Red box with black outline',
            wall: {
                 positions: Cesium.Cartesian3.fromDegreesArrayHeights([ 
                   7.366945, 51.142925, 290.0,7.368425, 51.142589, 290.0]),
                minimumHeights: [300, 300],
                maximumHeights: [400, 400],
                material: new Cesium.ImageMaterialProperty({
                    image: "data:image/svg+xml," + Highcharts.charts[1].getSVG(),
                    transparent: true
                })
            }


        });


        ;
    }
}

//// loading referenced Cesium classes
//var BoundingRectangle = Cesium.BoundingRectangle;
//var Cartesian2 = Cesium.Cartesian2;
//var Cartesian3 = Cesium.Cartesian3;
//var Cartesian4 = Cesium.Cartesian4;
//var Cartographic = Cesium.Cartographic;
//var defined = Cesium.defined;
//var DeveloperError = Cesium.DeveloperError;
//var CesiumMath = Cesium.CesiumMath;
//var Matrix4 = Cesium.Matrix4;
//var SceneMode = Cesium.SceneMode;
//
///**
// *
// * @namespace
// * @alias SceneTransforms
// */
//var SceneTransforms = {};
//
//var actualPositionScratch = new Cartesian4(0, 0, 0, 1);
//var positionCC = new Cartesian4();
//var viewProjectionScratch = new Matrix4();
//
//
//
//
//SceneTransforms.wgs84ToWindowCoordinates = function (scene, position, result) {
//    //>>includeStart('debug', pragmas.debug);
//    if (!defined(scene)) {
//        throw new DeveloperError('scene is required.');
//    }
//    if (!defined(position)) {
//        throw new DeveloperError('position is required.');
//    }
//    //>>includeEnd('debug');
//
//    // Transform for 3D, 2D, or Columbus view
//    var actualPosition = SceneTransforms.computeActualWgs84Position(scene.frameState, position, actualPositionScratch);
//
//    if (!defined(actualPosition)) {
//        return undefined;
//    }
//
//    // View-projection matrix to transform from world coordinates to clip coordinates
//    var camera = scene.camera;
//    var viewProjection = Matrix4.multiply(camera.frustum.projectionMatrix, camera.viewMatrix, viewProjectionScratch);
//    Matrix4.multiplyByVector(viewProjection, Cartesian4.fromElements(actualPosition.x, actualPosition.y,
//        actualPosition.z, 1, positionCC), positionCC);
//
//    // TODO ------> 3DCityDB-Web-Map Modificaion compared to the Cesium-Version 1.16
//    if ((positionCC.z < 0) && (scene.mode !== SceneMode.SCENE2D)) {
//        //    return undefined;
//        positionCC.y = 0 - positionCC.y;
//    }
//    // <-----------
//
//    result = SceneTransforms.clipToGLWindowCoordinates(scene, positionCC, result);
//    result.y = scene.canvas.clientHeight - result.y;
//    return result;
//};
//
//var projectedPosition = new Cartesian3();
//var positionInCartographic = new Cartographic();
//
///**
// * @private
// */
//SceneTransforms.computeActualWgs84Position = function (frameState, position, result) {
//    var mode = frameState.mode;
//
//    if (mode === SceneMode.SCENE3D) {
//        return Cartesian3.clone(position, result);
//    }
//
//    var projection = frameState.mapProjection;
//    var cartographic = projection.ellipsoid.cartesianToCartographic(position, positionInCartographic);
//    if (!defined(cartographic)) {
//        return undefined;
//    }
//
//    projection.project(cartographic, projectedPosition);
//
//    if (mode === SceneMode.COLUMBUS_VIEW) {
//        return Cartesian3.fromElements(projectedPosition.z, projectedPosition.x, projectedPosition.y, result);
//    }
//
//    if (mode === SceneMode.SCENE2D) {
//        return Cartesian3.fromElements(0.0, projectedPosition.x, projectedPosition.y, result);
//    }
//
//    // mode === SceneMode.MORPHING
//    var morphTime = frameState.morphTime;
//    return Cartesian3.fromElements(
//        CesiumMath.lerp(projectedPosition.z, position.x, morphTime),
//        CesiumMath.lerp(projectedPosition.x, position.y, morphTime),
//        CesiumMath.lerp(projectedPosition.y, position.z, morphTime),
//        result);
//};
//
//var positionNDC = new Cartesian3();
//var positionWC = new Cartesian3();
//var viewport = new BoundingRectangle();
//var viewportTransform = new Matrix4();
//
///**
// * @private
// */
//SceneTransforms.clipToGLWindowCoordinates = function (scene, position, result) {
//    var canvas = scene.canvas;
//
//    // Perspective divide to transform from clip coordinates to normalized device coordinates
//    Cartesian3.divideByScalar(position, position.w, positionNDC);
//
//    // Assuming viewport takes up the entire canvas...
//    viewport.width = canvas.clientWidth;
//    viewport.height = canvas.clientHeight;
//    Matrix4.computeViewportTransformation(viewport, 0.0, 1.0, viewportTransform);
//
//    // Viewport transform to transform from clip coordinates to window coordinates
//    Matrix4.multiplyByPoint(viewportTransform, positionNDC, positionWC);
//
//    return Cartesian2.fromCartesian3(positionWC, result);
//};
//

  