Choropleth = function(_parentElement, _usMap, _odData){
    this.parentElement = _parentElement;
    this.usMap = _usMap; 
    this.odData  = _odData;
    this.initVis();
}

/*=================================================================
* Initialize visualization (static content, e.g. SVG area or axes)
*=================================================================*/

Choropleth.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top: 50, right: 50, bottom: 50, left: 50};

    vis.width = 800 - vis.margin.left - vis.margin.right;

    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#map-area").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.map = vis.g.append("g")
        .attr("transform", "translate(100,100)");

    //Set colorscale # of buckets
    vis.colorBuckets = 7;

    //Set colorscale range
    vis.colorScale = d3.scale.quantize()
        .range(colorbrewer.BuGn[vis.colorBuckets]);
        //.range(colorbrewer.Reds[vis.colorBuckets]);

    //Define map projection
    vis.projection = d3.geo.albersUsa()
        .translate([150, 100])
        .scale([800]);

    //Define default path generator
    vis.path = d3.geo.path()
        .projection(vis.projection);

    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
}

/*=================================================================
* Data Wrangling
*=================================================================*/
Choropleth.prototype.wrangleData = function(){
    var vis = this;

    //filter od data by year 2015
    vis.filteredData = vis.odData.filter(function (value) {
        return (value.year.getFullYear() == 2015);
    });

    console.log(vis.filteredData);

    // Update the visualization
    vis.updateVis();
}


/*=================================================================
 * The drawing function - should use the D3 update sequence 
 * Function parameters only needed if different kinds of updates are needed
*=================================================================*/

 Choropleth.prototype.updateVis = function(){
    var vis = this;

    //color domain
    var domainExtent = d3.extent(d3.values(vis.filteredData), function(d) { return d.rate; });
    vis.colorScale.domain(domainExtent);

    //Initialize tooltip for Map
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .style("text-align", "center");

    vis.map.call(tip);

    //add tip function
    tip.html(function (d) {
        return "State: " + d.properties.name + "<br>Rate: " + d.values.rate
    });


    vis.usMap.features.forEach(function(d) {
        var entity = vis.filteredData.filter(function(x) {
            return d.properties.name === $.trim(x.state);
        })[0];
        if(entity) {
            d.values = entity;
        } else {
            d.values = {rate: 0, num_deaths: 0, year: 2015};
        }
    });


    vis.map.selectAll(".states")
        .data(vis.usMap.features)
        .enter()
        .append("path")
        .attr("class", "states")
        .attr("d", vis.path)
        .attr("fill", function(d) { 
            return vis.colorScale(d.values.rate);
        })
        .style("stroke", "grey")
        .style("stroke-width", ".5")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(d) {
            vis.getData(d)
        });
   
}

 Choropleth.prototype.getData = function(d) {
    var vis = this;

    var thisState = d.properties.name;
    console.log(thisState)

    //filter fulldata to this state only
    vis.stateData = vis.odData.filter(function (value) {
        return (value.state == thisState);
    });

    console.log(vis.stateData);

    /*/remove old graph
    d3.selectAll("#line-graph-area")
        .transition().delay(0).duration(0)
        .style("opacity", "0")
        .remove();*/

    setTimeout(function() {  
        var lineGraph = new LineGraph("line-graph-area", vis.stateData);
    }, 0);

}









