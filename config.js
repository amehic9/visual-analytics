var visConfig = {
    // Add all of your libraries from the libs folder here. The visualizerChartApi entry should NOT be removed
    libs : ["visualizerChartApi.js", "d3.v3.min.js"],

    // Add all your css files from your css folder here
    css : [],

    // Add your mainfile here, which implements the visualization interface
    mainFile : "main.js",

    // Define what fields you want to map on which channels
    // The fieldname has to be exact the same as in the header array of the data
    // The channelname is defined by you and can be used to identify where a certain field should be mapped to
    fieldToChannelMap : [
        {
            "field" : "date",
            "channel" : "x-axis"
        },
        {
            "field" : "value",
            "channel" : "y-axis"
        }
    ]
};