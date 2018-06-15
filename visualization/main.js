// When clicking on Download Visualization this function is called to apply all additional
// transformations on the svg before the visualization is downloaded
// All of the styles should be applied inline to the svg elements
// @return - If the visualization does not support downloading, then simply return false
//           if it does support, then return true
// NOTE: The download functionality requires that the visualization is in a svg AND the svg is
//       appended directly to the body
/* OVERWRITE */
revertCssFromSvg = function() {
    console.log("revertCssFromSvg");
}


// After the visualization image for the download has been created, this function is called
// to eventually revert some changes
/* OVERWRITE */
applyCssToSvg = function () {
    console.log("applyCssToSvg");
}


// The filtered datarows get passed to this function and it should filter the elements in
// the visualization
/* OVERWRITE */
// @param filteredDatarows - the datarows which are already filtered
applyFilter = function(filteredDatarows) {
    console.log("applyCssToSvg");
}

// method for drawing the visualization
// the visualization is hosted in an iframe, thus the visualization should be written directly to the body
// @param datarows - an array with rows which should be displayed
// @param channelMappings - holds what column should be mapped to what channel, what the data type of
//                          column is, etc.
// @param visIndex - the index or ID of the visualization. Only needed for brushing
drawVisualization = function (datarows, channelMappings, visIndex) {
    /*REGISTRATION TO THE BRUSHING OBSERVER*/
    /* DO NOT REMOVE */
    brushingObserver.registerListener(visIndex, brushUpdateCallback);


    // TODO: Add your visualization code here

    xIndex = channelMappings.findIndex(elem => (elem.channel === "x-axis"));
    yIndex = channelMappings.findIndex(elem => (elem.channel === "y-axis"));

    var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 50
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    //var n = 20; // n-period of moving average
    //var k = 2; // k times n-period standard deviation above/below moving average
    var n = 2;
    var k = 2;

    var parseDate = d3.time.format("%m/%d/%Y").parse;

    var x = d3.time.scale()
      .range([0, width]);
    var y = d3.scale.linear()
      .range([height, 0]);
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(3, 0);
    var line = d3.svg.line()
      .x(function (d) {
          return x(d.date);
      })
      .y(function (d) {
          return y(d.close);
      });
    var ma = d3.svg.line()
      .x(function (d) {
          return x(d.date);
      })
      .y(function (d) {
          return y(d.ma);
      });
    var lowBand = d3.svg.line()
      .x(function (d) {
          return x(d.date);
      })
      .y(function (d) {
          return y(d.low);
      });
    var highBand = d3.svg.line()
      .x(function (d) {
          return x(d.date);
      })
      .y(function (d) {
          return y(d.high);
      });
    var bandsArea = d3.svg.area()
      .x(function (d) {
          return x(d.date);
      })
      .y0(function (d) {
          return y(d.low);
      })
      .y1(function (d) {
          return y(d.high);
      });

    x.domain(datarows.map(function (d) {
        return d[xIndex];
    }));
    y.domain([0, d3.max(datarows, function (d) {
        return d[yIndex];
    })]);

    console.log(datarows);

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    datarows.forEach(function (d) {
        d.date = parseDate(d[0]);
        d.close = parseInt(d[1]);
    });
    console.log(datarows);

    var ma_band = [];
    var lo_band = [];
    var hi_band = [];

    //var bandsData = getBollingerBands(n, k, datarows);
    getBollingerBands(n, k, datarows);
    console.log("ajdkfhjkashdfklashjdflkahs");
    console.log(ma_band);
    console.log(lo_band);
    console.log(hi_band);

    x.domain(d3.extent(datarows, function (d) {
        return d.date;
    }));
    y.domain([d3.min(bandsData, function (d) {
        return d.low;
    }),
        d3.max(bandsData, function (d) {
            return d.high;
        })
    ]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("path")
      .datum(bandsData)
      .attr("class", "area bands")
      .attr("d", bandsArea);
    svg.append("path")
      .datum(bandsData)
      .attr("class", "line bands")
      .attr("d", lowBand);
    svg.append("path")
      .datum(bandsData)
      .attr("class", "line bands")
      .attr("d", highBand);
    svg.append("path")
      .datum(bandsData)
      .attr("class", "line ma bands")
      .attr("d", ma);

    svg.append("path")
      .datum(datarows)
      .attr("class", "line")
      .attr("d", line);


    function getBollingerBands(n, k, data) {
        var bands = []; //{ ma: 0, low: 0, high: 0 }
        for (var i = n - 1, len = data.length; i < len; i++) {
            var slice = data.slice(i + 1 - n, i);
            var mean = d3.mean(slice, function (d) {
                return d.close;
            });
            var stdDev = Math.sqrt(d3.mean(slice.map(function (d) {
                return Math.pow(d.close - mean, 2);
            })));
            /*bands.push({
                date: data[i].date,
                ma: mean,
                low: mean - (k * stdDev),
                high: mean + (k * stdDev)
            });*/

            ma_band.push({
                date: data[i].date,
                ma: mean
            });

            lo_band.push({
                date: data[i].date,
                low: mean - (k * stdDev)
            });


            hi_band.push({
                date: data[i].date,
                high: mean + (k * stdDev)
            });

            /*bands.push({
                ma: ma_band,
                lo: lo_band,
                hi:hi_band
            });
            return bands;*/
        }
    }
}


// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
}