import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element.js'

locale.use(lang)

Vue.config.productionTip = false
Vue.use(ElementUI, {
    locale
})

// Initialize Firebase

new Vue({
    render: h => h(App),
    el: '#app'
})

// Deploy Guide
// https://cli.vuejs.org/guide/deployment.html#amazon-s3