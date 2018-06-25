var ma_band = [];
var lo_band = [];
var hi_band = [];
var outliers = [];
var data;
var layout;
var firstPlots = true;
var firstDsOutliers = [];

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
    // update the second plot at zoom/selection in the first plot
    console.log("applyCssToSvg");

    // update second plot based on first one
    graphDiv = document.getElementById("myDiv1");

    // update selection
    var frames = window.parent.frames;
    for (var i = 0; i < frames.length; i++) {
        if(frames[i].document.getElementById("myDiv2")){
            console.log(frames[i].document.getElementById("myDiv2"));
            Plotly.update(frames[i].document.getElementById("myDiv2"), data, interval)
        }
    }

    // update pixel based visualization
    var dates = [];
    var indicators = [];
    console.log(firstDsOutliers)
    firstDsOutliers.forEach(function (e) {
        dates.push(e.date);
        indicators.push(e.indicator)
    });
    var d = [
        {
            z: [indicators],
            x: dates,
            y: [" "],
            type: 'heatmap'
        }
    ];
    window.parent.document.body.appendChild(elem);*/
    var heatmap_interval = {
        xaxis: interval.xaxis,
        yaxis: {
            fixedrange: true
    }};
    Plotly.update(window.parent.document.getElementById("myDiv3"), d, heatmap_interval);
};

// method for drawing the visualization
// the visualization is hosted in an iframe, thus the visualization should be written directly to the body
// @param datarows - an array with rows which should be displayed
// @param channelMappings - holds what column should be mapped to what channel, what the data type of
//                          column is, etc.
// @param visIndex - the index or ID of the visualization. Only needed for brushing
drawVisualization = function (datarows, channelMappings, visIndex) {
    brushingObserver.registerListener(visIndex, brushUpdateCallback);

    // get values of the slider for the size of the sliding window and the threshold
    var window_slider = window.parent.document.getElementById("slidingwindow_rng");
    var threshold_slider = window.parent.document.getElementById("threshold_rng");

    // select exchange rates to be compared
    var first_selection = window.parent.document.getElementById("selection1");
    var first_ds = first_selection.options[first_selection.selectedIndex].value;
    var first_title = String(first_ds).replace("_", "-").toUpperCase();
    var second_selection = window.parent.document.getElementById("selection2");
    var second_ds = second_selection.options[second_selection.selectedIndex].value;
    var second_title = String(second_ds).replace("_", "-").toUpperCase();

    if(visIndex == 1) {
        // create first visualization
        Plotly.d3.csv("./visualization/" + first_ds + ".csv", function (err, rows) {
            function unpack(rows, key) {
                return rows.map(function (row) {
                    return row[key];
                });
            }

            xIndex = channelMappings.findIndex(elem => (elem.channel === "x-axis"));
            yIndex = channelMappings.findIndex(elem => (elem.channel === "y-axis"));

            var y = datarows.map(function(d) { return d[yIndex]; });

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            };

            // calculate the bollinger band
            firstDsOutliers = getBollingerBands(window_slider.value, threshold_slider.value, rows);

            // define lines for the plot
            var trace1 = {
                type: "scatter",
                mode: "lines",
                name: 'exchange rate',
                x: unpack(rows, 'date'),
                y: unpack(rows, 'close'),
                line: {color: 'red'}
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
                line: {color: 'orange'}
            };

            var trace4 = {
                type: "scatter",
                mode: "lines",
                name: 'high',
                x: unpack(hi_band, 'date'),
                y: unpack(hi_band, 'close'),
                line: {color: 'orange'},
                fill:'tonexty'
            };

            // only use timeseries, upper-/lower border. No mean
            data = [trace3, trace4, trace1];
            if (firstPlots) {
                // create new plots in the beginning
                // create pixel based vis.
                var dates = [];
                var indicators = [];
                firstDsOutliers.forEach(function (e) {
                    dates.push(e.date);
                    indicators.push(e.indicator)
                });
                var heatmap_data = [
                    {
                        z: [indicators],
                        x: dates,
                        y: [" "],
                        type: 'heatmap'
                    }
                ];
                var heatmap_layout = {
                    xaxis: { fixedrange: true },
                    yaxis: { fixedrange: true }
                };

                var elem = window.parent.document.createElement('myDiv3');
                elem.setAttribute("id", "myDiv3");
                window.parent.document.body.appendChild(elem);
                Plotly.newPlot(window.parent.document.getElementById("myDiv3"), heatmap_data, heatmap_layout);

                firstPlots = false;
                if (visIndex == 1) {
                    var elem1 = document.createElement('myDiv1');
                    elem1.setAttribute("id", "myDiv1");
                    document.body.appendChild(elem1);
                    var simple_layout = {
                        title: first_title + " exchange rate",
                    };
                    Plotly.newPlot('myDiv1', data, simple_layout, {displayModeBar: false});
                }
                else {
                    // disable operations in the second iframe
                    var elem2 = document.createElement('myDiv2');
                    elem2.setAttribute("id", "myDiv2");
                    document.body.appendChild(elem2);
                    var fixed_layout = {
                        title: 'Euro-dollar exchange rate',
                        xaxis: {
                            fixedrange: true,
                        },
                        yaxis: {
                            fixedrange: true
                        }
                    };
                    Plotly.newPlot('myDiv2', data, fixed_layout, {displayModeBar: false});
                }

            }
            else {
                // update plots
                if (visIndex == 1) {
                    Plotly.update('myDiv1', data, layout);
                }
                else {
                    Plotly.update('myDiv2', data, layout)
                }
            }

            graphDiv = document.getElementById("myDiv1");
            if (graphDiv) {
                graphDiv.on('plotly_relayout', function (eventData) {
                    // handle events on the first plot
                    // zoom out
                    if (eventData["xaxis.autorange"]) {
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
                    // select and zoom
                    else {
                        var begin_t;
                        var begin_v;
                        var end_t;
                        var end_v;
                        if (eventData['xaxis.range[0]'] && eventData['yaxis.range[0]']) {
                            console.log("select");
                            begin_t = eventData['xaxis.range[0]'].split(" ")[0];
                            end_t = eventData['xaxis.range[1]'].split(" ")[0];

                            begin_v = eventData['yaxis.range[0]'];
                            end_v = eventData['yaxis.range[1]'];
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
                        else {
                            // select x-interval
                            if (eventData['xaxis.range[0]'] && !eventData['yaxis.range[0]']) {
                                console.log("only x");
                                begin_t = eventData['xaxis.range[0]'].split(" ")[0];
                                end_t = eventData['xaxis.range[1]'].split(" ")[0];

                                layout = {
                                    xaxis: {
                                        range: [begin_t, end_t],
                                        fixedrange: true
                                    }
                                };
                                applyFilter(layout);
                            }
                            // select y-interval
                            if (!eventData['xaxis.range[0]'] && eventData['yaxis.range[0]']) {
                                console.log("only y");
                                begin_v = eventData['yaxis.range[0]'];
                                end_v = eventData['yaxis.range[1]'];
                                layout = {
                                    yaxis: {
                                        range: [begin_v, end_v],
                                        fixedrange: true
                                    }
                                };
                                applyFilter(layout);
                            }
                        }

                    }
                });

            }
        });
    }
    else{
        // create second visualization
        Plotly.d3.csv("./visualization/" + second_ds + ".csv", function (err, rows) {
            function unpack(rows, key) {
                return rows.map(function (row) {
                    return row[key];
                });
            }

            xIndex = channelMappings.findIndex(elem => (elem.channel === "x-axis"));
            yIndex = channelMappings.findIndex(elem => (elem.channel === "y-axis"));

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            };

            // get bollinger band
            getBollingerBands(window_slider.value, threshold_slider.value, rows);

            var trace1 = {
                type: "scatter",
                mode: "lines",
                name: 'exchange rate',
                x: unpack(rows, 'date'),
                y: unpack(rows, 'close'),
                line: {color: 'red'}
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
                line: {color: 'orange'}
            };

            var trace4 = {
                type: "scatter",
                mode: "lines",
                name: 'high',
                x: unpack(hi_band, 'date'),
                y: unpack(hi_band, 'close'),
                line: {color: 'orange'},
                fill:'tonexty'
            };

            // only timeseries, lower-/upper border. no mean
            data = [trace3, trace4, trace1];
            if (firstPlots) {
                firstPlots = false;
                var elem2 = document.createElement('myDiv2');
                elem2.setAttribute("id", "myDiv2");
                document.body.appendChild(elem2);
                var fixed_layout = {
                    title: second_title + " exchange rate",
                    xaxis: {
                        fixedrange: true
                    },
                    yaxis: {
                        fixedrange: true
                    }
                };
                Plotly.newPlot('myDiv2', data, fixed_layout);
            }
            else {
                Plotly.update('myDiv2', data, layout)
            }
        });
    }
};

getBollingerBands = function(n, k, data) {
    ma_band = [];
    lo_band = [];
    hi_band = [];
    // calculate mean and lower-/upper border
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

    // identify regions outside of bollinger band
    outliers = [];
    new_data = data.slice(n - 1, data.length);
    console.log(ma_band);
    console.log(new_data);
    for(var i = 0; i < new_data.length; i++) {
        if(Number(new_data[i].close) < Number(lo_band[i].close)){
            outliers.push({
                date: new_data[i].date,
                indicator: 1
            })
        }
        if(Number(new_data[i].close) > Number(hi_band[i].close)){
            outliers.push({
                date: new_data[i].date,
                indicator: 1
            })
        }
        else{
            outliers.push({
                date: new_data[i].date,
                indicator: 0
            })
        }
    }
    return outliers;
};


// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
}

function unpackk(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

$(document).ready(function() {
    console.log("READY");
    var fileInput = document.getElementById("fileSelect"),

    readFile = function () {
        /*var elemm = $("#visualization-iframe html body mydiv1:first-child")[0];
        if (elemm) {
            console.log("DELETING");
            Plotly.deleteTraces(elemm, 0);
        }*/
        var reader = new FileReader();
        reader.onload = function () {
            let date = [];
            let close = [];
            let dataa = $.csv.toArrays(reader.result);
            for (let i = 1; i < dataa.length; i++) {
                date.push(dataa[i][0]);
                close.push(dataa[i][1]);
            }
            var trace1 = {
                type: "scatter",
                mode: "lines",
                name: 'exchange rate',
                x: date,
                y: close,
                line: {color: 'blue'}
            };

            let data = [trace1];
            var elem1 = document.createElement('myDiv1');
            elem1.setAttribute("id", "myDiv1");
            var body = $("#visualization-iframe").contents().find("body");
            body.append(elem1);
            Plotly.newPlot(elem1, data);
            var inputField = document.getElementById("fileSelect");
            inputField.value = "";
        };
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsBinaryString(fileInput.files[0]);
    };

    fileInput.addEventListener('change', readFile);
});