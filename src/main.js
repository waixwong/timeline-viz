import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vuefire from 'vuefire'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuefire)

new Vue({
    render: h => h(App),
    el: '#app',
})
