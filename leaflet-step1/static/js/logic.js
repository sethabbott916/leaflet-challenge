// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data.features)
  // Once we get a response, send the data.features object to the createFeatures function
  createMarkers(data.features);
});

function colorfunction(mag) {

    var color = "";
    if (mag < 1) {
      return("blue");
    }
    else if (mag < 2) {
      return("green");
    }
    else if (mag < 3) {
      return("yellow");
    }
    else if (mag < 4) {
        return("orange");
    }
    else if (mag >= 4) {
        return("red");
    }
    
}

function createMarkers (earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function createMarker(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }


    function myStyle(feature) {

        return{
        radius: feature.properties.mag * 4,
        fillColor: colorfunction(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8}
    };
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: createMarker,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, myStyle);
        },
        style: myStyle
    });
    
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}


function createMap(earthquakes) {
// Create a map object
    var basemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    var map = L.map("map", {
        center: [15.5994, -28.6731],
        zoom: 3,
        layers: [basemap, earthquakes]
    });
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var legend2 = L.DomUtil.create("div", "info legend"), 
        levels = [0, 1, 2, 3, 4, 5];
        colors = ["#f40202", "green", "yellow", "orange", "red"];
    
        for (var i = 0; i < levels.length; i++) {
            legend2.innerHTML +=
            `<i style='background: "${colors[i]}"'></i>`            +
                levels[i] + (levels[i] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        }
        return legend2;
    };
    legend.addTo(map)
}    



