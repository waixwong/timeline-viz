<template>
<div class="timeline">
    <!-- <el-checkbox-group v-model="checkboxGroup1">
        <el-checkbox-button v-for="toggle in toggles" :label="toggle" :key="toggle">{{toggle}}</el-checkbox-button>
    </el-checkbox-group> -->
</div>
</template>

<script>
import vis from "vis";
import DistinctColors from "distinct-colors";

const convertData = function(rawObject) {
  return Object.keys(rawObject).map(key => rawObject[key]);
};

// Generate
// http://tools.medialab.sciences-po.fr/iwanthue/
const sequencePalette = new DistinctColors({
  count: 8,
  hueMin: 208,
  hueMax: 310,
  chromaMin: 8,
  chromaMax: 80,
  lightMin: 20,
  lightMax: 68,
  quality: 50
});

var chunkNames = [];
const chunkPalette = new DistinctColors({
  count: 15,
  hueMin: 4,
  hueMax: 350,
  chromaMin: 10,
  chromaMax: 100,
  lightMin: 50,
  lightMax: 100,
  quality: 50
});

var eventNames = [];
const eventPalette = new DistinctColors({
  count: 15,
  hueMin: 0,
  hueMax: 360,
  chromaMin: 48,
  chromaMax: 100,
  lightMin: 40,
  lightMax: 60,
  quality: 50
});

export default {
  props: {
    rawData: Object,
    showCompleteResultsOnly: Boolean
  },

  data() {
    return {
      checkboxGroup1: ["Shanghai"],
      toggles: [
        "Show Sequences",
        "Show Chunks",
        "Show Events",
        "Show Timelines",
        "Show Errors"
      ],
      timeline: null,

      incompleteGroups: [],

      // Timeline data
      items: new vis.DataSet(),
      groups: new vis.DataSet(),
      options: {
        min: 0,
        max: 1100,
        showCurrentTime: true,
        stack: false,
        stackSubgroups: true,
        horizontalScroll: true,
        margin: {
          item: 1, // minimal margin between items
          axis: 10 // minimal margin between items and the axis
        },
        orientation: "top",
        showMajorLabels: false
      }
    };
  },

  mounted() {
    // Create timeline
    this.timeline = new vis.Timeline(
      this.$el,
      this.items,
      this.groups,
      this.options
    );
  },

  methods: {},

  watch: {
    rawData: {
      immediate: true,
      handler: function(newData) {
        this.groups.clear();
        this.items.clear();
        this.incompleteGroups = [];

        for (const date in newData) {
          const trackingsForDate = newData[date];

          for (const testSessionId in trackingsForDate) {
            const groupId = date + "-" + testSessionId.slice(-3);
            const rawTrackingData = trackingsForDate[testSessionId];

            // Process Sequences
            const dataIsComplete =
              Object.keys(rawTrackingData.sequences).length >= 5;

            const newGroup = {
              id: groupId,
              className: dataIsComplete
                ? "timeline-group"
                : "timeline-group incomplete",
              visible: this.showCompleteResultsOnly ? dataIsComplete : true,
              subgroupOrder: function(a, b) {
                return a.subgroupOrder - b.subgroupOrder;
              },
              subgroupStack: {
                chunks: false,
                timelines: false,
                events: false,
                errors: false
              }
            };

            // Create a new group for each test session
            this.groups.add(newGroup);
            if (!dataIsComplete) this.incompleteGroups.push(newGroup);

            for (const sequenceKey in rawTrackingData.sequences) {
              const sequence = rawTrackingData.sequences[sequenceKey];
              const startTime = sequence.start;
              const endTime = sequence.end;
              var duration = 0;
              if (endTime) {
                duration = endTime - startTime;
              }

              const sequenceItem = {
                className: "sequence",
                //content: "@ " + (sequence.index + 1),
                title: "duration: " + duration,
                start: startTime,
                style:
                  "background-color: " +
                  sequencePalette[sequence.index].alpha(0.25).css(),
                end: endTime ? endTime : startTime + 150,
                type: "background",
                group: groupId
              };
              this.items.add(sequenceItem);
            }

            // Process Chunks
            for (const chunkKey in rawTrackingData.chunks) {
              const element = rawTrackingData.chunks[chunkKey];
              // todo: fix optional element
              if (element.optional) continue;
              if (!element.hasOwnProperty("start")) continue;

              // figure out color
              const chunkName = element.name;
              if (chunkNames.indexOf(chunkName) < 0) {
                chunkNames.push(chunkName);
              }

              const colorIndex =
                chunkNames.indexOf(chunkName) % chunkPalette.length;
              const color = chunkPalette[colorIndex];

              const item = {
                className: "chunk",
                content: chunkName,
                start: element.start,
                end: element.end,
                style: "background-color: " + color.alpha(0.55).css(),
                type: element.end ? "range" : "box",
                group: groupId
                //subgroup: "chunks",
              };

              this.items.add(item);
            }

            // Process Events
            for (const eventKey in rawTrackingData.events) {
              const element = rawTrackingData.events[eventKey];
              // figure out color
              const eventName = element.name;
              if (eventNames.indexOf(eventName) < 0) {
                eventNames.push(eventName);
              }
              const colorIndex =
                eventNames.indexOf(eventName) % eventPalette.length;
              const color = eventPalette[colorIndex];

              const item = {
                className: "event",
                title: element.name,
                start: element.time,
                type: "point",
                style: "border-color: " + color.alpha(0.75).css(),
                group: groupId,
                subgroup: "events",
                subgroupOrder: 2
              };

              this.items.add(item);
            }

            // // Process Timelines
            // const timelines = convertData(rawTrackingData.timelines);
            // const timelineItems = timelines.map(element => ({
            //   content: element.name,
            //   start: element.start,
            //   end: element.end,
            //   group: groupId,
            //   subgroup: "timelines",
            //   subgroupOrder: 0
            // }));
            // this.items.add(timelineItems);

            // Process Errors
            const errorData = convertData(rawTrackingData.errors);
            const errorItems = errorData.map(element => ({
              className: "error",
              start: element.time,
              style: "border-color: #dd5757;",
              title: element.name,
              type: "point",
              group: groupId,
              subgroup: "errors",
              subgroupOrder: 1
            }));
            this.items.add(errorItems);
          }
        }
      }
    },

    showCompleteResultsOnly: function() {
      this.incompleteGroups.forEach(element => {
        this.groups.update({
          id: element.id,
          visible: !this.showCompleteResultsOnly
        });
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../../node_modules/vis/dist/vis.min.css";
/* This is the entire panel */

.timeline * {
  color: #777;
}

/* margin of the whole timeline panel */

.timeline .vis-timeline {
  margin: 20px;
  margin-bottom: 50px;
  border: 0;
}

/* hide border */

.timeline .vis-panel,
.timeline .vis-label,
.timeline .vis-group {
  border: 0;
}

.timeline .vis-item {
  font-size: 10pt;
}

/* this is the group content */

.timeline .timeline-group {
  margin-top: 10px;
  background-color: #f0f0f048;
  border-radius: 9pt;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  min-height: 50px;
}

/* this is the group header */

.timeline .vis-label.timeline-group {
  padding: 5px;
  /* background-color: #bebebe52; */
  border-top-left-radius: 9pt;
  border-bottom-left-radius: 10pt;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: none;
}

/* header text */

.timeline .vis-label.timeline-group * {
  color: #787878;
}

/* time axis text */

.timeline .vis-time-axis * {
  color: #409eff;
}

.timeline .sequence {
  min-height: 50px;
}

.timeline .chunk {
  min-height: 36px;
  border-color: transparent;
  border-radius: 3px;
  justify-content: center;
  margin-top: 6px;
  display: flex;
  align-items: flex-end;
  align-self: center;
}

.timeline .chunk:hover {
  border-color: #ffd00066;
}

.timeline .event,
.timeline .error {
  margin-top: 1px;
  border-radius: 3px;
  border-width: 3px;
  border-color: inherit;
}

.timeline .vis-tooltip {
  background-color: rgba(127, 225, 255, 0.527);
  border-radius: 6px;
  border-color: transparent;
}
</style>
