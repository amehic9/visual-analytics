var ma_band = [];
var lo_band = [];
var hi_band = [];

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

    Plotly.d3.csv("./visualization/dollareuro.csv", function(err, rows){
        
        function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
        }



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
    var n = 20;
    var k = 2;

    var parseDate = d3.time.format("%m/%d/%Y").parse;

    console.log(rows);

    /*rows.forEach(function (d) {
        d.date = parseDate(d[0]);
        d.close = parseInt(d[1]);
    });*/
    //console.log(datarows);

    //var bandsData = getBollingerBands(n, k, datarows);
    getBollingerBands(n, k, rows);
    console.log("ajdkfhjkashdfklashjdflkahs");
    console.log(ma_band);
    console.log(lo_band);
    console.log(hi_band);




        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'exchange rate',
            x: unpack(rows, 'date'),
            y: unpack(rows, 'close'),
            line: {color: '#17BECF'}
        }

        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'mean',
            x: unpack(ma_band, 'date'),
            y: unpack(ma_band, 'close'),
            line: {color: 'red'}
        }

        var trace3 = {
            type: "scatter",
            mode: "lines",
            name: 'low',
            x: unpack(lo_band, 'date'),
            y: unpack(lo_band, 'close'),
            line: {color: 'blue'}
        }

        var trace4 = {
            type: "scatter",
            mode: "lines",
            name: 'high',
            x: unpack(hi_band, 'date'),
            y: unpack(hi_band, 'close'),
            line: {color: 'yellow'}
        }

        var data = [trace1, trace2, trace3, trace4];

        var layout = {
        title: 'Euro-dolar exchange rate',
        };

        var elem = document.createElement('div');
        elem.setAttribute("id", "myDiv");
        document.body.appendChild(elem);
        
        Plotly.newPlot('myDiv', data, layout);
    })


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

            ma_band.push({
                date: data[i].date,
                close: mean
            });

            lo_band.push({
                date: data[i].date,
                close: mean - (k * stdDev)
            });


            hi_band.push({
                date: data[i].date,
                close: mean + (k * stdDev)
            });
        }
    }
}


// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
}