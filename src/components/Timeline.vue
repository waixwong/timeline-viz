<template>
<div class="timeline">
    <div style="margin: 15px 0;"></div>
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
  hueMin: 0,
  hueMax: 258,
  chromaMin: 8.7,
  chromaMax: 40.5,
  lightMin: 7,
  lightMax: 40,
  quality: 50
});

export default {
  props: {
    rawData: Object
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
    var timeline = new vis.Timeline(
      this.$el,
      this.items,
      this.groups,
      this.options
    );
  },

  watch: {
    rawData: {
      immediate: true,
      handler: function(newData) {
        this.groups.clear();
        this.items.clear();

        for (const date in newData) {
          const trackingsForDate = newData[date];
          for (const testSessionId in trackingsForDate) {
            const groupId = date + "-" + testSessionId.slice(-3);
            const rawTrackingData = trackingsForDate[testSessionId];

            this.groups.add({
              className: 'timeline-group',
              id: groupId,
              subgroupOrder: function(a, b) {
                return a.subgroupOrder - b.subgroupOrder;
              },
              subgroupStack: {
                chunks: false,
                timelines: false,
                events: false,
                errors: false
              }
            });

            // Process Sequences
            const sequences = convertData(rawTrackingData.sequences);
            const sequenceItems = sequences.map(element => ({
              className: "sequence",
              content: "@ " + (element.index + 1),
              start: element.start,
              style:
                "background-color: " +
                sequencePalette[element.index].alpha(0.3).css(),
              end: element.end ? element.end : element.start + 150,
              type: "background",
              group: groupId
            }));

            this.items.add(sequenceItems);

            // Process Chunks
            const chunks = convertData(rawTrackingData.chunks);
            chunks.forEach(element => {
              // todo: fix optional element
              if (element.optional) return;
              if (!element.hasOwnProperty("start")) return;
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
                type: element.end ? "range" : "box",
                group: groupId,
                //subgroup: "chunks",
              };
              this.items.add(item);
            });

            // Process Events
            const events = convertData(rawTrackingData.events);
            const eventItems = events.map(element => ({
              className: "event",
              title: element.name,
              start: element.time,
              type: "point",
              group: groupId,
              subgroup: "events",
            }));
            this.items.add(eventItems);

            /*
                                    // Process Timelines
                                    const timelines = convertData(rawTrackingData.timelines);
                                    const timelineItems = timelines.map(element => ({
                                      content: element.name,
                                      start: element.start,
                                      end: element.end,
                                      group: groupId,
                                      subgroup: "timelines",
                                      subgroupOrder: 0
                                    }));
                                    //this.items.add(timelineItems);
                                    */

            // Process Errors
            const errorData = convertData(rawTrackingData.errors);
            const errorItems = errorData.map(element => ({
              className: "error",
              start: element.time,
              style: "color: red;",
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
.timeline .vis-label.timeline-group *{
    color: #787878;
}

/* time axis text */
.timeline .vis-time-axis *{
  color: #409EFF;
}

.timeline .sequence {
  min-height: 50px;
}

.timeline .sequence * {
  color: #ddd;
}

.timeline .chunk {
  min-height: 36px;
  border-color: transparent;
  border-radius: 3px;
}

.timeline .chunk:hover {
  border-color: #ffd00066;
}

.timeline .event {
  border-radius: 3px;
  border-width: 3px;
  border-color: #777;
}

.timeline .error {
  border-color: #dd5757;
}

.timeline .vis-tooltip {
  background-color: rgba(127, 225, 255, 0.527);
  border-radius: 6px;
  border-color: transparent;
}
</style>
