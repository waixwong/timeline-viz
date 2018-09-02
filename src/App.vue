<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png">
        <timeline :items="vueState.data1"></timeline>
        <timeline :items="vueState.data2"></timeline>
    </div>
</template>

<script>
    import Timeline from "./components/Timeline.vue";

    export default {
        name: "app",
        data: function() {
            return {
                vueState: {
                    data1: [{
                            id: 1,
                            content: 'item 1',
                            start: '2013-04-20'
                        },
                        {
                            id: 2,
                            content: 'item 2',
                            start: '2013-04-14'
                        },
                        {
                            id: 3,
                            content: 'item 3',
                            start: '2013-04-18'
                        },
                        {
                            id: 4,
                            content: 'item 4',
                            start: '2013-04-16',
                            end: '2013-04-19'
                        },
                        {
                            id: 5,
                            content: 'item 5',
                            start: '2013-04-25'
                        },
                        {
                            id: 6,
                            content: 'item 6',
                            start: '2013-04-27'
                        }
                    ],
                    data2: [{
                            id: 1,
                            content: 'item 11',
                            start: '2017-04-20'
                        },
                        {
                            id: 2,
                            content: 'item 12',
                            start: '2017-04-14'
                        },
                        {
                            id: 3,
                            content: 'item 13',
                            start: '2017-04-18'
                        },
                        {
                            id: 4,
                            content: 'item 14',
                            start: '2017-04-16',
                            end: '2017-04-19'
                        },
                        {
                            id: 5,
                            content: 'item 15',
                            start: '2017-04-25'
                        },
                        {
                            id: 6,
                            content: 'item 16',
                            start: '2017-04-27'
                        }
                    ]
                }
            }
        },
        components: {
            Timeline
        }
    };
</script>

<style>
    #app {
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
