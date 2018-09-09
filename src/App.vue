<template>
<div id="app">
    <h1>Choose Build</h1>
    <el-select v-model="buildVersion" placeholder="Select a build version">
        <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
    </el-select>
    <!-- <el-select v-model="value11" multiple collapse-tags style="margin-left: 20px;" placeholder="Select">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
    </el-select> -->
    <timeline></timeline>

</div>
</template>

<script>
import Timeline from "./components/Timeline.vue";
import {
    db
} from "./firebase";

export default {
    name: "app",
    components: {
        Timeline
    },

    data() {
        return {
            options2: [],
            props: {
                label: "label",
                value: "key"
            },

            options: [{
                value: 'Option1',
                label: 'Option1'
            }, {
                value: 'Option2',
                label: 'Option2'
            }, {
                value: 'Option3',
                label: 'Option3'
            }, {
                value: 'Option4',
                label: 'Option4'
            }, {
                value: 'Option5',
                label: 'Option5'
            }],

            buildVersion: ''
        };
    },

    created() {
        var component = this
        db.ref("play-tracking").once("value", function (snap) {
            const trackingData = snap.val();
            for (const buildData in trackingData) {
                const option = {
                    label: buildData,
                    cities: []
                }
                component.options2.push(option)
            }
        });
    },

    methods: {
        handleItemChange(val) {
            console.log("active item:", val);
            setTimeout(_ => {
                if (val.indexOf("California") > -1 && !this.options2[0].cities.length) {
                    this.options2[0].cities = [{
                        label: "Los Angeles"
                    }];
                } else if (
                    val.indexOf("Florida") > -1 &&
                    !this.options2[1].cities.length
                ) {
                    this.options2[1].cities = [{
                        label: "Orlando"
                    }];
                }
            }, 300);
        }
    }
};
</script>

<style>
#app {
    font-family: "Myriad Pro", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

body {
    background: #fefefe;
}
</style>
