import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css'
import Vuefire from 'vuefire'

locale.use(lang)

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuefire)

// Initialize Firebase

new Vue({
    render: h => h(App),
    el: '#app'
})