/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2016
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 * 
 * The 3DCityDB-Web-Map is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <http://www.virtualcitysystems.de/>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * This is an extended version of the Cesium KmlDataSource class
 * It should be specifically used to load KML/Gltf-Networklink data exported from a 3DCityDB instance using the 3DCityDB-KML/Collada Exporter
 * @see {@link http://www.3dcitydb.net/3dcitydb/3dimpexp/|3D City Database Importer Exporter}
 */

(function() {
	// loading referenced Cesium classes
    var BoundingRectangle = Cesium.BoundingRectangle;
    var Cartesian2 = Cesium.Cartesian2;
    var Cartesian3 = Cesium.Cartesian3;
    var ClockRange = Cesium.ClockRange;
    var ClockStep = Cesium.ClockStep;
    var Color = Cesium.Color;
    var createGuid = Cesium.createGuid;
    var defaultValue = Cesium.defaultValue;
    var defined = Cesium.defined;
    var defineProperties = Cesium.defineProperties;
    var DeveloperError = Cesium.DeveloperError;
    var Ellipsoid = Cesium.Ellipsoid;
    var Event = Cesium.Event;
    var getFilenameFromUri = Cesium.getFilenameFromUri;
    var Iso8601 = Cesium.Iso8601;
    var JulianDate = Cesium.JulianDate;
    var loadBlob = Cesium.loadBlob;
    var loadXML = Cesium.loadXML;
    var CesiumMath = Cesium.CesiumMath;
    var NearFarScalar = Cesium.NearFarScalar;
    var PinBuilder = Cesium.PinBuilder;
    var PolygonHierarchy = Cesium.PolygonHierarchy;
    var Rectangle = Cesium.Rectangle;
    var RuntimeError = Cesium.RuntimeError;
    var TimeInterval = Cesium.TimeInterval;
    var TimeIntervalCollection = Cesium.TimeInterval;
    var HorizontalOrigin = Cesium.HorizontalOrigin;
    var LabelStyle = Cesium.LabelStyle;
    var Autolinker = Cesium.Autolinker;
    var Uri = Cesium.Uri;
    var when = Cesium.when;
    var zip = Cesium.zip;
    var BillboardGraphics = Cesium.BillboardGraphics;
    var CompositePositionProperty = Cesium.CompositePositionProperty;
    var ConstantPositionProperty = Cesium.ConstantPositionProperty;
    var DataSource = Cesium.DataSource;
    var DataSourceClock = Cesium.DataSourceClock;
    var Entity = Cesium.Entity;
    var EntityCollection = Cesium.EntityCollection;
    var LabelGraphics = Cesium.LabelGraphics;
    var PathGraphics = Cesium.PathGraphics;
    var PolygonGraphics = Cesium.PolygonGraphics;
    var PolylineGraphics = Cesium.PolylineGraphics;
    var PositionPropertyArray = Cesium.PositionPropertyArray;
    var RectangleGraphics = Cesium.RectangleGraphics;
    var ReferenceProperty = Cesium.ReferenceProperty;
    var SampledPositionProperty = Cesium.SampledPositionProperty;
    var ScaledPositionProperty = Cesium.ScaledPositionProperty;
    var TimeIntervalCollectionProperty = Cesium.TimeIntervalCollectionProperty;
    var WallGraphics = Cesium.WallGraphics;

    // IE 8 doesn't have a DOM parser and can't run Cesium anyway, so just bail.
    if (typeof DOMParser === 'undefined') {
        return {};
    }

    //This is by no means an exhaustive list of MIME types.
    //The purpose of this list is to be able to accurately identify content embedded
    //in KMZ files. Eventually, we can make this configurable by the end user so they can add
    //there own content types if they have KMZ files that require it.
    var MimeTypes = {
        avi : "video/x-msvideo",
        bmp : "image/bmp",
        bz2 : "application/x-bzip2",
        chm : "application/vnd.ms-htmlhelp",
        css : "text/css",
        csv : "text/csv",
        doc : "application/msword",
        dvi : "application/x-dvi",
        eps : "application/postscript",
        flv : "video/x-flv",
        gif : "image/gif",
        gz : "application/x-gzip",
        htm : "text/html",
        html : "text/html",
        ico : "image/vnd.microsoft.icon",
        jnlp : "application/x-java-jnlp-file",
        jpeg : "image/jpeg",
        jpg : "image/jpeg",
        m3u : "audio/x-mpegurl",
        m4v : "video/mp4",
        mathml : "application/mathml+xml",
        mid : "audio/midi",
        midi : "audio/midi",
        mov : "video/quicktime",
        mp3 : "audio/mpeg",
        mp4 : "video/mp4",
        mp4v : "video/mp4",
        mpeg : "video/mpeg",
        mpg : "video/mpeg",
        odp : "application/vnd.oasis.opendocument.presentation",
        ods : "application/vnd.oasis.opendocument.spreadsheet",
        odt : "application/vnd.oasis.opendocument.text",
        ogg : "application/ogg",
        pdf : "application/pdf",
        png : "image/png",
        pps : "application/vnd.ms-powerpoint",
        ppt : "application/vnd.ms-powerpoint",
        ps : "application/postscript",
        qt : "video/quicktime",
        rdf : "application/rdf+xml",
        rss : "application/rss+xml",
        rtf : "application/rtf",
        svg : "image/svg+xml",
        swf : "application/x-shockwave-flash",
        text : "text/plain",
        tif : "image/tiff",
        tiff : "image/tiff",
        txt : "text/plain",
        wav : "audio/x-wav",
        wma : "audio/x-ms-wma",
        wmv : "video/x-ms-wmv",
        xml : "application/xml",
        zip : "application/zip",

        detectFromFilename : function(filename) {
            var ext = filename.toLowerCase();
            ext = ext.substr(ext.lastIndexOf('.') + 1);
            return MimeTypes[ext];
        }
    };

    var parser = new DOMParser();
    var autolinker = new Autolinker({
        stripPrefix : false,
        twitter : false,
        email : false,
        replaceFn : function(linker, match) {
            if (!match.protocolUrlMatch) {
                //Prevent matching of non-explicit urls.
                //i.e. foo.id won't match but http://foo.id will
                return false;
            }
        }
    });

    var BILLBOARD_SIZE = 32;

    function isZipFile(blob) {
        var magicBlob = blob.slice(0, Math.min(4, blob.size));
        var deferred = when.defer();
        var reader = new FileReader();
        reader.addEventListener('load', function() {
            deferred.resolve(new DataView(reader.result).getUint32(0, false) === 0x504b0304);
        });
        reader.addEventListener('error', function() {
            deferred.reject(reader.error);
        });
        reader.readAsArrayBuffer(magicBlob);
        return deferred;
    }

    function readBlobAsText(blob) {
        var deferred = when.defer();
        var reader = new FileReader();
        reader.addEventListener('load', function() {
            deferred.resolve(reader.result);
        });
        reader.addEventListener('error', function() {
            deferred.reject(reader.error);
        });
        reader.readAsText(blob);
        return deferred;
    }

    function loadXmlFromZip(reader, entry, uriResolver, deferred) {
        entry.getData(new zip.TextWriter(), function(text) {
            uriResolver.kml = parser.parseFromString(text, 'application/xml');
            deferred.resolve();
        });
    }

    function loadDataUriFromZip(reader, entry, uriResolver, deferred) {
        var mimeType = defaultValue(MimeTypes.detectFromFilename(entry.filename), 'application/octet-stream');
        entry.getData(new zip.Data64URIWriter(mimeType), function(dataUri) {
            uriResolver[entry.filename] = dataUri;
            deferred.resolve();
        });
    }

    function replaceAttributes(div, elementType, attributeName, uriResolver) {
        var keys = uriResolver.keys;
        var baseUri = new Uri('.');
        var elements = div.querySelectorAll(elementType);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var value = element.getAttribute(attributeName);
            var uri = new Uri(value).resolve(baseUri).toString();
            var index = keys.indexOf(uri);
            if (index !== -1) {
                var key = keys[index];
                element.setAttribute(attributeName, uriResolver[key]);
                if (elementType === 'a' && element.getAttribute('download') === null) {
                    element.setAttribute('download', key);
                }
            }
        }
    }

    function proxyUrl(url, proxy) {
        if (defined(proxy)) {
            if (new Uri(url).isAbsolute()) {
                url = proxy.getURL(url);
            }
        }
        return url;
    }

    function getOrCreateEntity(node, entityCollection, layerId) {
        var id = createGuid();
        var entity = entityCollection.getOrCreateEntity(id);
        if (!defined(entity.kml)) {
            entity.addProperty('kml');
            entity.addProperty('layerId');
            entity.kml = new KmlFeatureData();
            entity.layerId = layerId;
        }
        return entity;
    }

    function createId(node) {
        return defined(node) && defined(node.id) && node.id.length !== 0 ? node.id : createGuid();
    }
    
    function isExtrudable(altitudeMode, gxAltitudeMode) {
        return altitudeMode === 'absolute' || altitudeMode === 'relativeToGround' || gxAltitudeMode === 'relativeToSeaFloor';
    }

    function readCoordinate(value) {
        if (!defined(value)) {
            return undefined;
        }

        var digits = value.match(/[^\s,\n]+/g);
        if (digits.length !== 2 && digits.length !== 3) {
            window.console.log('KML - Invalid coordinates: ' + value);
            return undefined;
        }

        var longitude = parseFloat(digits[0]);
        var latitude = parseFloat(digits[1]);
        var height = parseFloat(digits[2]);

        longitude = isNaN(longitude) ? 0.0 : longitude;
        latitude = isNaN(latitude) ? 0.0 : latitude;
        height = isNaN(height) ? 0.0 : height;

        return Cartesian3.fromDegrees(longitude, latitude, height);
    }

    function readCoordinates(element) {
        if (!defined(element)) {
            return undefined;
        }

        var tuples = element.textContent.match(/[^\s\n]+/g);
        var length = tuples.length;
        var result = new Array(length);
        var resultIndex = 0;
        for (var i = 0; i < length; i++) {
            result[resultIndex++] = readCoordinate(tuples[i]);
        }
        return result;
    }

    var kmlNamespaces = [null, undefined, 'http://www.opengis.net/kml/2.2', 'http://earth.google.com/kml/2.2', 'http://earth.google.com/kml/2.1', 'http://earth.google.com/kml/2.0'];
    var gxNamespaces = ['http://www.google.com/kml/ext/2.2'];
    var atomNamespaces = ['http://www.w3.org/2005/Atom'];
    var namespaces = {
        kml : kmlNamespaces,
        gx : gxNamespaces,
        atom : atomNamespaces,
        kmlgx : kmlNamespaces.concat(gxNamespaces)
    };

    function queryNumericAttribute(node, attributeName) {
        if (!defined(node)) {
            return undefined;
        }

        var value = node.getAttribute(attributeName);
        if (value !== null) {
            var result = parseFloat(value);
            return !isNaN(result) ? result : undefined;
        }
        return undefined;
    }

    function queryStringAttribute(node, attributeName) {
        if (!defined(node)) {
            return undefined;
        }
        var value = node.getAttribute(attributeName);
        return value !== null ? value : undefined;
    }

    function queryFirstNode(node, tagName, namespace) {
        if (!defined(node)) {
            return undefined;
        }
        var childNodes = node.childNodes;
        var length = childNodes.length;
        for (var q = 0; q < length; q++) {
            var child = childNodes[q];
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                return child;
            }
        }
        return undefined;
    }

    function queryNodes(node, tagName, namespace) {
        if (!defined(node)) {
            return undefined;
        }
        var result = [];
        var childNodes = node.getElementsByTagName(tagName);
        var length = childNodes.length;
        for (var q = 0; q < length; q++) {
            var child = childNodes[q];
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                result.push(child);
            }
        }
        return result;
    }

    function queryChildNodes(node, tagName, namespace) {
        if (!defined(node)) {
            return [];
        }
        var result = [];
        var childNodes = node.childNodes;
        var length = childNodes.length;
        for (var q = 0; q < length; q++) {
            var child = childNodes[q];
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                result.push(child);
            }
        }
        return result;
    }

    function queryNumericValue(node, tagName, namespace) {
        var resultNode = queryFirstNode(node, tagName, namespace);
        if (defined(resultNode)) {
            var result = parseFloat(resultNode.textContent);
            return !isNaN(result) ? result : undefined;
        }
        return undefined;
    }

    function queryStringValue(node, tagName, namespace) {
        var result = queryFirstNode(node, tagName, namespace);
        if (defined(result)) {
            return result.textContent.trim();
        }
        return undefined;
    }

    function queryBooleanValue(node, tagName, namespace) {
        var result = queryFirstNode(node, tagName, namespace);
        if (defined(result)) {
            var value = result.textContent.trim();
            return value === '1' || /^true$/i.test(value);
        }
        return undefined;
    }

    function resolveHref(href, proxy, sourceUri, uriResolver) {
        if (!defined(href)) {
            return undefined;
        }
        var hrefResolved = false;
        if (defined(uriResolver)) {
            var blob = uriResolver[href];
            if (defined(blob)) {
                hrefResolved = true;
                href = blob;
            }
        }
        if (!hrefResolved && defined(sourceUri)) {
            var baseUri = new Uri(document.location.href);
            sourceUri = new Uri(sourceUri);
            href = new Uri(href).resolve(sourceUri.resolve(baseUri)).toString();
            href = proxyUrl(href, proxy);
        }
        return href;
    }

    var colorOptions = {};
    function parseColorString(value, isRandom) {
        if (!defined(value)) {
            return undefined;
        }

        if(value[0] === '#'){
            value = value.substring(1);
        }

        var alpha = parseInt(value.substring(0, 2), 16) / 255.0;
        var blue = parseInt(value.substring(2, 4), 16) / 255.0;
        var green = parseInt(value.substring(4, 6), 16) / 255.0;
        var red = parseInt(value.substring(6, 8), 16) / 255.0;

        if (!isRandom) {
            return new Color(red, green, blue, alpha);
        }

        if (red > 0) {
            colorOptions.maximumRed = red;
        } else {
            colorOptions.red = 0;
        }
        if (green > 0) {
            colorOptions.maximumGreen = green;
        } else {
            colorOptions.green = 0;
        }
        if (blue > 0) {
            colorOptions.maximumBlue = blue;
        } else {
            colorOptions.blue = 0;
        }
        colorOptions.alpha = alpha;
        return Color.fromRandom(colorOptions);
    }

    function queryColorValue(node, tagName, namespace) {
        var value = queryStringValue(node, tagName, namespace);
        if (!defined(value)) {
            return undefined;
        }
        return parseColorString(value, queryStringValue(node, 'colorMode', namespace) === 'random');
    }

    function processTimeStamp(featureNode) {
        var node = queryFirstNode(featureNode, 'TimeStamp', namespaces.kmlgx);
        var whenString = queryStringValue(node, 'when', namespaces.kmlgx);

        if (!defined(node) || !defined(whenString) || whenString.length === 0) {
            return undefined;
        }

        //According to the KML spec, a TimeStamp represents a "single moment in time"
        //However, since Cesium animates much differently than Google Earth, that doesn't
        //Make much sense here.  Instead, we use the TimeStamp as the moment the feature
        //comes into existence.  This works much better and gives a similar feel to
        //GE's experience.
        var when = JulianDate.fromIso8601(whenString);
        var result = new TimeIntervalCollection();
        result.addInterval(new TimeInterval({
            start : when,
            stop : Iso8601.MAXIMUM_VALUE
        }));
        return result;
    }

    function processTimeSpan(featureNode) {
        var node = queryFirstNode(featureNode, 'TimeSpan', namespaces.kmlgx);
        if (!defined(node)) {
            return undefined;
        }
        var result;

        var beginNode = queryFirstNode(node, 'begin', namespaces.kmlgx);
        var beginDate = defined(beginNode) ? JulianDate.fromIso8601(beginNode.textContent) : undefined;

        var endNode = queryFirstNode(node, 'end', namespaces.kmlgx);
        var endDate = defined(endNode) ? JulianDate.fromIso8601(endNode.textContent) : undefined;

        if (defined(beginDate) && defined(endDate)) {
            if (JulianDate.lessThan(endDate, beginDate)) {
                var tmp = beginDate;
                beginDate = endDate;
                endDate = tmp;
            }
            result = new TimeIntervalCollection();
            result.addInterval(new TimeInterval({
                start : beginDate,
                stop : endDate
            }));
        } else if (defined(beginDate)) {
            result = new TimeIntervalCollection();
            result.addInterval(new TimeInterval({
                start : beginDate,
                stop : Iso8601.MAXIMUM_VALUE
            }));
        } else if (defined(endDate)) {
            result = new TimeIntervalCollection();
            result.addInterval(new TimeInterval({
                start : Iso8601.MINIMUM_VALUE,
                stop : endDate
            }));
        }

        return result;
    }

    function createDefaultBillboard() {
        var billboard = new BillboardGraphics();
        billboard.width = BILLBOARD_SIZE;
        billboard.height = BILLBOARD_SIZE;
        billboard.scaleByDistance = new NearFarScalar(2414016, 1.0, 1.6093e+7, 0.1);
        return billboard;
    }

    function createDefaultPolygon() {
        var polygon = new PolygonGraphics();
        polygon.outline = true;
        polygon.outlineColor = Color.WHITE;
        return polygon;
    }

    function createDefaultLabel() {
        var label = new LabelGraphics();
        label.translucencyByDistance = new NearFarScalar(3000000, 1.0, 5000000, 0.0);
        label.pixelOffset = new Cartesian2(17, 0);
        label.horizontalOrigin = HorizontalOrigin.LEFT;
        label.font = '16px sans-serif';
        label.style = LabelStyle.FILL_AND_OUTLINE;
        return label;
    }

    function processBillboardIcon(dataSource, node, targetEntity, sourceUri, uriResolver) {
        var scale = queryNumericValue(node, 'scale', namespaces.kml);
        var heading = queryNumericValue(node, 'heading', namespaces.kml);
        var color = queryColorValue(node, 'color', namespaces.kml);

        var iconNode = queryFirstNode(node, 'Icon', namespaces.kml);
        var href = queryStringValue(iconNode, 'href', namespaces.kml);
        var icon = resolveHref(href, dataSource._proxy, sourceUri, uriResolver);
        var x = queryNumericValue(iconNode, 'x', namespaces.gx);
        var y = queryNumericValue(iconNode, 'y', namespaces.gx);
        var w = queryNumericValue(iconNode, 'w', namespaces.gx);
        var h = queryNumericValue(iconNode, 'h', namespaces.gx);

        var hotSpotNode = queryFirstNode(node, 'hotSpot', namespaces.kml);
        var hotSpotX = queryNumericAttribute(hotSpotNode, 'x');
        var hotSpotY = queryNumericAttribute(hotSpotNode, 'y');
        var hotSpotXUnit = queryStringAttribute(hotSpotNode, 'xunits');
        var hotSpotYUnit = queryStringAttribute(hotSpotNode, 'yunits');

        var billboard = targetEntity.billboard;
        if (!defined(billboard)) {
            billboard = createDefaultBillboard(dataSource);
            targetEntity.billboard = billboard;
        }

        billboard.image = icon;
        billboard.scale = scale;
        billboard.color = color;

        if (defined(x) || defined(y) || defined(w) || defined(h)) {
            billboard.imageSubRegion = new BoundingRectangle(x, y, w, h);
        }

        //GE treats a heading of zero as no heading
        //Yes, this means it's impossible to actually point north in KML
        if (defined(heading) && heading !== 0) {
            billboard.rotation = CesiumMath.toRadians(-heading);
            billboard.alignedAxis = Cartesian3.UNIT_Z;
        }

        //Hotpot is the KML equivalent of pixel offset
        //The hotspot origin is the lower left, but we leave
        //our billboard origin at the center and simply
        //modify the pixel offset to take this into account
        scale = defaultValue(scale, 1.0);

        var xOffset;
        var yOffset;
        if (defined(hotSpotX)) {
            if (hotSpotXUnit === 'pixels') {
                xOffset = -hotSpotX * scale;
            } else if (hotSpotXUnit === 'insetPixels') {
                xOffset = (hotSpotX - BILLBOARD_SIZE) * scale;
            } else if (hotSpotXUnit === 'fraction') {
                xOffset = -BILLBOARD_SIZE * scale * hotSpotX;
            }
            xOffset += BILLBOARD_SIZE * 0.5 * scale;
        }

        if (defined(hotSpotY)) {
            if (hotSpotYUnit === 'pixels') {
                yOffset = hotSpotY;
            } else if (hotSpotYUnit === 'insetPixels') {
                yOffset = -hotSpotY;
            } else if (hotSpotYUnit === 'fraction') {
                yOffset = hotSpotY * BILLBOARD_SIZE;
            }
            yOffset -= BILLBOARD_SIZE * 0.5 * scale;
        }

        if (defined(xOffset) || defined(yOffset)) {
            billboard.pixelOffset = new Cartesian2(xOffset, yOffset);
        }
    }

    function applyStyle(dataSource, styleNode, targetEntity, sourceUri, uriResolver) {
        for (var i = 0, len = styleNode.childNodes.length; i < len; i++) {
            var node = styleNode.childNodes.item(i);
            var material;
            if (node.localName === 'IconStyle') {
                processBillboardIcon(dataSource, node, targetEntity, sourceUri, uriResolver);
            } else if (node.localName === 'LabelStyle') {
                var label = targetEntity.label;
                if (!defined(label)) {
                    label = createDefaultLabel();
                    targetEntity.label = label;
                }
                label.scale = defaultValue(queryNumericValue(node, 'scale', namespaces.kml), label.scale);
                label.fillColor = defaultValue(queryColorValue(node, 'color', namespaces.kml), label.fillColor);
                label.text = targetEntity.name;
            } else if (node.localName === 'LineStyle') {
                var polyline = targetEntity.polyline;
                if (!defined(polyline)) {
                    polyline = new PolylineGraphics();
                    targetEntity.polyline = polyline;
                }
                polyline.width = queryNumericValue(node, 'width', namespaces.kml);
                polyline.material = queryColorValue(node, 'color', namespaces.kml);
            } else if (node.localName === 'PolyStyle') {
                var polygon = targetEntity.polygon;
                if (!defined(polygon)) {
                    polygon = createDefaultPolygon();
                    targetEntity.polygon = polygon;
                }
                polygon.material = defaultValue(queryColorValue(node, 'color', namespaces.kml), polygon.material);
                polygon.fill = defaultValue(queryBooleanValue(node, 'fill', namespaces.kml), polygon.fill);
                polygon.outline = defaultValue(queryBooleanValue(node, 'outline', namespaces.kml), polygon.outline);
            } else if (node.localName === 'BalloonStyle') {
                var bgColor = defaultValue(parseColorString(queryStringValue(node, 'bgColor', namespaces.kml)), Color.WHITE);
                var textColor = defaultValue(parseColorString(queryStringValue(node, 'textColor', namespaces.kml)), Color.BLACK);
                var text = queryStringValue(node, 'text', namespaces.kml);

                //This is purely an internal property used in style processing,
                //it never ends up on the final entity.
                targetEntity.addProperty('balloonStyle');
                targetEntity.balloonStyle = {
                    bgColor : bgColor,
                    textColor : textColor,
                    text : text
                };
            }
        }
    }

    //Processes and merges any inline styles for the provided node into the provided entity.
    function computeFinalStyle(entity, dataSource, placeMark, styleCollection, sourceUri, uriResolver) {
        var result = new Entity();

        var inlineStyles = queryChildNodes(placeMark, 'Style', namespaces.kml);
        var inlineStylesLength = inlineStyles.length;
        if (inlineStylesLength > 0) {
            //Google earth seems to always use the last inline style only.
            applyStyle(dataSource, inlineStyles[inlineStylesLength - 1], result, sourceUri, uriResolver);
        }

        //Google earth seems to always use the first external style only.
        var externalStyle = queryStringValue(placeMark, 'styleUrl', namespaces.kml);
        if (defined(externalStyle)) {
            //Google Earth ignores leading and trailing whitespace for styleUrls
            //Without the below trim, some docs that load in Google Earth won't load
            //in cesium.
            var id = externalStyle;
            var styleEntity = styleCollection.getById(id);
            if (!defined(styleEntity)) {
                styleEntity = styleCollection.getById('#' + id);
            }
            if (defined(styleEntity)) {
                result.merge(styleEntity);
            }
        }

        return result;
    }

    //Asynchronously processes an external style file.
    function processExternalStyles(dataSource, uri, styleCollection) {
        return when(loadXML(proxyUrl(uri, dataSource._proxy)), function(styleKml) {
            return processStyles(dataSource, styleKml, styleCollection, uri, true);
        });
    }

    //Processes all shared and external styles and stores
    //their id into the provided styleCollection.
    //Returns an array of promises that will resolve when
    //each style is loaded.
    function processStyles(dataSource, kml, styleCollection, sourceUri, isExternal, uriResolver) {
        var i;
        var id;
        var styleEntity;

        var node;
        var styleNodes = queryNodes(kml, 'Style', namespaces.kml);
        if (defined(styleNodes)) {
            var styleNodesLength = styleNodes.length;
            for (i = 0; i < styleNodesLength; i++) {
                node = styleNodes[i];
                id = queryStringAttribute(node, 'id');
                if (defined(id)) {
                    id = '#' + id;
                    if (isExternal && defined(sourceUri)) {
                        id = sourceUri + id;
                    }
                    if (!defined(styleCollection.getById(id))) {
                        styleEntity = new Entity({
                            id : id
                        });
                        styleCollection.add(styleEntity);
                        applyStyle(dataSource, node, styleEntity, sourceUri, uriResolver);
                    }
                }
            }
        }

        var styleMaps = queryNodes(kml, 'StyleMap', namespaces.kml);
        if (defined(styleMaps)) {
            var styleMapsLength = styleMaps.length;
            for (i = 0; i < styleMapsLength; i++) {
                var styleMap = styleMaps[i];
                id = queryStringAttribute(styleMap, 'id');
                if (defined(id)) {
                    var pairs = queryChildNodes(styleMap, 'Pair', namespaces.kml);
                    for (var p = 0; p < pairs.length; p++) {
                        var pair = pairs[p];
                        if (queryStringValue(pair, 'key', namespaces.kml) === 'normal') {
                            id = '#' + id;
                            if (isExternal && defined(sourceUri)) {
                                id = sourceUri + id;
                            }
                            if (!defined(styleCollection.getById(id))) {
                                styleEntity = styleCollection.getOrCreateEntity(id);

                                var styleUrl = queryStringValue(pair, 'styleUrl', namespaces.kml);
                                if (defined(styleUrl)) {
                                    var base = styleCollection.getOrCreateEntity(styleUrl);
                                    if (defined(base)) {
                                        styleEntity.merge(base);
                                    }
                                } else {
                                    node = queryFirstNode(pair, 'Style', namespaces.kml);
                                    applyStyle(dataSource, node, styleEntity, sourceUri, uriResolver);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        var externalStyleHash = {};
        var promises = [];
        var styleUrlNodes = kml.getElementsByTagName('styleUrl');
        var styleUrlNodesLength = styleUrlNodes.length;
        for (i = 0; i < styleUrlNodesLength; i++) {
            var styleReference = styleUrlNodes[i].textContent;
            if (styleReference[0] !== '#') {
                //According to the spec, all local styles should start with a #
                //and everything else is an external style that has a # seperating
                //the URL of the document and the style.  However, Google Earth
                //also accepts styleUrls without a # as meaning a local style.
                var tokens = styleReference.split('#');
                if (tokens.length === 2) {
                    var uri = tokens[0];
                    if (!defined(externalStyleHash[uri])) {
                        if (defined(sourceUri)) {
                            var baseUri = new Uri(document.location.href);
                            sourceUri = new Uri(sourceUri);
                            uri = new Uri(uri).resolve(sourceUri.resolve(baseUri)).toString();
                        }
                        promises.push(processExternalStyles(dataSource, uri, styleCollection, sourceUri));
                    }
                }
            }
        }

        return promises;
    }

    function createDropLine(dataSource, entity, styleEntity) {
        var entityPosition = new ReferenceProperty(dataSource._entityCollection, entity.id, ['position']);
        var surfacePosition = new ScaledPositionProperty(entity.position);
        entity.polyline = defined(styleEntity.polyline) ? styleEntity.polyline.clone() : new PolylineGraphics();
        entity.polyline.positions = new PositionPropertyArray([entityPosition, surfacePosition]);
    }

    function createPositionPropertyFromAltitudeMode(property, altitudeMode, gxAltitudeMode) {
        if (gxAltitudeMode === 'relativeToSeaFloor' || altitudeMode === 'absolute' || altitudeMode === 'relativeToGround') {
            //Just return the ellipsoid referenced property until we support MSL and terrain
            return property;
        }

        if ((defined(altitudeMode) && altitudeMode !== 'clampToGround') || //
           (defined(gxAltitudeMode) && gxAltitudeMode !== 'clampToSeaFloor')) {
            window.console.log('KML - Unknown altitudeMode: ' + defaultValue(altitudeMode, gxAltitudeMode));
        }

        //Clamp to ellipsoid until we support terrain
        return new ScaledPositionProperty(property);
    }

    function createPositionPropertyArrayFromAltitudeMode(properties, altitudeMode, gxAltitudeMode) {
        if (!defined(properties)) {
            return undefined;
        }

        if (gxAltitudeMode === 'relativeToSeaFloor' || altitudeMode === 'absolute' || altitudeMode === 'relativeToGround') {
            //Just return the ellipsoid referenced property until we support MSL and terrain
            return properties;
        }

        if ((defined(altitudeMode) && altitudeMode !== 'clampToGround') || //
            (defined(gxAltitudeMode) && gxAltitudeMode !== 'clampToSeaFloor')) {
            window.console.log('KML - Unknown altitudeMode: ' + defaultValue(altitudeMode, gxAltitudeMode));
        }

        //Clamp to ellipsoid until we support terrain.
        var propertiesLength = properties.length;
        for (var i = 0; i < propertiesLength; i++) {
            var property = properties[i];
            Ellipsoid.WGS84.scaleToGeodeticSurface(property, property);
        }
        return properties;
    }

    function processPositionGraphics(dataSource, entity, styleEntity) {
        var label = entity.label;
        if (!defined(label)) {
            label = defined(styleEntity.label) ? styleEntity.label.clone() : createDefaultLabel();
            entity.label = label;
        }
        label.text = entity.name;

        var billboard = entity.billboard;
        if (!defined(billboard)) {
            billboard = defined(styleEntity.billboard) ? styleEntity.billboard.clone() : createDefaultBillboard();
            entity.billboard = billboard;
        }

        if (!defined(billboard.image)) {
            billboard.image = dataSource._pinBuilder.fromColor(Color.YELLOW, 64);
        }

        if (defined(billboard.scale)) {
            var scale = billboard.scale.getValue();
            if (scale !== 0) {
                label.pixelOffset = new Cartesian2((scale * 16) + 1, 0);
            } else {
                //Minor tweaks to better match Google Earth.
                label.pixelOffset = undefined;
                label.horizontalOrigin = undefined;
            }
        }
    }

    function processPathGraphics(dataSource, entity, styleEntity) {
        var path = entity.path;
        if (!defined(path)) {
            path = new PathGraphics();
            path.leadTime = 0;
            entity.path = path;
        }

        var polyline = styleEntity.polyline;
        if (defined(polyline)) {
            path.material = polyline.material;
            path.width = polyline.width;
        }
    }

    function processPoint(dataSource, geometryNode, entity, styleEntity) {
        var coordinatesString = queryStringValue(geometryNode, 'coordinates', namespaces.kml);
        var altitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.kml);
        var gxAltitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.gx);
        var extrude = queryBooleanValue(geometryNode, 'extrude', namespaces.kml);

        var position = readCoordinate(coordinatesString);
        if (!defined(position)) {
            return;
        }

        entity.position = createPositionPropertyFromAltitudeMode(new ConstantPositionProperty(position), altitudeMode, gxAltitudeMode);
        processPositionGraphics(dataSource, entity, styleEntity);

        if (extrude && isExtrudable(altitudeMode, gxAltitudeMode)) {
            createDropLine(dataSource, entity, styleEntity);
        }
    }

    function processLineStringOrLinearRing(dataSource, geometryNode, entity, styleEntity) {
        var coordinatesNode = queryFirstNode(geometryNode, 'coordinates', namespaces.kml);
        var altitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.kml);
        var gxAltitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.gx);
        var extrude = queryBooleanValue(geometryNode, 'extrude', namespaces.kml);
        var tessellate = queryBooleanValue(geometryNode, 'tessellate', namespaces.kml);
        var canExtrude = isExtrudable(altitudeMode, gxAltitudeMode);

        var coordinates = readCoordinates(coordinatesNode);
        var polyline = styleEntity.polyline;
        if (canExtrude && extrude) {
            var wall = new WallGraphics();
            entity.wall = wall;
            wall.positions = coordinates;
            var polygon = styleEntity.polygon;

            if (defined(polygon)) {
                wall.fill = polygon.fill;
                wall.outline = polygon.outline;
                wall.material = polygon.material;
            }

            if (defined(polyline)) {
                wall.outlineColor = defined(polyline.material) ? polyline.material.color : Color.WHITE;
                wall.outlineWidth = polyline.width;
            }
        } else {
            polyline = defined(polyline) ? polyline.clone() : new PolylineGraphics();
            entity.polyline = polyline;
            polyline.positions = createPositionPropertyArrayFromAltitudeMode(coordinates, altitudeMode, gxAltitudeMode);
            if (!tessellate || canExtrude) {
                polyline.followSurface = false;
            }
        }
    }

    function processPolygon(dataSource, geometryNode, entity, styleEntity) {
        var outerBoundaryIsNode = queryFirstNode(geometryNode, 'outerBoundaryIs', namespaces.kml);
        var linearRingNode = queryFirstNode(outerBoundaryIsNode, 'LinearRing', namespaces.kml);
        var coordinatesNode = queryFirstNode(linearRingNode, 'coordinates', namespaces.kml);
        var coordinates = readCoordinates(coordinatesNode);
        var extrude = queryBooleanValue(geometryNode, 'extrude', namespaces.kml);
        var altitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.kml);
        var gxAltitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.gx);
        var canExtrude = isExtrudable(altitudeMode, gxAltitudeMode);

        var polygon = defined(styleEntity.polygon) ? styleEntity.polygon.clone() : createDefaultPolygon();

        var polyline = styleEntity.polyline;
        if (defined(polyline)) {
            polygon.outlineColor = defined(polyline.material) ? polyline.material.color : Color.WHITE;
            polygon.outlineWidth = polyline.width;
        }
        entity.polygon = polygon;

        if (canExtrude) {
            polygon.perPositionHeight = true;
            polygon.extrudedHeight = extrude ? 0 : undefined;
        }

        if (defined(coordinates)) {
            var hierarchy = new PolygonHierarchy(coordinates);
            var innerBoundaryIsNodes = queryChildNodes(geometryNode, 'innerBoundaryIs', namespaces.kml);
            for (var j = 0; j < innerBoundaryIsNodes.length; j++) {
                linearRingNode = queryChildNodes(innerBoundaryIsNodes[j], 'LinearRing', namespaces.kml);
                for (var k = 0; k < linearRingNode.length; k++) {
                    coordinatesNode = queryFirstNode(linearRingNode[k], 'coordinates', namespaces.kml);
                    coordinates = readCoordinates(coordinatesNode);
                    if (defined(coordinates)) {
                        hierarchy.holes.push(new PolygonHierarchy(coordinates));
                    }
                }
            }
            polygon.hierarchy = hierarchy;
        }
    }

    function processTrack(dataSource, geometryNode, entity, styleEntity) {
        var altitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.kml);
        var gxAltitudeMode = queryStringValue(geometryNode, 'altitudeMode', namespaces.gx);
        var coordNodes = queryChildNodes(geometryNode, 'coord', namespaces.gx);
        var timeNodes = queryChildNodes(geometryNode, 'when', namespaces.kml);
        var extrude = queryBooleanValue(geometryNode, 'extrude', namespaces.kml);
        var canExtrude = isExtrudable(altitudeMode, gxAltitudeMode);

        var length = Math.min(coordNodes.length, timeNodes.length);
        var coordinates = [];
        var times = [];
        for (var i = 0; i < length; i++) {
            //An empty position is OK according to the spec
            var position = readCoordinate(coordNodes[i].textContent);
            if (defined(position)) {
                coordinates.push(position);
                times.push(JulianDate.fromIso8601(timeNodes[i].textContent));
            }
        }
        var property = new SampledPositionProperty();
        property.addSamples(times, coordinates);
        entity.position = createPositionPropertyFromAltitudeMode(property, altitudeMode, gxAltitudeMode);
        processPositionGraphics(dataSource, entity, styleEntity);
        processPathGraphics(dataSource, entity, styleEntity);

        entity.availability = new TimeIntervalCollection();

        if (timeNodes.length > 0) {
            entity.availability.addInterval(new TimeInterval({
                start : times[0],
                stop : times[times.length - 1]
            }));
        }

        if (canExtrude && extrude) {
            createDropLine(dataSource, entity, styleEntity);
        }
    }

    function addToMultiTrack(times, positions, composite, availability, dropShowProperty, extrude, altitudeMode, gxAltitudeMode, includeEndPoints) {
        var start = times[0];
        var stop = times[times.length - 1];

        var data = new SampledPositionProperty();
        data.addSamples(times, positions);

        composite.intervals.addInterval(new TimeInterval({
            start : start,
            stop : stop,
            isStartIncluded : includeEndPoints,
            isStopIncluded : includeEndPoints,
            data : createPositionPropertyFromAltitudeMode(data, altitudeMode, gxAltitudeMode)
        }));
        availability.addInterval(new TimeInterval({
            start : start,
            stop : stop,
            isStartIncluded : includeEndPoints,
            isStopIncluded : includeEndPoints
        }));
        dropShowProperty.intervals.addInterval(new TimeInterval({
            start : start,
            stop : stop,
            isStartIncluded : includeEndPoints,
            isStopIncluded : includeEndPoints,
            data : extrude
        }));
    }

    function processMultiTrack(dataSource, geometryNode, entity, styleEntity) {
        // Multitrack options do not work in GE as detailed in the spec,
        // rather than altitudeMode being at the MultiTrack level,
        // GE just defers all settings to the underlying track.

        var interpolate = queryBooleanValue(geometryNode, 'interpolate', namespaces.gx);
        var trackNodes = queryChildNodes(geometryNode, 'Track', namespaces.gx);

        var times;
        var data;
        var lastStop;
        var lastStopPosition;
        var needDropLine = false;
        var dropShowProperty = new TimeIntervalCollectionProperty();
        var availability = new TimeIntervalCollection();
        var composite = new CompositePositionProperty();
        for (var i = 0, len = trackNodes.length; i < len; i++) {
            var trackNode = trackNodes[i];
            var timeNodes = queryChildNodes(trackNode, 'when', namespaces.kml);
            var coordNodes = queryChildNodes(trackNode, 'coord', namespaces.gx);
            var altitudeMode = queryStringValue(trackNode, 'altitudeMode', namespaces.kml);
            var gxAltitudeMode = queryStringValue(trackNode, 'altitudeMode', namespaces.gx);
            var canExtrude = isExtrudable(altitudeMode, gxAltitudeMode);
            var extrude = queryBooleanValue(trackNode, 'extrude', namespaces.kml);

            var length = Math.min(coordNodes.length, timeNodes.length);

            var positions = [];
            times = [];
            for (var x = 0; x < length; x++) {
                //An empty position is OK according to the spec
                var position = readCoordinate(coordNodes[x].textContent);
                if (defined(position)) {
                    positions.push(position);
                    times.push(JulianDate.fromIso8601(timeNodes[x].textContent));
                }
            }

            if (interpolate) {
                //If we are interpolating, then we need to fill in the end of
                //the last track and the beginning of this one with a sampled
                //property.  From testing in Google Earth, this property
                //is never extruded and always absolute.
                if (defined(lastStop)) {
                    addToMultiTrack([lastStop, times[0]], [lastStopPosition, positions[0]], composite, availability, dropShowProperty, false, 'absolute', undefined, false);
                }
                lastStop = times[length - 1];
                lastStopPosition = positions[positions.length - 1];
            }

            addToMultiTrack(times, positions, composite, availability, dropShowProperty, canExtrude && extrude, altitudeMode, gxAltitudeMode, true);
            needDropLine = needDropLine || (canExtrude && extrude);
        }

        entity.availability = availability;
        entity.position = composite;
        processPositionGraphics(dataSource, entity, styleEntity);
        processPathGraphics(dataSource, entity, styleEntity);
        if (needDropLine) {
            createDropLine(dataSource, entity, styleEntity);
            entity.polyline.show = dropShowProperty;
        }
    }

    function processMultiGeometry(dataSource, geometryNode, entity, styleEntity) {
        var childNodes = geometryNode.childNodes;
        for (var i = 0, len = childNodes.length; i < len; i++) {
            var childNode = childNodes.item(i);
            var geometryProcessor = geometryTypes[childNode.localName];
            if (defined(geometryProcessor)) {
                var childEntity = getOrCreateEntity(childNode, dataSource._entityCollection, dataSource._layerId);
                childEntity.parent = entity;
                childEntity.name = entity.name;
                childEntity.availability = entity.availability;
                childEntity.description = entity.description;
                childEntity.kml = entity.kml;
                geometryProcessor(dataSource, childNode, childEntity, styleEntity);
            }
        }
    }

    function processExtendedData(node, entity) {
        var extendedDataNode = queryFirstNode(node, 'ExtendedData', namespaces.kml);

        if (!defined(extendedDataNode)) {
            return undefined;
        }

        var result = {};
        var dataNodes = queryChildNodes(extendedDataNode, 'Data', namespaces.kml);
        if (defined(dataNodes)) {
            var length = dataNodes.length;
            for (var i = 0; i < length; i++) {
                var dataNode = dataNodes[i];
                var name = queryStringAttribute(dataNode, 'name');
                if (defined(name)) {
                    result[name] = {
                        displayName : queryStringValue(dataNode, 'displayName', namespaces.kml),
                        value : queryStringValue(dataNode, 'value', namespaces.kml)
                    };
                }
            }
        }
        entity.kml.extendedData = result;
    }

    var scratchDiv = document.createElement('div');
    function processDescription(node, entity, styleEntity, uriResolver) {
        var i;
        var key;
        var keys;

        var kmlData = entity.kml;
        var extendedData = kmlData.extendedData;
        var description = queryStringValue(node, 'description', namespaces.kml);

        var balloonStyle = defaultValue(entity.balloonStyle, styleEntity.balloonStyle);

        var background = Color.WHITE;
        var foreground = Color.BLACK;
        var text = description;

        if (defined(balloonStyle)) {
            background = defaultValue(balloonStyle.bgColor, Color.WHITE);
            foreground = defaultValue(balloonStyle.textColor, Color.BLACK);
            text = defaultValue(balloonStyle.text, description);
        }

        var value;
        if (defined(text)) {
            text = text.replace('$[name]', defaultValue(entity.name, ''));
            text = text.replace('$[description]', defaultValue(description, ''));
            text = text.replace('$[address]', defaultValue(kmlData.address, ''));
            text = text.replace('$[Snippet]', defaultValue(kmlData.snippet, ''));
            text = text.replace('$[id]', entity.id);

            //While not explicitly defined by the OGC spec, in Google Earth
            //The appearance of geDirections adds the directions to/from links
            //We simply replace this string with nothing.
            text = text.replace('$[geDirections]', '');

            if (defined(extendedData)) {
                var matches = text.match(/\$\[.+?\]/g);
                if (matches !== null) {
                    for (i = 0; i < matches.length; i++) {
                        var token = matches[i];
                        var propertyName = token.substr(2, token.length - 3);
                        var isDisplayName = /\/displayName$/.test(propertyName);
                        propertyName = propertyName.replace(/\/displayName$/, '');

                        value = extendedData[propertyName];
                        if (defined(value)) {
                            value = isDisplayName ? value.displayName : value.value;
                        }
                        if (defined(value)) {
                            text = text.replace(token, defaultValue(value, ''));
                        }
                    }
                }
            }
        } else if (defined(extendedData)) {
            //If no description exists, build a table out of the extended data
            keys = Object.keys(extendedData);
            if (keys.length > 0) {
                text = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>';
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    value = extendedData[key];
                    text += '<tr><th>' + defaultValue(value.displayName, key) + '</th><td>' + defaultValue(value.value, '') + '</td></tr>';
                }
                text += '</tbody></table>';
            }
        }

        if (!defined(text)) {
            //No description
            return;
        }

        //Turns non-explicit links into clickable links.
        text = autolinker.link(text);

        //Use a temporary div to manipulate the links
        //so that they open in a new window.
        scratchDiv.innerHTML = text;
        var links = scratchDiv.querySelectorAll('a');
        for (i = 0; i < links.length; i++) {
            links[i].setAttribute('target', '_blank');
        }

        //Rewrite any KMZ embedded urls
        if (defined(uriResolver) && uriResolver.keys.length > 1) {
            replaceAttributes(scratchDiv, 'a', 'href', uriResolver);
            replaceAttributes(scratchDiv, 'img', 'src', uriResolver);
        }

        var tmp = '<div class="cesium-infoBox-description-lighter" style="';
        tmp += 'overflow:auto;';
        tmp += 'word-wrap:break-word;';
        tmp += 'background-color:' + background.toCssColorString() + ';';
        tmp += 'color:' + foreground.toCssColorString() + ';';
        tmp += '">';
        tmp += scratchDiv.innerHTML + '</div>';
        scratchDiv.innerHTML = '';

        //Set the final HTML as the description.
        entity.description = tmp;
    }

    function processFeature(dataSource, parent, featureNode, entityCollection, styleCollection, sourceUri, uriResolver) {
        var entity = getOrCreateEntity(featureNode, entityCollection, dataSource._layerId);
        var kmlData = entity.kml;
        var styleEntity = computeFinalStyle(entity, dataSource, featureNode, styleCollection, sourceUri, uriResolver);

        var name = queryStringValue(featureNode, 'name', namespaces.kml);
        entity.name = name;
        entity.parent = parent;

        var availability = processTimeSpan(featureNode);
        if (!defined(availability)) {
            availability = processTimeStamp(featureNode);
        }
        entity.availability = availability;

        var visibility = queryBooleanValue(featureNode, 'visibility', namespaces.kml);
        entity.show = defaultValue(visibility, true);
        //var open = queryBooleanValue(featureNode, 'open', namespaces.kml);

        var authorNode = queryFirstNode(featureNode, 'author', namespaces.atom);
        var author = kmlData.author;
        author.name = queryStringValue(authorNode, 'name', namespaces.atom);
        author.uri = queryStringValue(authorNode, 'uri', namespaces.atom);
        author.email = queryStringValue(authorNode, 'email', namespaces.atom);

        var linkNode = queryFirstNode(featureNode, 'link', namespaces.atom);
        var link = kmlData.link;
        link.href = queryStringAttribute(linkNode, 'href');
        link.hreflang = queryStringAttribute(linkNode, 'hreflang');
        link.rel = queryStringAttribute(linkNode, 'rel');
        link.type = queryStringAttribute(linkNode, 'type');
        link.title = queryStringAttribute(linkNode, 'title');
        link.length = queryStringAttribute(linkNode, 'length');

        kmlData.address = queryStringValue(featureNode, 'address', namespaces.kml);
        kmlData.phoneNumber = queryStringValue(featureNode, 'phoneNumber', namespaces.kml);
        kmlData.snippet = queryStringValue(featureNode, 'Snippet', namespaces.kml);

        processExtendedData(featureNode, entity);
        processDescription(featureNode, entity, styleEntity, uriResolver);

        return {
            entity : entity,
            styleEntity : styleEntity
        };
    }

    function processModel(dataSource, modelNode, entity, styleEntity, sourceUri) {
		var locationNode = queryFirstNode(modelNode, 'Location', namespaces.kml);
		var longitude = queryNumericValue(locationNode, 'longitude', namespaces.kml);
		var latitude = queryNumericValue(locationNode, 'latitude', namespaces.kml);
		var height = queryNumericValue(locationNode, 'altitude', namespaces.kml);
        var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        
        var orientationNode = queryFirstNode(modelNode, 'Orientation', namespaces.kml);
        
        var headingValue = queryNumericValue(orientationNode, 'heading', namespaces.kml);
        if (!defined(headingValue)) {
        	headingValue = 0;
        }
        
        var tiltValue = queryNumericValue(orientationNode, 'tilt', namespaces.kml);
        if (!defined(tiltValue)) {
        	tiltValue = 0;
        }
        
        var rollValue = queryNumericValue(orientationNode, 'roll', namespaces.kml);
        if (!defined(rollValue)) {
        	rollValue = 0;
        }
        
        var heading = Cesium.Math.toRadians(headingValue);
		var pitch = Cesium.Math.toRadians(tiltValue);
		var roll = Cesium.Math.toRadians(rollValue);
		
		// Backward compatible....
		var gltfVersion = CitydbUtil.parse_query_string('gltf_version', window.location.href);
        if (gltfVersion == '0.8') {
        	var heading = Cesium.Math.toRadians(headingValue - 180);
    		var pitch = Cesium.Math.toRadians(180);
        }
		
		var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);
		
		var linkNode = queryFirstNode(modelNode, 'Link', namespaces.kml);
		var hostAndPath = sourceUri.substring(0, sourceUri.lastIndexOf("/"));
		var uri = hostAndPath.concat("/", queryStringValue(linkNode, 'href', namespaces.kml).replace(".dae", ".gltf").trim()); 
		
		entity.label = '';
		entity.position = position;
		entity.orientation = orientation;
		entity.model = {
			uri : uri,
			asynchronous: false
		};
    }	
    
    var geometryTypes = {
        Point : processPoint,
        LineString : processLineStringOrLinearRing,
        LinearRing : processLineStringOrLinearRing,
        Polygon : processPolygon,
        Track : processTrack,
        Model : processModel,
        MultiTrack : processMultiTrack,
        MultiGeometry : processMultiGeometry
    };

    function processDocument(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver) {
        var featureTypeNames = Object.keys(featureTypes);
        var featureTypeNamesLength = featureTypeNames.length;

        for (var i = 0; i < featureTypeNamesLength; i++) {
            var featureName = featureTypeNames[i];
            var processFeatureNode = featureTypes[featureName];

            var childNodes = node.childNodes;
            var length = childNodes.length;
            for (var q = 0; q < length; q++) {
                var child = childNodes[q];
                if (child.localName === featureName && namespaces.kml.indexOf(child.namespaceURI) !== -1) {
                    processFeatureNode(dataSource, parent, child, entityCollection, styleCollection, sourceUri, uriResolver);
                }
            }
        }
    }

    function processFolder(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver) {
        console.log("loading 3DCityDB KML Networklink files...");
		var hostAndPath = sourceUri.substring(0, sourceUri.lastIndexOf("/"));
		
		// "node" ist the <Folder> tag	
		var networklinkEntity = new Entity(createId(node));		
		var networklinkNode = queryFirstNode(node, 'NetworkLink', namespaces.kml);
		
		if (typeof networklinkNode != 'undefined') {
			// store the path of the coresponding Networklink
			var linkNode = queryFirstNode(networklinkNode, 'Link', namespaces.kml);		
			var networklinkUrl = hostAndPath.concat("/", queryStringValue(linkNode, 'href', namespaces.kml).trim()); 		
			
			// Store the boundingbox of each Networklink entity				
			var latLonAltBoxNode = queryFirstNode(queryFirstNode(networklinkNode, 'Region', namespaces.kml), 'LatLonAltBox', namespaces.kml) ;
			var minX = queryNumericValue(latLonAltBoxNode, 'west', namespaces.kml);
			var minY = queryNumericValue(latLonAltBoxNode, 'south',namespaces.kml);
			var maxX = queryNumericValue(latLonAltBoxNode, 'east', namespaces.kml);
			var maxY = queryNumericValue(latLonAltBoxNode, 'north', namespaces.kml);
			
			// we use the attribute "_pathSubscription" as a hook to save the relevant information
			networklinkEntity._pathSubscription = {
				minX: minX,
				minY: minY,
				maxX: maxX,
				maxY: maxY,
				kmlUrl: networklinkUrl
			};

			// pass the name to the networklink entity which will be labeled in the layer tree	
			networklinkEntity.name = queryStringValue(node, 'name', namespaces.kml);
			
			// add the networklink entity to the master entityCollection
			entityCollection.add(networklinkEntity);
		}
		else {
			parent = new Entity(createId(node));
			parent.name = queryStringValue(node, 'name', namespaces.kml);
			entityCollection.add(parent);
			processDocument(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver);
		}
    }

    function processPlacemark(dataSource, parent, placemark, entityCollection, styleCollection, sourceUri, uriResolver) {
        var r = processFeature(dataSource, parent, placemark, entityCollection, styleCollection, sourceUri, uriResolver);
        var entity = r.entity;
        var styleEntity = r.styleEntity;

        var hasGeometry = false;
        var childNodes = placemark.childNodes;
        for (var i = 0, len = childNodes.length; i < len && !hasGeometry; i++) {
            var childNode = childNodes.item(i);
            var geometryProcessor = geometryTypes[childNode.localName];
            if (defined(geometryProcessor)) {
                geometryProcessor(dataSource, childNode, entity, styleEntity, sourceUri);
                hasGeometry = true;
            }
        }

        if (!hasGeometry) {
            entity.merge(styleEntity);
            processPositionGraphics(dataSource, entity, styleEntity);
        }
    }

    function processGroundOverlay(dataSource, parent, groundOverlay, entityCollection, styleCollection, sourceUri, uriResolver) {
        var r = processFeature(dataSource, parent, groundOverlay, entityCollection, styleCollection, sourceUri, uriResolver);
        var entity = r.entity;
        var styleEntity = r.stylEntity;

        var geometry;
        var isLatLonQuad = false;

        var positions = readCoordinates(queryFirstNode(groundOverlay, 'LatLonQuad', namespaces.gx));
        if (defined(positions)) {
            geometry = createDefaultPolygon();
            geometry.hierarchy = new PolygonHierarchy(positions);
            entity.polygon = geometry;
            isLatLonQuad = true;
        } else {
            geometry = new RectangleGraphics();
            entity.rectangle = geometry;

            var latLonBox = queryFirstNode(groundOverlay, 'LatLonBox', namespaces.kml);
            if (defined(latLonBox)) {
                var west = queryNumericValue(latLonBox, 'west', namespaces.kml);
                var south = queryNumericValue(latLonBox, 'south', namespaces.kml);
                var east = queryNumericValue(latLonBox, 'east', namespaces.kml);
                var north = queryNumericValue(latLonBox, 'north', namespaces.kml);

                if (defined(west)) {
                    west = CesiumMath.negativePiToPi(CesiumMath.toRadians(west));
                }
                if (defined(south)) {
                    south = CesiumMath.negativePiToPi(CesiumMath.toRadians(south));
                }
                if (defined(east)) {
                    east = CesiumMath.negativePiToPi(CesiumMath.toRadians(east));
                }
                if (defined(north)) {
                    north = CesiumMath.negativePiToPi(CesiumMath.toRadians(north));
                }
                geometry.coordinates = new Rectangle(west, south, east, north);

                var rotation = queryNumericValue(latLonBox, 'rotation', namespaces.kml);
                if (defined(rotation)) {
                    geometry.rotation = CesiumMath.toRadians(rotation);
                }
            }
        }

        var material;
        var iconNode = queryFirstNode(groundOverlay, 'Icon', namespaces.kml);
        var href = queryStringValue(iconNode, 'href', namespaces.kml);
        if (defined(href)) {
            if (isLatLonQuad) {
                window.console.log('KML - gx:LatLonQuad Icon does not support texture projection.');
            }
            geometry.material = resolveHref(href, dataSource._proxy, sourceUri, uriResolver);
        } else {
            geometry.material = queryColorValue(groundOverlay, 'color', namespaces.kml);
        }

        var altitudeMode = queryStringValue(groundOverlay, 'altitudeMode', namespaces.kml);

        var altitude;
        if (defined(altitudeMode)) {
            if (altitudeMode === 'absolute') {
                //Use height above ellipsoid until we support MSL.
                geometry.height = queryNumericValue(groundOverlay, 'altitude', namespaces.kml);
            } else if (altitudeMode === 'clampToGround') {
                //Just use the default of 0 until we support terrain
            } else {
                window.console.log('KML - Unknown altitudeMode: ' + altitudeMode);
            }
        } else {
            altitudeMode = queryStringValue(groundOverlay, 'altitudeMode', namespaces.gx);
            if (altitudeMode === 'relativeToSeaFloor') {
                window.console.log('KML - altitudeMode relativeToSeaFloor is currently not supported, treating as absolute.');
                geometry.height = queryNumericValue(groundOverlay, 'altitude', namespaces.kml);
            } else if (altitudeMode === 'clampToSeaFloor') {
                window.console.log('KML - altitudeMode clampToSeaFloor is currently not supported, treating as clampToGround.');
            } else if (defined(altitudeMode)) {
                window.console.log('KML - Unknown altitudeMode: ' + altitudeMode);
            }
        }
    }

    function processLookAt(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver) {
        dataSource._lookAt = {
    		lat: queryNumericValue(node, 'latitude', namespaces.kml),	
    		lon: queryNumericValue(node, 'longitude', namespaces.kml),
			range: queryNumericValue(node, 'range', namespaces.kml),
			tilt: queryNumericValue(node, 'tilt', namespaces.kml),
			heading:  queryNumericValue(node, 'heading', namespaces.kml),
			altitude: queryNumericValue(node, 'altitude', namespaces.kml)
    	}
    }
    
    function processUnsupported(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver) {
        window.console.log('KML - Unsupported feature: ' + node.localName);
    }

    var featureTypes = {
        Document : processDocument,
        Folder : processFolder,
        LookAt : processLookAt,
        Placemark : processPlacemark,
        GroundOverlay : processGroundOverlay,
        PhotoOverlay : processUnsupported,
        ScreenOverlay : processUnsupported
    };

    function processFeatureNode(dataSource, node, parent, entityCollection, styleCollection, sourceUri, uriResolver) {
        var featureProocessor = featureTypes[node.localName];
        if (defined(featureProocessor)) {
            featureProocessor(dataSource, parent, node, entityCollection, styleCollection, sourceUri, uriResolver);
        } else {
            window.console.log('KML - Unsupported feature node: ' + node.localName);
        }
    }

    function loadKml(dataSource, kml, sourceUri, uriResolver) {
        var entityCollection = dataSource._entityCollection;

        dataSource._promises = [];
        entityCollection.removeAll();

        var documentElement = kml.documentElement;
        var document = documentElement.localName === 'Document' ? documentElement : queryFirstNode(documentElement, 'Document', namespaces.kml);
        var name = queryStringValue(document, 'name', namespaces.kml);
        if (!defined(name) && defined(sourceUri)) {
            name = getFilenameFromUri(sourceUri);
        }

        var styleCollection = new EntityCollection();
        return when.all(processStyles(dataSource, kml, styleCollection, sourceUri, false, uriResolver), function() {
            var element = kml.documentElement;
            if (element.localName === 'kml') {
                element = element.firstElementChild;
            }
            processFeatureNode(dataSource, element, undefined, entityCollection, styleCollection, sourceUri, uriResolver);

            return when.all(dataSource._promises, function() {
                var clock;
                var availability = entityCollection.computeAvailability();

                var start = availability.start;
                var stop = availability.stop;
                var isMinStart = JulianDate.equals(start, Iso8601.MINIMUM_VALUE);
                var isMaxStop = JulianDate.equals(stop, Iso8601.MAXIMUM_VALUE);
                if (!isMinStart || !isMaxStop) {
                    var date;

                    //If start is min time just start at midnight this morning, local time
                    if (isMinStart) {
                        date = new Date();
                        date.setHours(0, 0, 0, 0);
                        start = JulianDate.fromDate(date);
                    }

                    //If stop is max value just stop at midnight tonight, local time
                    if (isMaxStop) {
                        date = new Date();
                        date.setHours(24, 0, 0, 0);
                        stop = JulianDate.fromDate(date);
                    }

                    clock = new DataSourceClock();
                    clock.startTime = start;
                    clock.stopTime = stop;
                    clock.currentTime = JulianDate.clone(start);
                    clock.clockRange = ClockRange.LOOP_STOP;
                    clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
                    clock.multiplier = Math.round(Math.min(Math.max(JulianDate.secondsDifference(stop, start) / 60, 1), 3.15569e7));
                }
                var changed = false;
                if (dataSource._name !== name) {
                    dataSource._name = name;
                    changed = true;
                }

                if (clock !== dataSource._clock) {
                    changed = true;
                    dataSource._clock = clock;
                }

                if (changed) {
                    dataSource._changed.raiseEvent(dataSource);
                }

                DataSource.setLoading(dataSource, false);
                return dataSource;
            });
        });
    }

    function loadKmz(dataSource, blob, sourceUri) {
        var deferred = when.defer();
        zip.createReader(new zip.BlobReader(blob), function(reader) {
            reader.getEntries(function(entries) {
                var promises = [];
                var foundKML = false;
                var uriResolver = {};
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (!entry.directory) {
                        var innerDefer = when.defer();
                        promises.push(innerDefer.promise);
                        if (!foundKML && /\.kml$/i.test(entry.filename)) {
                            //Only the first KML file found in the zip is used.
                            //https://developers.google.com/kml/documentation/kmzarchives
                            foundKML = true;
                            loadXmlFromZip(reader, entry, uriResolver, innerDefer);
                        } else {
                            loadDataUriFromZip(reader, entry, uriResolver, innerDefer);
                        }
                    }
                }
                when.all(promises).then(function() {
                    reader.close();
                    if (!defined(uriResolver.kml)) {
                        deferred.reject(new RuntimeError('KMZ file does not contain a KML document.'));
                        return;
                    }
                    uriResolver.keys = Object.keys(uriResolver);
                    return loadKml(dataSource, uriResolver.kml, sourceUri, uriResolver);
                }).then(deferred.resolve).otherwise(deferred.reject);
            });
        }, function(e) {
            deferred.reject(e);
        });

        return deferred;
    }

    /**
     * A {@link DataSource} which processes Keyhole Markup Language 2.2 (KML).
     * <p>
     * KML support in Cesium is incomplete, but a large amount of the standard,
     * as well as Google's <code>gx</code> extension namespace, is supported. See Github issue
     * {@link https://github.com/AnalyticalGraphicsInc/cesium/issues/873|#873} for a
     * detailed list of what is and isn't support. Cesium will also write information to the
     * console when it encounters most unsupported features.
     * </p>
     * <p>
     * Non visual feature data, such as <code>atom:author</code> and <code>ExtendedData</code>
     * is exposed via an instance of {@link KmlFeatureData}, which is added to each {@link Entity}
     * under the <code>kml</code> property.
     * </p>
     *
     * @alias CitydbKmlDataSource
     * @constructor
     *
     * @param {DefaultProxy} [proxy] A proxy to be used for loading external data.
     *
     * @see {@link http://www.opengeospatial.org/standards/kml/|Open Geospatial Consortium KML Standard}
     * @see {@link https://developers.google.com/kml/|Google KML Documentation}
     *
     * @demo {@link http://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=KML.html|Cesium Sandcastle KML Demo}
     *
     * @example
     * var viewer = new Cesium.Viewer('cesiumContainer');
     * viewer.dataSources.add(Cesium.CitydbKmlDataSource.load('../../SampleData/facilities.kmz'));
     */
    var CitydbKmlDataSource = function(layerId, proxy) {
        this._changed = new Event();
        this._error = new Event();
        this._loading = new Event();
        this._clock = undefined;
        this._entityCollection = new EntityCollection();
        this._name = undefined;
        this._isLoading = false;
        this._proxy = proxy;
        this._pinBuilder = new PinBuilder();
        this._promises = [];
        this._layerId = layerId;
        this._lookAt = null;
    };

    /**
     * Creates a Promise to a new instance loaded with the provided KML data.
     *
     * @param {String|Document|Blob} data A url, parsed KML document, or Blob containing binary KMZ data or a parsed KML document.
     * @param {Object} [options] An object with the following properties:
     * @param {DefaultProxy} [options.proxy] A proxy to be used for loading external data.
     * @param {String} [options.sourceUri] Overrides the url to use for resolving relative links and other KML network features.
     * @returns {Promise} A promise that will resolve to a new CitydbKmlDataSource instance once the KML is loaded.
     */
    CitydbKmlDataSource.load = function(data, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var dataSource = new CitydbKmlDataSource(options.proxy);
        return dataSource.load(data, options);
    };

    defineProperties(CitydbKmlDataSource.prototype, {
        /**
         * Gets a human-readable name for this instance.
         * This will be automatically be set to the KML document name on load.
         * @memberof CitydbKmlDataSource.prototype
         * @type {String}
         */
        name : {
            get : function() {
                return this._name;
            }
        },
        /**
         * Gets the clock settings defined by the loaded KML. This represents the total
         * availability interval for all time-dynamic data. If the KML does not contain
         * time-dynamic data, this value is undefined.
         * @memberof CitydbKmlDataSource.prototype
         * @type {DataSourceClock}
         */
        clock : {
            get : function() {
                return this._clock;
            }
        },
        /**
         * Gets the collection of {@link Entity} instances.
         * @memberof CitydbKmlDataSource.prototype
         * @type {EntityCollection}
         */
        entities : {
            get : function() {
                return this._entityCollection;
            }
        },
        /**
         * Gets a value indicating if the data source is currently loading data.
         * @memberof CitydbKmlDataSource.prototype
         * @type {Boolean}
         */
        isLoading : {
            get : function() {
                return this._isLoading;
            }
        },
        /**
         * Gets an event that will be raised when the underlying data changes.
         * @memberof CitydbKmlDataSource.prototype
         * @type {Event}
         */
        changedEvent : {
            get : function() {
                return this._changed;
            }
        },
        /**
         * Gets an event that will be raised if an error is encountered during processing.
         * @memberof CitydbKmlDataSource.prototype
         * @type {Event}
         */
        errorEvent : {
            get : function() {
                return this._error;
            }
        },
        /**
         * Gets an event that will be raised when the data source either starts or stops loading.
         * @memberof CitydbKmlDataSource.prototype
         * @type {Event}
         */
        loadingEvent : {
            get : function() {
                return this._loading;
            }
        }
    });

    /**
     * Asynchronously loads the provided KML data, replacing any existing data.
     *
     * @param {String|Document|Blob} data A url, parsed KML document, or Blob containing binary KMZ data or a parsed KML document.
     * @param {Object} [options] An object with the following properties:
     * @param {Number} [options.sourceUri] Overrides the url to use for resolving relative links and other KML network features.
     * @returns {Promise} A promise that will resolve to this instances once the KML is loaded.
     */
    CitydbKmlDataSource.prototype.load = function(data, options) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(data)) {
            throw new DeveloperError('data is required.');
        }
        //>>includeEnd('debug');

        DataSource.setLoading(this, true);

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var sourceUri = options.sourceUri;

        var promise = data;
        if (typeof data === 'string') {
            promise = loadBlob(proxyUrl(data, this._proxy));
            sourceUri = defaultValue(sourceUri, data);
        }

        var that = this;
        return when(promise, function(dataToLoad) {
            if (dataToLoad instanceof Blob) {
                return isZipFile(dataToLoad).then(function(isZip) {
                    if (isZip) {
                        return loadKmz(that, dataToLoad, sourceUri);
                    }
                    return when(readBlobAsText(dataToLoad)).then(function(text) {
                        //There's no official way to validate if a parse was successful.
                        //The following check detects the error on various browsers.

                        //IE raises an exception
                        var kml;
                        var error;
                        try {
                            kml = parser.parseFromString(text, 'application/xml');
                        } catch (e) {
                            error = e.toString();
                        }

                        //The pase succeeds on Chrome and Firefox, but the error
                        //handling is different in each.
                        if (defined(error) || kml.body || kml.documentElement.tagName === 'parsererror') {
                            //Firefox has error information as the firstChild nodeValue.
                            var msg = defined(error) ? error : kml.documentElement.firstChild.nodeValue;

                            //Chrome has it in the body text.
                            if (!msg) {
                                msg = kml.body.innerText;
                            }

                            //Return the error
                            throw new RuntimeError(msg);
                        }
                        return loadKml(that, kml, sourceUri, undefined);
                    });
                });
            } else {
                return when(loadKml(that, dataToLoad, sourceUri, undefined));
            }
        }).otherwise(function(error) {
            DataSource.setLoading(that, false);
            that._error.raiseEvent(that, error);
            window.console.log(error);
            return when.reject(error);
        });
    };

    /**
     * Contains KML Feature data loaded into the <code>Entity.kml</code> property by {@link CitydbKmlDataSource}.
     * @alias KmlFeatureData
     * @constructor
     */
    var KmlFeatureData = function() {
        /**
         * Gets the atom syndication format author field.
         * @type Object
         */
        this.author = {
            /**
             * Gets the name.
             * @type String
             * @alias author.name
             * @memberof! KmlFeatureData#
             * @property author.name
             */
            name : undefined,
            /**
             * Gets the URI.
             * @type String
             * @alias author.uri
             * @memberof! KmlFeatureData#
             * @property author.uri
             */
            uri : undefined,
            /**
             * Gets the email.
             * @type String
             * @alias author.email
             * @memberof! KmlFeatureData#
             * @property author.email
             */
            email : undefined
        };

        /**
         * Gets the link.
         * @type Object
         */
        this.link = {
            /**
             * Gets the href.
             * @type String
             * @alias link.href
             * @memberof! KmlFeatureData#
             * @property link.href
             */
            href : undefined,
            /**
             * Gets the language of the linked resource.
             * @type String
             * @alias link.hreflang
             * @memberof! KmlFeatureData#
             * @property link.hreflang
             */
            hreflang : undefined,
            /**
             * Gets the link relation.
             * @type String
             * @alias link.rel
             * @memberof! KmlFeatureData#
             * @property link.rel
             */
            rel : undefined,
            /**
             * Gets the link type.
             * @type String
             * @alias link.type
             * @memberof! KmlFeatureData#
             * @property link.type
             */
            type : undefined,
            /**
             * Gets the link title.
             * @type String
             * @alias link.title
             * @memberof! KmlFeatureData#
             * @property link.title
             */
            title : undefined,
            /**
             * Gets the link length.
             * @type String
             * @alias link.length
             * @memberof! KmlFeatureData#
             * @property link.length
             */
            length : undefined
        };

        /**
         * Gets the unstructured address field.
         * @type String
         */
        this.address = undefined;
        /**
         * Gets the phone number.
         * @type String
         */
        this.phoneNumber = undefined;
        /**
         * Gets the snippet.
         * @type String
         */
        this.snippet = undefined;
        /**
         * Gets the extended data, parsed into a JSON object.
         * Currently only the <code>Data</code> property is supported.
         * <code>SchemaData</code> and custom data are ignored.
         * @type String
         */
        this.extendedData = undefined;
    };

    window.CitydbKmlDataSource = CitydbKmlDataSource;
})();



