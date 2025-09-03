import RadioQuestion from './RadioQuestion/index.vue'
import CheckboxQuestion from './CheckboxQuestion/index.vue'
import FillQuestion from './FillQuestion/index.vue'
import EssayQuestion from './EssayQuestion/index.vue'

export default {
  install(app) {
    app.component('RadioQuestion', RadioQuestion)
    app.component('CheckboxQuestion', CheckboxQuestion)
    app.component('FillQuestion', FillQuestion)
    app.component('EssayQuestion', EssayQuestion)
  }
}
