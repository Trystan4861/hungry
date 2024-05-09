"use strict";

var _vue = require("vue");

var _App = _interopRequireDefault(require("./App.vue"));

var _store = _interopRequireDefault(require("./store"));

var _vue3TouchEvents = _interopRequireDefault(require("vue3-touch-events"));

var _utilidades = require("./utilidades");

require("./assets/css/bootstrap.min.css");

require("./assets/css/Style.scss");

require("./registerServiceWorker");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _vue.createApp)(_App["default"]);
app.use(_store["default"]);
app.use(_vue3TouchEvents["default"]);
app.config.productionTip = false;
app.mount('#app');
window.DID = _utilidades.DID;
window.DOM = _utilidades.DOM;
window._DOM = _utilidades._DOM;