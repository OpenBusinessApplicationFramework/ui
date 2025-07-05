import "primeflex/primeflex.css";
import "primeicons/primeicons.css";

import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';  
import App from "./App.vue";

import { router } from "./router";

import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';

import Tooltip from 'primevue/tooltip';
import BadgeDirective from 'primevue/badgedirective';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import FocusTrap from 'primevue/focustrap';
import AnimateOnScroll from 'primevue/animateonscroll';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import DataView from 'primevue/dataview';
import Card from 'primevue/card';

import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const app = createApp(App);

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
        darkModeSelector: false,
    }
  }
});

app.use(ToastService);
app.use(DialogService);
app.use(router);

app.directive('tooltip', Tooltip);
app.directive('badge', BadgeDirective);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);
app.directive('focustrap', FocusTrap);
app.directive('animateonscroll', AnimateOnScroll);

app.component('DataView', DataView);
app.component('Card', Card);
app.component('Menubar', Menubar);
app.component('Button', Button);
app.component('InputText', InputText);
app.component('IconField', IconField);

app.component('DataTable', DataTable);

app.mount('#app');
