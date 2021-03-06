// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"



// create variables for each base layer
var basemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

// create variables for each overlay layer
var earthquakelayer = L.layerGroup();
var faultlayer = L.layerGroup();


// Create two separate layer groups: one for base layers and one for overlays
var basemaps = { "base": basemap, "light": light, "dark": dark, "satellite": satellite }
var overlayMaps = { "Earthquakes": earthquakelayer, "Fault Lines": faultlayer }

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    console.log(data)
    // Once we get a response, send the data.features object to the createMarkers function
    createMarkers(data);
});

// function to determine color each feature displayed on the map
function colorfunction(mag) {
    var color = "";
    if (mag < 1) {
        return ("#98ee00");
    }
    else if (mag < 2) {
        return ("#d4ee00");
    }
    else if (mag < 3) {
        return ("#eecc00");
    }
    else if (mag < 4) {
        return ("#ee9c00");
    }
    else if (mag < 5) {
        return ("#ea822c");
    }
    else if (mag >= 5) {
        return ("#ea2c2c");
    }
}



function createMarkers(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    function myStyle(feature) {
        return {
            radius: feature.properties.mag * 4,
            fillColor: colorfunction(feature.properties.mag),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    };

    // Give each feature a popup describing the place and time of the earthquake
    function createMarker(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array in the earthquakeData object
    // Run the createMarker function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: createMarker,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, myStyle);
        },
        style: myStyle
    }).addTo(earthquakelayer);

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}


function createMap(earthquakes) {
    
    // Create a map object
    var map = L.map("map", {
        center: [15.5994, -28.6731],
        zoom: 3,
        layers: [basemap, earthquakes]
    });

    // Create Fault layer and add to map
    d3.json(queryUrl2, function (data) {
        L.geoJSON(data, {
            color: "black"
        }).addTo(faultlayer);

        faultlayer.addTo(map)
    });

    // Add earthquake layer to map
    earthquakelayer.addTo(map)

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(basemaps, overlayMaps).addTo(map);

    //construct map legend
    var legend = L.control({
        position: "bottomright"
    });

    //create div on add
    legend.onAdd = function () {
        var div = L
            .DomUtil
            .create("div", "info legend");

        //color/label arrays for legend
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        //loop for defining the html of the div itself
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    //add legend to the map
    legend.addTo(map);

}



