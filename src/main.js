$(document).ready(function() {

    myApp.loadData();

});

// Load JSON + CSV files
myApp.loadData = function() {

    // Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
    var formatDate = d3.time.format("%Y");

    // Use the Queue.js library to read in data
    queue()    
        .defer(d3.json, "data/us-states.json")
        .defer(d3.csv, "data/OD_data.csv")                 
        .await(function(error, usMap, odData){

            // Convert numeric values to 'numbers'
            odData.forEach(function(d){

                // Convert string to 'date object'
                d.year = formatDate.parse(d.year); 
                d.rate        = +d.rate;
                d.num_deaths = +d.num_deaths.replace(/\,/g,'') 
            });            

            //Pass in processed data here
            myApp.createVis(usMap, odData);
        });
};

myApp.createVis = function (usMap, odData) {

    //console.log(odData);
    //console.log(usMap)
    var map = new myApp.Choropleth("map-area", usMap, odData);

}


