<template>
<div class="timeline">
    <div style="margin: 15px 0;"></div>
    <el-checkbox-group v-model="checkboxGroup1">
        <el-checkbox-button v-for="city in cities" :label="city" :key="city">{{city}}</el-checkbox-button>
    </el-checkbox-group>
</div>
</template>

<script>
import vis from "vis";
const cityOptions = ["Shanghai", "Beijing", "Guangzhou", "Shenzhen"];

const convertData = function(rawObject) {
  return Object.keys(rawObject).map(key => rawObject[key]);
};

export default {
  props: {
    rawData: Object
  },

  data() {
    return {
      checkboxGroup1: ["Shanghai"],
      checkboxGroup2: ["Beijing"],
      checkboxGroup3: ["Guangzhou"],
      cities: cityOptions,

      // Timeline data
      items: new vis.DataSet(),
      groups: new vis.DataSet(),
      options: {
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
      }
    };
  },

  mounted() {
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
            const groupId = testSessionId.substring(-4);
            const raw = trackingsForDate[testSessionId];
            this.groups.add({
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
            //this.items.add(sequenceItems);

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
              this.items.add(item);
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
            //this.items.add(timelineItems);

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
            //this.items.add(eventItems);

            // Process Errors
            const errorData = convertData(raw.errors);
            const errorItems = errorData.map(element => ({
              content: "Error",
              start: element.time,
              style: "color: red;",
              title: element.name,
              type: "point"
            }));
            //this.items.add(errorItems)
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

.timeline .vis-panel {
  border: 0px;
}

.timeline .vis-timeline {
  border-color: transparent;
}

.timeline .vis-group {
  background-color: #fafafa;
}

.timeline .chunk {
  height: 55px;
  border: 0px;
  border-radius: 2px;
}
</style>
