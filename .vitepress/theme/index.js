import DefaultTheme from 'vitepress/theme'
import CronTester from './components/CronTester.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CronTester', CronTester)
  }
}
