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
  count: 6,
  hueMin: 33,
  hueMax: 312,
  chromaMin: 8,
  chromaMax: 80,
  lightMin: 29,
  lightMax: 68,
  quality: 50
});

let chunkNames = [];
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

let eventNames = [];
const eventPalette = new DistinctColors({
  count: 15,
  hueMin: 62,
  hueMax: 360,
  chromaMin: 28,
  chromaMax: 100,
  lightMin: 35,
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
        min: -15,
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
        // clear existing data
        this.groups.clear();
        this.items.clear();
        this.incompleteGroups = [];

        for (const date in newData) {
          const trackingsForDate = newData[date];

          for (const testSessionId in trackingsForDate) {
            let trackedItems = [];

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

            let sessionStartTime;
            // Process sequences
            for (const sequenceKey in rawTrackingData.sequences) {
              const sequence = rawTrackingData.sequences[sequenceKey];

              const startTime = sequence.start;
              const endTime = sequence.end;

              if (sequence.index == 0) {
                sessionStartTime = startTime;
              }

              const sequenceItem = {
                className: "sequence",
                //content: "@ " + (sequence.index + 1),
                start: startTime,
                style:
                  "background-color: " +
                  sequencePalette[sequence.index].alpha(0.25).css(),
                end: isNaN(endTime) ? 800.0 + sessionStartTime : endTime,
                type: "background",
                group: groupId
              };
              trackedItems.push(sequenceItem);
            }

            // Process Chunks
            // todo: fix optional element
            // in this version. optional and repeatable chunks' endtimes are not logged correctly.
            // this attempts to fix the issue by using next chunk's start time as the missing end time.
            const chunkStartFrames = Object.values(rawTrackingData.chunks).map(
              element => element.start
            );
            const uniqueChunkStartFrames = Array.from(
              new Set(chunkStartFrames.sort())
            );

            for (const chunkKey in rawTrackingData.chunks) {
              const element = rawTrackingData.chunks[chunkKey];
              if (!element.hasOwnProperty("start")) continue;

              // get chunk start and end time
              const chunkStartTime = element.start;
              const chunkEndTime = element.end;

              if (isNaN(chunkEndTime)) {
                const index = uniqueChunkStartFrames.indexOf(chunkStartTime);
                if (index < uniqueChunkStartFrames.length - 1) {
                  chunkEndTime = uniqueChunkStartFrames[index + 1];
                }
              }
              /*
              if (dataIsComplete && !chunkEndTime) {
                console.log(testSessionId)
                console.log(chunkName)
                console.log(chunkKey)
                console.log(uniqueChunkStartFrames)
              }
              */
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
                title: chunkName,
                content: chunkName,
                start: chunkStartTime,
                end: chunkEndTime,
                style: "background-color: " + color.alpha(0.55).css(),
                type: isNaN(chunkEndTime) ? "point" : "range",
                group: groupId,
                subgroup: "chunks",
                subgroupOrder: 0
              };

              trackedItems.push(item);
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
                subgroupOrder: 1
              };

              trackedItems.push(item);
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
            // trackedItems.push(timelineItems);

            // Process Errors
            for (const errorKey in rawTrackingData.errors) {
              const element = rawTrackingData.errors[errorKey];
              const errorItem = {
                className: "error",
                start: element.time,
                style: "border-color: #dd5757;",
                title: element.name,
                type: "point",
                group: groupId,
                subgroup: "errors",
                subgroupOrder: 2
              };
              trackedItems.push(errorItem);
            }

            trackedItems.forEach(item => {
              if (item.start) item.start = item.start - sessionStartTime;
              if (item.end) item.end = item.end - sessionStartTime;
            });

            // add tracked items to the timeline
            this.items.add(trackedItems);
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
  margin-top: 30px;
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
  min-height: 56px;
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
  display: flex;
  align-items: center;
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
  min-height: 56px;
}

.timeline .chunk {
  border-color: transparent;
  border-radius: 3px;
  margin-top: 5px;
  min-height: 30px;
}

.timeline .chunk:hover {
  border-color: #ffd00066;
}

.timeline .event,
.timeline .error {
  margin-top: 1px;
  border-radius: 3px;
  border-width: 3px;
  margin-top: 3px;
  border-color: inherit;
}

.timeline .error {
  margin-top: 1px;
  border-radius: 3px;
  border-width: 3px;
  border-color: #dd5757;
}

.timeline .vis-tooltip {
  background-color: rgba(127, 225, 255, 0.527);
  border-radius: 6px;
  border-color: transparent;
}
</style>
