/**
 *
 *
 */

Hull.component('admin/keen/root', {

  type: 'Hull',

  // require:["//dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js"],

  templates: ['app', 'quiz'],

  initialize: function(){
    "use strict";
    window.Keen.configure(Hull.config.services.settings.keenio);
  },

  beforeRender: function (data) {
    "use strict";
    if (this.options.quizId) {
      this.template = 'quiz';
      data.quizId = this.options.quizId;
    } else {
      this.template = 'app';
    }
  },

  actions: {
    reset: function () {
      "use strict";
      this.options.quizId = undefined;
      this.render();
    }
  }

});
