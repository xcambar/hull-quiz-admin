Hull.component('registration', {
    type: 'Hull',

    templates: ['registration_form', 'registration_complete'],

    complete: false,

    options:{
      editable:false
    },

    
    defaultFields: [
      {
        "name": "first_name",
        "type": "text",
        "label": "Prénom",
        "placeholder": "Prénom",
        "error": "Veuillez entrer votre prénom",
        "required": true
      },{
          "name": "last_name",
          "type": "text",
          "label": "Nom",
          "placeholder": "Nom",
          "error": "Veuillez entrer votre nom",
          "required": true
        },
      {
        "name": "email",
        "type": "email",
        "label": "Email",
        "placeholder": "Email",
        "error": "Veuillez entrer votre email",
        "required": true
      },
      {
        "name": "terms",
        "type": "checkbox",
        "label": "j'ai lu et approuvé le règlement",
        "error": "Veuillez cocher la case du règlement",
        "required": true
      }
    ],

    datasources: {
      fields: function() {
        var extra = this.sandbox.data.api.model('app').get('extra');
        return extra.profile_fields || this.defaultFields;
      }
    },

    initialize : function(options, callback) {
      this.formId = "form_"+(new Date()).getTime();
      var _ = this.sandbox.util._;
      _.bindAll.apply(undefined, [this].concat(_.functions(this)));
    },

    validate: function() {
      this._ensureFormEl();
      var isValid = this.formEl.checkValidity();
      if(isValid) return isValid;
      this.$el.find('[data-hull-input]').each(function(key, el){
        var $el = $(el),
            id = $el.attr('id');
        var errorMsg = $el.siblings('[data-hull-error]')
        errorMsg.text((el.checkValidity()) ? '' : $el.data('errorMessage'));
      });
      return false;
    },

    register: function(profile) {

      var self  = this;
          me    = this.sandbox.data.api.model('me');
          
      if (this.loggedIn()) {
        this.api('me/profile', 'put', profile, function(newProfile) {
          me.set('profile', newProfile);
          self.sandbox.emit('registration.submitted');
          self.render();
        });
      }
    },

    beforeRender: function(data) {
      data.formId = this.formId;
      var fields = this.sandbox.util._.map(data.fields, function(f) {
        f.value = this._findFieldValue(f.name);
        return f;
      }, this);

      var profile = data.me.profile || {};

      // Check if user.profile contains all the fields with their respective
      // value. If it's the case we consider the form as complete.
      var isComplete = this.sandbox.util._.every(fields, function(f) {
        var profileField = profile[f.name];
        if (f.type === 'checkbox') {
          return profileField == f.value;
        } else {
          return !!profileField && profileField === f.value;
        }
      });


      //this.template = isComplete ? 'registration_complete' : 'registration_form';

      this.template = 'registration_form';
      
      this.fields = fields;
    },

    afterRender: function() {
      if (this.template === 'registration_form') {
        var self = this;
        setTimeout(function() {
          self._ensureFormEl();
          H5F.setup(self.$find('form'), {
            validClass: "hull-form__input--valid",
            invalidClass: "hull-form__input--invalid",
            requiredClass: "hull-form__input--required",
            placeholderClass: "hull-form__input--placeholder"
          });

        }, 100);
      }
    },

    actions: {
      edit: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.render("registration_form");
        return false;
      },

      submit: function(e) {
        e && e.preventDefault();

        if (!this.validate()) {
          e && e.stopPropagation();
          e && e.stopImmediatePropagation();
          return false;
        }

        var fields = this.sandbox.util._.clone(this.fields),
            extra  = {},
            el = this.$el;

        this.sandbox.util._.each(fields, function(field) {
          if (field.type == 'checkbox') {
            extra[field.name] = el.find('#hull-form-' + field.name).is(':checked');
          } else {
            extra[field.name] = el.find('#hull-form-' + field.name).val();
          }
        });

        this.register(extra);
      }
    },

    _findFieldValue: function(name) {
      var me = this.data.me.toJSON() || {};

      var identities = this.sandbox.util._.reduce(me.identities, this.sandbox.util._.bind(function(memo, i) {
        return this.sandbox.util._.extend(memo, i);
      }, this), {});

      me.profile = me.profile || {};
      identities = identities || {};

      return me.profile[name] || me[name] || identities[name];
    },

    _ensureFormEl: function() {
      this.formEl = document.getElementById(this.formId);
    }
});
