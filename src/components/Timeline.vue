<template>
<div class="timeline">
    <div style="margin: 15px 0;"></div>
    <el-checkbox-group v-model="checkboxGroup1">
        <el-checkbox-button v-for="toggle in toggles" :label="toggle" :key="toggle">{{toggle}}</el-checkbox-button>
    </el-checkbox-group>
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
        editable: false,
        stack: false,
        stackSubgroups: true,
        showCurrentTime: true,
        margin: {
          item: 6, // minimal margin between items
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
            const groupId = date + "-" + testSessionId.slice(-4);
            const rawTrackingData = trackingsForDate[testSessionId];

            this.groups.add({
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
              classNames: "sequence",
              content: "@ " + (element.index + 1),
              start: element.start,
              style:
                "background-color: " +
                sequencePalette[element.index].alpha(0.4).css(),
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
                group: groupId
                //subgroup: "chunks",
                //subgroupOrder: 1
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
              subgroupOrder: 2
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
  color: #444;
  font-size: 10pt;
}

.timeline .vis-timeline {
  margin-top: 10px;
}

.timeline .vis-panel {
  border: 0;
}

.timeline .vis-label .vis-inner {
  min-height: 55px;
}

.timeline .vis-time-axis,
.timeline .vis-labelset {
  background-color: #f0f0f0;
}

.timeline .vis-timeline {
  border-color: transparent;
}

.timeline .vis-content .vis-group {
  border-bottom: 1px solid #eee;
}

.timeline .chunk {
  height: 50px;
  border-color: transparent;
  border-radius: 3px;
}

.timeline .chunk {
  height: 50px;
  border-width: 2px;
  border-color: transparent;
  border-radius: 2px;
}

.timeline .chunk:hover {
  border-color: #ffd00066;
}

.timeline .event {
  border-radius: 3px;
  border-width: 3px;
  border-color: #ffd00066;
}

.timeline .error {
  border-color: #dd5757;
}
</style>
