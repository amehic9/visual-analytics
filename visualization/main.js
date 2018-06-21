var ma_band = [];
var lo_band = [];
var hi_band = [];
var data;

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
applyFilter = function(interval) {
    console.log("applyCssToSvg");

    graphDiv = document.getElementById("myDiv1");
    console.log(graphDiv);

    var frames = window.parent.frames;
    for (var i = 0; i < frames.length; i++) {
        if(frames[i].document.getElementById("myDiv2")){
            console.log(frames[i].document.getElementById("myDiv2"));
            Plotly.update(frames[i].document.getElementById("myDiv2"), data, interval)
        }
    }
};

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
    //console.log(window.parent.frames)

    Plotly.d3.csv("./visualization/dollareuro.csv", function(err, rows){
        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
        }

        xIndex = channelMappings.findIndex(elem => (elem.channel === "x-axis"));
        yIndex = channelMappings.findIndex(elem => (elem.channel === "y-axis"));

        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };

        var n = 10;
        var k = 1;
        getBollingerBands(n, k, rows);

        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'exchange rate',
            x: unpack(rows, 'date'),
            y: unpack(rows, 'close'),
            line: {color: '#17BECF'}
        };

        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'mean',
            x: unpack(ma_band, 'date'),
            y: unpack(ma_band, 'close'),
            line: {color: 'red'}
        };

        var trace3 = {
            type: "scatter",
            mode: "lines",
            name: 'low',
            x: unpack(lo_band, 'date'),
            y: unpack(lo_band, 'close'),
            line: {color: 'blue'}
        };

        var trace4 = {
            type: "scatter",
            mode: "lines",
            name: 'high',
            x: unpack(hi_band, 'date'),
            y: unpack(hi_band, 'close'),
            line: {color: 'yellow'}
        };

        data = [trace1, trace2, trace3, trace4];

        if(visIndex == 1){
            //var frame1 = document.getElementById("visualization-iframe");
            var elem1 = document.createElement('myDiv1');
            elem1.setAttribute("id", "myDiv1");
            document.body.appendChild(elem1);
            var layout = {
                title: 'Euro-dollar exchange rate',
            };
            Plotly.newPlot('myDiv1', data, layout);
        }
        else {
            //var frame2 = document.getElementById("second-visualization-iframe");
            var elem2 = document.createElement('myDiv2');
            elem2.setAttribute("id", "myDiv2");
            document.body.appendChild(elem2);
            var fixed_layout = {
                title: 'Euro-dollar exchange rate',
                xaxis: {
                    fixedrange: true
                },
                yaxis: {
                    fixedrange: true
                }
            };
            Plotly.newPlot('myDiv2', data, fixed_layout);
        }

        graphDiv = document.getElementById("myDiv1");
        if(graphDiv){
            graphDiv.on('plotly_relayout', function(eventData) {
                console.log(eventData)
                if(eventData["xaxis.autorange"]){
                    console.log("doubleclick");
                    layout = {
                        xaxis: {
                            autorange: true,
                            fixedrange: true
                        },
                        yaxis: {
                            autorange: true,
                            fixedrange: true
                        }
                    };
                    applyFilter(layout);
                }
                else{
                    if(eventData['xaxis.range[0]']){
                        console.log("select");
                        var begin_t = eventData['xaxis.range[0]'].split(" ")[0];
                        var end_t = eventData['xaxis.range[1]'].split(" ")[0];

                        var begin_v = eventData['yaxis.range[0]'];
                        var end_v = eventData['yaxis.range[1]'];
                        layout = {
                            xaxis: {
                                range: [begin_t, end_t],
                                fixedrange: true
                            },
                            yaxis: {
                                range: [begin_v, end_v],
                                fixedrange: true
                            }
                        };
                        applyFilter(layout);
                    }
                }
            });

            /*graphDiv.on('plotly_doubleclick', function(eventData) {
             console.log("doubleclick");
             console.log(eventData['xaxis.range[0]']);
             console.log(eventData)
             var begin_t = eventData['xaxis.range[0]'].split(" ")[0];
             var end_t = eventData['xaxis.range[1]'].split(" ")[0];

             var begin_v = eventData['yaxis.range[0]'];
             var end_v = eventData['yaxis.range[1]'];
             layout = {
             xaxis: {
             range: [begin_t, end_t],
             fixedrange: true
             //type: 'date'
             },
             yaxis: {
             range: [begin_v, end_v],
             fixedrange: true
             }
             };
             applyFilter(layout);
             });*/
        }
    });
};

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
};


// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
}