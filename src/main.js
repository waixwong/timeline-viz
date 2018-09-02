import 'vis/dist/vis.min.css'
import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import './firebase'
import Vuefire from 'vuefire'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuefire)

new Vue({
    render: h => h(App),
    el: '#app'
})