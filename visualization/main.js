var ma_band = [];
var lo_band = [];
var hi_band = [];
var elem1 = document.createElement('div1');
var elem2 = document.createElement('div2');
var first_plot = 1;

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
    /*setTimeout(function() {
        console.log("hello");
    }), 3000;*/
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
    var n = 10;
    var k = 1;

    var parseDate = d3.time.format("%m/%d/%Y").parse;

    //console.log(rows);

    /*rows.forEach(function (d) {
        d.date = parseDate(d[0]);
        d.close = parseInt(d[1]);
    });*/

    //var bandsData = getBollingerBands(n, k, datarows);
    getBollingerBands(n, k, rows);
    //console.log("ajdkfhjkashdfklashjdflkahs");
    //console.log(ma_band);
    //console.log(lo_band);
    //console.log(hi_band);

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
        title: 'Euro-dollar exchange rate',
        };
        if(first_plot == 1){
            if(visIndex == 1) {
                elem1.setAttribute("id", "myDiv1");
                //elem2.setAttribute("id", "myDiv2");
                document.body.appendChild(elem1);
                //document.body.appendChild(elem2);
                Plotly.newPlot('myDiv1', data, layout);
                first_plot = 0;

            }
            else {
                elem2.setAttribute("id", "myDiv2");
                document.body.appendChild(elem2);
                Plotly.newPlot('myDiv2', data, layout);
                first_plot = 0;
            }
        }
        else{
            Plotly.update('myDiv1', data, layout);
            console.log("not first plot")

            //Plotly.update('myDiv2', data, layout);
        }

        if(visIndex == 1){
            graphDiv = document.getElementById("myDiv1");
            graphDiv.on('plotly_relayout', function(eventData) {
                var begin = eventData['xaxis.range[0]'];
                var begin_t = begin.split(" ")[0];
                var end = eventData['xaxis.range[1]'];
                var end_t = end.split(" ")[0];

                console.log(begin_t)
                console.log(end_t)

                var value = begin.split(" ")[1].split(":")[2];
                layout = {
                    xaxis: {
                        range: [begin_t, end_t],
                        type: 'date'
                    }
                }
                Plotly.update('myDiv2', data, layout);
            });
        }
        else {
            graphDiv = document.getElementById("myDiv2");
        }

        /*console.log(graphDiv);
        graphDiv.on('plotly_relayout', function(eventData) {
            //console.log(eventData)
            console.log(eventData['xaxis.range[0]'])
            var begin = eventData['xaxis.range[0]'];
            var begin_t = begin.split(" ")[0];
            var end = eventData['xaxis.range[1]'];
            var end_t = end.split(" ")[0];

            console.log(begin_t)
            console.log(end_t)

            var value = begin.split(" ")[1].split(":")[2];
            layout = {
                xaxis: {
                    range: [begin_t, end_t],
                    type: 'date'
                }
            }
            Plotly.update('myDiv2', data, layout);
            });*/

        //var elem = document.createElement('div');
        //elem.setAttribute("id", "myDiv");
        //document.body.appendChild(elem);
        
        //Plotly.newPlot('myDiv', data, layout);
        //Plotly.update("myDiv", data, layout)
    });

    //var slidwindow = document.getElementById("slidingwindow_rng");
    //var out_slid = document.getElementById("slid");
    //var slidthresh = document.getElementById("threshold_rng");
    //var out_thresh = document.getElementById("thresh");

    //out_slid.innerHTML = slidwindow.value;
    //out_thresh.innerHTML = slidthresh.value;

    //slidwindow.oninput = function() {
    //    out_slid.innerHTML = this.value;
    //    console.log(this.value)
    //};
    //slidthresh.oninput = function() {
    //    out_thresh.innerHTML = this.value;
    //    console.log(this.value)
    //};


    /*function getBollingerBands(n, k, data) {
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
    }*/
}

getBollingerBands = function(n, k, data) {
    ma_band = [];
    lo_band = [];
    hi_band = [];
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


// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
}