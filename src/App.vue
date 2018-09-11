<template>
<div id="app">
    <h1 class="title">Test Insight</h1>
    <el-select v-model="testDateOptions" placeholder="Select a build version" @change="selectedDateOptions=[]">
        <el-option v-for="buildVersionOption in buildVersionOptions" :key="buildVersionOption.label" :label="buildVersionOption.label" :value="buildVersionOption.value">
        </el-option>
    </el-select>
    <el-select v-model="selectedDateOptions" multiple collapse-tags style="margin-left: 20px;" placeholder="Select test date">
        <el-option v-for="testDateOption in sortedDateOptions" :key="testDateOption.label" :label="testDateOption.label" :value="testDateOption">
        </el-option>
    </el-select>
    <timeline v-if="selectedDateOptions" :rawData="selectedDataSets"></timeline>
</div>
</template>

<script>
import Timeline from "./components/Timeline.vue";
import { db } from "./firebase";

export default {
  name: "app",
  components: {
    Timeline
  },

  props: ["playTrackingRef"],

  data() {
    return {
      // first selector
      buildVersionOptions: [],
      // second selector
      testDateOptions: [],
      selectedDateOptions: []
    };
  },

  computed: {
    selectedDataSets: function() {
      const selectedDataSets = {};
      this.selectedDateOptions.forEach(dateOption => {
        selectedDataSets[dateOption.label] = dateOption.value;
      });

      return selectedDataSets;
    },

    sortedDateOptions() {
      if (this.testDateOptions.length == 0) return []
      return this.testDateOptions
        .slice()
        .sort((a, b) => new Date(a.label) - new Date(b.label));
    }
  },

  created() {
    const component = this;
    db.ref("play-tracking").once("value", function(snap) {
      const trackingData = snap.val();

      for (var buildVersion in trackingData) {
        const dateData = trackingData[buildVersion];
        var dateOptions = [];

        for (var date in dateData) {
          const dateOption = {
            label: date,
            value: dateData[date]
          };
          dateOptions.push(dateOption);
        }

        const option = {
          label: buildVersion,
          value: dateOptions
        };
        component.buildVersionOptions.push(option);
      }
    });
  },

  methods: {
    onTimelineReady: function() {
      console.log("Timeline ready.");
    }
  }
};
</script>

<style>
#app {
  font-family: "Myriad Pro", "Helvetica Neue", Helvetica, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.title {
  font-size: 30pt;
  text-align: left;
  margin-left: 20px;

  background: -webkit-linear-gradient(45deg, #21d4fd 0%, #b721ff 23%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

body {
  background: #fefefe;
}
</style>
