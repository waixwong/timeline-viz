<template>
<div>
</div>
</template>

<script>

import vis from 'vis'

export default {
    props: ["items", "groups", "options"],
    mounted: function () {
        var items = new vis.DataSet(this.items);
        var options = this.options;
        var groups = this.groups;
        var timeline = new vis.Timeline(this.$el, items, groups, options);
    }
}
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
