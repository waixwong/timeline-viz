<template>
<div>
</div>
</template>

<script>
import vis from "vis";
import {
    rawdata
} from "../rawdata";

const raw =
    rawdata["play-tracking"]["build-a5501213ffa929746b625d0ca300490e"][
        "9-2-2018"
    ]["ae17786a-e985-4832-813a-5b4911dc41c2"];

const convertData = function (rawObject) {
    return Object.keys(rawObject).map(key => rawObject[key]);
};

const createTimeline = function () {
    var items = [];
    // Process Sequences
    const sequences = convertData(raw.sequences);
    const sequenceItems = sequences.map(element => ({
        content: "Sequence " + (element.index + 1),
        start: element.start,
        // style: 'background-color: ' + '#'+((1<<24)*Math.random()|0).toString(16) + ';',
        end: element.end ? element.end : element.start + 150,
        type: "background"
    }));
    items = items.concat(sequenceItems);

    // Process Chunks
    const chunks = convertData(raw.chunks);
    const chunkItems = chunks.map(element => ({
        content: element.name,
        start: element.start,
        end: element.end,
        style: "background-color: " +
            "#" +
            (((1 << 24) * Math.random()) | 0).toString(16) +
            ";",
        type: element.end ? "range" : "point"
    }));
    items = items.concat(chunkItems);

    // Process Timelines
    const timelines = convertData(raw.timelines);
    const timelineItems = timelines.map(element => ({
        content: element.name,
        start: element.start,
        end: element.end
    }));
    items = items.concat(timelineItems);

    // Process Events
    const events = convertData(raw.events);
    const eventItems = events.map(element => ({
        content: element.name,
        start: element.time,
        type: "point"
    }));
    items = items.concat(eventItems);

    // Process Errors
    const errorData = convertData(raw.errors);
    const errorItems = errorData.map(element => ({
        start: element.time,
        content: "Error",
        style: "color: red;",
        title: element.name,
        type: "point"
    }));
    //timelineItems = timelineItems.concat(errorItems)

    var items = new vis.DataSet(items);

    var options = {
        horizontalScroll: true,
        min: 0,
        max: 680,
        editable: false,
        margin: {
            item: 10, // minimal margin between items
            axis: 5 // minimal margin between items and the axis
        },
        orientation: "top"
    };

    var groups = this.groups;
    var timeline = new vis.Timeline(this.$el, items, groups, options);
};

export default {
    mounted: createTimeline
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

a {
    color: #42b983;
}
</style>
