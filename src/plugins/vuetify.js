import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ca from 'vuetify/es5/locale/ca';
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
Vue.use(Vuetify);

export default new Vuetify({
    lang: {
      locales: { ca },
      current: 'ca',
    },
    icons: {
      iconfont: 'mdi', // default - only for display purposes
    },
});
