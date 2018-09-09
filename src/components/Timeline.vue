<template>
<div class="timeline">
</div>
</template>

<script>
import vis from "vis";
import { rawdata } from "../rawdata";

const raw =
  rawdata["play-tracking"]["build-a5501213ffa929746b625d0ca300490e"][
    "9-2-2018"
  ]["ae17786a-e985-4832-813a-5b4911dc41c2"];

const convertData = function(rawObject) {
  return Object.keys(rawObject).map(key => rawObject[key]);
};

const createTimeline = function() {
  var items = new vis.DataSet();
  var groups = new vis.DataSet();

  const groupId = "bar";
  groups.add({
    id: groupId,
    subgroupOrder: function(a, b) {
      return a.subgroupOrder - b.subgroupOrder;
    },
    subgroupStack: {
      chunks: false,
      timelines: false,
      events: true
    }
  });

  // Process Sequences
  const sequences = convertData(raw.sequences);
  const sequenceItems = sequences.map(element => ({
    classNames: "sequence",
    content: "Sequence " + (element.index + 1),
    start: element.start,
    style:
      "background-color: " +
      "#" +
      (((1 << 24) * Math.random()) | 0).toString(16) +
      "55;",
    end: element.end ? element.end : element.start + 150,
    type: "background"
  }));
  //items.add(sequenceItems);

  // Process Chunks
  const chunks = convertData(raw.chunks);
  chunks.forEach(element => {
    if (element.optional) return;
    const item = {
      className: "chunk",
      content: element.name,
      start: element.start,
      end: element.end,
      style:
        "background-color: " +
        "#" +
        (((1 << 24) * Math.random()) | 0).toString(16) +
        "88;",
      type: element.end ? "range" : "point",
      group: groupId,
      subgroup: "chunks",
      subgroupOrder: 1
    };
    items.add(item);
  });

  // Process Timelines
  const timelines = convertData(raw.timelines);
  const timelineItems = timelines.map(element => ({
    content: element.name,
    start: element.start,
    end: element.end,
    group: groupId,
    subgroup: "timelines",
    subgroupOrder: 0
  }));
  //items.add(timelineItems);

  // Process Events
  const events = convertData(raw.events);
  const eventItems = events.map(element => ({
    content: element.name,
    start: element.time,
    type: "point",
    group: groupId,
    subgroup: "events",
    subgroupOrder: 0
  }));
  //items.add(eventItems);

  // Process Errors
  const errorData = convertData(raw.errors);
  const errorItems = errorData.map(element => ({
    content: "Error",
    start: element.time,
    style: "color: red;",
    title: element.name,
    type: "point"
  }));
  //items.add(errorItems)

  const options = {
    horizontalScroll: true,
    min: 0,
    max: 680,
    editable: false,
    stack: true,
    stackSubgroups: true,
    margin: {
      item: 6, // minimal margin between items
      axis: 10 // minimal margin between items and the axis
    },
    orientation: "top"
  };

  var timeline = new vis.Timeline(this.$el, items, groups, options);
};

export default {
  mounted: createTimeline
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../../node_modules/vis/dist/vis.min.css";

/* This is the entire panel */
.timeline * {
  color: #444;
  font-size: 10pt;
}

.timeline .vis-timeline {
  border-color: transparent;

}

.timeline .vis-group {
  background-color: gainsboro;
}

.timeline .chunk {
  height: 55px;
  border: 0px;
  border-radius: 2px;
}
</style>
