/**
 *
 *
 */

Hull.component('admin/keen/number', {

  type: 'Hull',

  require:["//dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js"],

  templates: ['main'],

  options:{
    eventCollection:'testing',
    analysisType:'sum',
    targetProperty:'value',
    timeFrame: 'this_week',
    interval: 'daily',
    timezone:'3600'
  },

  initialize: function(){
  },

  beforeRender: function(data){
  },

  afterRender: function(data){
    var self = this;
    var _ = this.sandbox.util._;
    var filters = {
      analysisType: data.options.analysisType,
      targetProperty: data.options.targetProperty
    };
    if (data.options.filter) {
      var splitFilter = data.options.filter.split(' ');
      var reduced = _.reduce(_.pluck(splitFilter, 'length'), function (a, b) {
        return a && b;
      });
      if (reduced) {
        filters.filters = [{
          property_name: splitFilter[0],
          operator: splitFilter[1],
          property_value: splitFilter[2]
        }];
      }
    }
    Keen.onChartsReady(function() {
      var metric = new Keen.Metric(data.options.eventCollection, filters);
      var conf = {};
      if (data.options.label) {
        conf.label = data.options.label
      }
      metric.draw(self.$el[0], conf);
    });
  },

  actions: {
  }

});




//--------


/**
 *
 *
 */

Hull.component('admin/keen/root', {

  type: 'Hull',

  // require:["//dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js"],

  templates: ['main'],

  initialize: function(){
    window.Keen.configure(Hull.config.services.settings.keenio);
  },

  actions: {
    reset: function () {
      this.options.quizId = undefined;
      this.render();
    }
  }

});




//--------


/**
 *
 *
 */

Hull.component('admin/keen/series', {

  type: 'Hull',

  require:["//dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js"],

  templates: ['main'],

  options:{
    eventCollection:'testing',
    analysisType:'count',
    targetProperty:'value',
    timeframe: 'this_week',
    interval: 'daily',
    timezone:'3600'
  },

  initialize: function(){
  },

  beforeRender: function(data){
  },

  afterRender: function(data){
    var self = this;
    var _ = this.sandbox.util._;
    var filters = {
      analysisType: data.options.analysisType,
      targetProperty: data.options.targetProperty,
      timeframe: data.options.timeframe,
      interval: data.options.interval
    };
    if (data.options.filter) {
      var splitFilter = data.options.filter.split(' ');
      var reduced = _.reduce(_.pluck(splitFilter, 'length'), function (a, b) {
        return a && b;
      });
      if (reduced) {
        filters.filters = [{
          property_name: splitFilter[0],
          operator: splitFilter[1],
          property_value: splitFilter[2]
        }];
      }
    }
    Keen.onChartsReady(function() {
      var series = new Keen.Series(data.options.eventCollection, filters);
      series.draw(self.$el[0]);
    });
  },

  actions: {
  }

});




//--------


Hull.component('admin/left', {
  templates: ['empty', 'users', 'quiz', 'stats'],
  refreshEvents: ['model.hull.me.change'],
  events: {
    'click .new-quiz': '_toNewQuiz',
  },
  initialize: function () {
    this.sandbox.on('hull.quiz.admin.section.*', function (name) {
      this.render(name);
    }, this);
  },
  _toNewQuiz: function () {
    this.sandbox.emit('hull.quiz.admin.new_quiz');
  }
});




//--------


Hull.component('admin', {
	templates : ['admin'],
	datasources : {

	},

	initialize : function() {

	},

	afterRender : function(data) {

	},
	actions : {

		resetUserBadges : function(event, action) {
			var self = this;
			var _ = this.sandbox.util._;

			this.api('me/badges').then(function(badges) {
				_.each(badges, function(badge) {
					console.warn('delete ', badge);
					self.api(badge.id, 'delete');
				});
			});

		}

	}
});




//--------


Hull.component('admin/main', {
  templates: ['empty', 'not_admin', 'intro', 'users', 'new_quiz', 'stats'],
  refreshEvents: ['model.hull.me.change'],
  initialize: function () {
    "use strict";
    this.sandbox.on('hull.quiz.admin.view', function (quizId) {
      var current = window.location.hash;
      if (current === '#stats') {
        this.render('stats', {quizId: quizId});
      } else {
        this.render('new_quiz', {quizId: quizId});
      }
    }, this);
    this.sandbox.on('hull.quiz.admin.new_quiz', function () {
      this.render('new_quiz');
    }, this);
    this.sandbox.on('hull.quiz.admin.section.*', function (section) {
      this.render(section === 'stats' ? 'stats' : 'empty');
    }, this);
    this.sandbox.on('hull.user.select', function (userId) {
      this.render('users', {
        userId: userId
      });
    }, this);
    if (!this.sandbox.isAdmin()) {
      this.template = 'not_admin';
    }
  }
});




//--------


Hull.component('admin/quiz/list', {
  templates : ['quiz-selector'],
  refreshEvents: ['hull.admin.quiz.refresh'],
  datasources : {
     quizzes: {
      path: 'app/achievements',
      params: {
        where: {
          _type: 'Quiz'
        }
      }
    }
  },

  initialize : function() {
    var self = this;
    this.sandbox.on('quiz.refresh', function(quizId) {
      self.options.quizId = quizId;
      self.render();
    }.bind(this));
  },

  actions : {
    selectQuiz : function(event, action) {
      var quizId = action.data.quizId;
      this.sandbox.emit('hull.quiz.admin.view', quizId);
    }
  }
});




//--------


/**
 *
 * Create and edit quizzes.
 *
 * @name Quiz
 * @template {admin} The main template. It shows the list of your quizzes or the form to edit a quiz.
 * @template {list}  Show the list of your quizzes and a form to add new quizzes.
 * @template {form}  Show the form to edit a quiz.
 * @datasource {quizzes} The collection of all the quizzes available in the application.
 * @example <div data-hull-component="admin/quiz@hull"></div>
 */
Hull.component('admin/quiz/new', {
  templates: ['admin', 'form'],

  datasources: {
    achievements: {
      path: 'app/achievements',
      params: {
        where: {
          _type: 'Quiz'
        }
      }
    }
  },

  events: {
    'submit form': 'submitQuiz'
  },

  actions: {
    selectQuiz: function(event, action) {
      var Model = require('backbone').Model;

      var quiz;
      if (action.data.quizId != null) {
        quiz = this.data.achievements.get(action.data.quizId);
      } else {
        quiz = new Model();
      }

      if (this.currentQuiz) {
        this.stopListening(this.currentQuiz);
      }

      if (quiz) {
        this.currentQuiz = quiz;

        var self = this;
        this.listenTo(this.currentQuiz, 'change', function() {
          self.render();
        });

        this.render();
      }
    },

    addQuestion: function() {
      this.changeForm();

      var questions = this.currentQuiz.get('questions') || [];

      var last = questions[questions.length - 1];
      var count = last ? last.answers.length : 3;

      questions.push(this.generateQuestion(count));
      this.currentQuiz.set('questions', questions);

      this.currentQuiz.trigger('change');
    },

    addAnswer: function(event, action) {
      this.changeForm();

      var question = this.currentQuiz.get('questions')[action.data.questionIndex];
      question.answers = question.answers || [];
      question.answers.push(this.generateAnswer(action.data.questionIndex));

      this.currentQuiz.trigger('change');
    },

    deleteQuiz: function(event, action) {
      var self = this;

      if (confirm('Are you sure ?')) {
        this.api(this.currentQuiz.get('id'), 'delete').then(function () {
          var quiz = self.currentQuiz;
          self.currentQuiz = null;
        });
      }

      this.sandbox.emit('quiz.refresh');
      this.render();
    },

    duplicateQuiz: function(event, action) {
      this.changeForm();

      var Model = require('backbone').Model;

      var params = this.sandbox.dom.getFormData(this.$form);
      params.name += ' (Duplicated)';
      var quiz = new Model(params);
      this.currentQuiz = quiz;

      var self = this;
      this.listenTo(this.currentQuiz, 'change', function() { self.render(); });

      this.render();
    },

    deleteQuestion: function(event, action) {
      this.changeForm();

      var questions = this.sandbox.util._.reject(this.currentQuiz.get('questions'), function(q, i) {
        return i == action.data.questionIndex;
      });

      this.currentQuiz.set('questions', questions);
    },

    deleteAnswer: function(event, action) {
      this.changeForm();

      var question = this.currentQuiz.get('questions')[action.data.questionIndex];
      var answers = this.sandbox.util._.reject(question.answers, function(a, i) {
        return i == action.data.answerIndex;
      });
      question.answers = answers;

      this.currentQuiz.trigger('change');
    }
  },

  changeForm: function() {
    var params = this.sandbox.dom.getFormData(this.$form);
    this.currentQuiz.set(params);

    return params;
  },

  submitQuiz: function(e) {
    e.preventDefault();

    var self = this,
      params = this.changeForm();
    var request;
    if (this.currentQuiz.isNew()) {
      params.type = 'quiz';
      request = this.api('app/achievements', params, 'post');
    } else {
      request = this.api(this.currentQuiz.id, params, 'put');
    }

    request.then(function() {
      self.render();
      self.sandbox.emit('quiz.refresh');

      alert('Your quiz has been updated.');
    });
  },

  beforeRender: function(data) {
    if (!this.currentQuiz) {
      var Model = require('backbone').Model;
      var quiz;
      if (data.options.quizId) {
        quiz = this.data.achievements.get(data.options.quizId);
      } else {
        quiz = new Model();
        quiz.set('questions', [this.generateQuestion(), this.generateQuestion()]);
      }
      this.currentQuiz = quiz;

      var self = this;
      if (this.currentQuiz) {
        this.currentQuiz.on('change', function() {
          self.render();
        });
      }
    }
    var _ = this.sandbox.util._;

    if (this.currentQuiz) {
      data.quiz = this.currentQuiz.toJSON();
      _.each(data.quiz.questions, function(q, i) {
        q.index = i + 1;

        _.each(q.answers, function(a) {
          a.questionIndex = i;
        });
      });

      data.quiz.isNew = this.currentQuiz.isNew();
      if (!data.quiz.isNew) {
        data.embedCode = '<div data-hull-component="games/quiz@hull" data-hull-id="' + data.quiz.id + '"></div>';
      }
    }
  },

  afterRender: function(data) {
    if (data.quiz && data.quiz.id) {
      this.$find('[data-hull-quiz-id="' + data.quiz.id + '"]').addClass('active');
    }

    this.$form = this.$('.js-hull-quiz-form');
  },

  generateQuestion: function(answersCount) {
    var answers = [];
    for (var j = 0; j < (answersCount || 3); j += 1) {
      answers.push(this.generateAnswer());
    }
    return {
      ref: this.generateRef('q'),
      answers: answers
    };
  },

  generateAnswer: function(index) {
    return {
      ref: this.generateRef('a'),
      questionIndex: index
    };
  },

  generateRef: function(prefix) {
    return prefix + '-' + this.sandbox.util._.uniqueId() + (new Date().getTime());
  }
});




//--------


Hull.component('admin/router', {
  templates: ['intro'],
  refreshEvents: ['model.hull.me.change'],
  events: {
    'click .nav>li>a': 'changePage'
  },
  changePage: function (evt) {
    var dest = $(evt.currentTarget).attr('href').replace('#', '');
    this.sandbox.emit('hull.quiz.admin.section.' + dest, dest);
  }
});




//--------


/**
 *
 * Displays the profile of any user of your app.
 *
 * @name User Profile
 * @template {user_profile} Displays detailed informations about the selected user.
 * @param {String} id The id of the user you want to display
 * @example <div data-hull-component="admin/user_profile@hull"></div>
 *
 */
Hull.component('admin/user_profile', {
  type: 'Hull',

  templates: [
    'user_profile'
  ],

  options:{
    id:'me'
  },

  datasources: {
    user: function() {
      if (this.options.id) { return this.api(this.options.id, { fields: 'user.profiles' }); }
    },
    badges: function() {
      if (this.options.id) {  return this.api(this.options.id + "/badges"); }
    }
  },

  initialize: function() {
    this.sandbox.on('hull.user.select', this.renderUser, this);
  },

  beforeRender: function(data){
    if (!data.user) { return; }

    data.userHasProfiles = !this.sandbox.util._.isEmpty(data.user.profiles);
  },

  actions: {
    promote: function(e, action) {
      this.promoteUser(action.data.role);
    },

    approve: function() {
      var self = this;
      this.api(this.data.user.id + '/approve', 'post').then(function() {
        self.render();
      });
    },

    unapprove: function() {
      var self = this;
      this.api(this.data.user.id + '/unapprove', 'post').then(function() {
        self.render();
      });
    },

    deleteBadge: function(e, action) {
      var self = this;
      if (confirm("Sure ?")) {
        this.api(action.data.id, 'delete', function(res) {
          self.render();
        });
      }
    }
  },

  renderUser: function(id) {
    var displayedUser = this.data.user;
    if (displayedUser && displayedUser.id === id) { return; }
    this.options.id = id;
    this.user = id;
    this.render();
  },

  promoteUser: function(role) {
    var method = role === 'admin' ? 'post' : 'delete';
    var self = this;
    this.api('admins/' + this.data.user.id, method).then(function() {
      self.render();
    });
  }
});




//--------


/**
 *
 * Displays the list of users of your app.
 *
 * Access to this component is limited to the administrators, you will need to be logged in to your admin on hullapp.io to access data.
 *
 * @name Users List
 * @template {users}     Displays the list of the users.
 * @template {forbidden} A message to be displayed when the credentials don't allow access to the data
 * @datasource {users} The list of users (Only readable by admins)
 * @example <div data-hull-component="admin/users_list@hull"></div>
 */

Hull.component('admin/users_list', {
  type: 'Hull',

  templates: ['users_list'],

  refreshEvents: ['model.hull.me.change'],

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: 'users'
  },

  initialize: function() {
    this.query = {};
    this.currentQuery = {};
  },

  beforeRender: function(data){
    var datasource = this.datasources.users;

    data.showPagination = datasource.isPaginable();
    data.showNextButton = !datasource.isLast();
    data.showPreviousButton = !datasource.isFirst();

    data.currentQuery = this.currentQuery;

    data.filters = {
      All: { action: 'resetFilter', isActive: this.query.approved == null },
      Approved: { action: 'filterApproved', isActive: this.query.approved === true },
      Unapproved: { action: 'filterUnapproved', isActive: this.query.approved === false }
    };
  },

  afterRender: function() {
    var $searchForm = this.$('.js-hull-users-search');
    $searchForm.on('submit', this.sandbox.util._.bind(function(e) {
      e.preventDefault();
      this.search($searchForm.find('.js-hull-users-search-query').val());
    }, this));
  },

  actions: {
    nextPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isLast()) {
        datasource.next();
        this.render();
      }
    },

    previousPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isFirst()) {
        datasource.previous();
        this.render();
      }
    },

    selectUser: function(event, action) {
      this.sandbox.emit('hull.user.select', action.data.id);
    },

    sort: function(event, action) {
      this.sort(action.data.field, action.data.direction);
    },

    resetSearch: function() {
      delete this.query.email;
      this.filter();
    },

    resetFilter: function() {
      delete this.query.approved;
      this.filter();
    },

    filterApproved: function() {
      this.query.approved = true;
      this.filter();
    },

    filterUnapproved: function() {
      this.query.approved = false;
      this.filter();
    }
  },

  sort: function(field, direction) {
    this.datasources.users.sort(field, direction);
    this.render();
  },

  filter: function() {
    if(this.queryHasChanged()) {
      this.datasources.users.where(this.query);
      this.render();

      this.currentQuery = this.sandbox.util._.clone(this.query);
    }
  },

  queryHasChanged: function() {
    var _ = this.sandbox.util._;

    if (_.isEmpty(this.query) && _.isEmpty(this.currentQuery)) { return false; }
    if (_.size(this.query) !== _.size(this.currentQuery)) { return true; }

    return !this.sandbox.util._.every(this.query, function(v, k) {
      return this.currentQuery[k] === v;
    }, this);
  },

  search: function(email) {
    var query;
    if (!this.sandbox.util._.string.isBlank(email)) {
      this.query.email = email;
    } else {
      delete this.query.email;
    }

    this.filter();
  }
});




//--------


Hull.component('leaderboard', {
	templates : ['leaderboard'],
	requiredOptions : ['id', 'board'],
	datasources : {
		leaders : function() {
			return this.api(this.options.id + '/leaderboards/'
					+ this.options.board, {
				type : this.options.type
			});
		}
	},
	beforeRender : function(data) {
		data.type = this.options.type;
		console.warn("Leaderboard: ", this.options.id, this.id);
	}
});



//--------


Hull.component('other-quiz', {
	
	templates : [ 'other-quiz' ],
	
	datasources : {
		achievements : 'app/achievements',
		badges : function() {
			return this.api('me/badges');
		}
	},
	
	beforeRender : function(data) {
		var achievement_id = this.id;
		data.achievements = this.sandbox.util._.reject(data.achievements, function(a) {
			return a.id == achievement_id;
		});
		return data;
	},
	
	actions : {
		refresh : function(event, action) {
			var self = this;
			var achievement_id = action.data.id;
			var badge = this.sandbox.util._.find(this.data.badges, function(badge) {
				return badge.achievement_id == achievement_id;
			});
			
			if(badge && badge.stats && badge.stats.attempts > 1) {
				this.sandbox.emit('quiz.already');
			} else {
				this.sandbox.emit('quiz.refresh', action.data.id);
			}
		}
	},
});




//--------


Hull.component('quiz-selector', {
	templates : ['quiz-selector'],
	datasources : {
		achievements : function() {
			return this.achievements || this.api('app/achievements');
		}
	},

	initialize : function() {
		var self = this;
		this.sandbox.on('quiz.refresh', function(quizId) {
			self.options.quizId = quizId;
			self.render();
		}.bind(this));
	},

	actions : {
		selectQuiz : function(event, action) {
			var self = this, quizId = action.data.quizId;
			if (this.loggedIn()) {
				this.startQuiz(quizId);
			} else {
				this.sandbox.login('facebook', {
					scope : 'email,user_likes'
				}).then(function() {
					self.startQuiz(quizId);
				});
			}
		}
	},

	startQuiz : function(quizId) {
		if (quizId) {
			this.options.quizId = quizId;
			this.render();
		}
	},

	beforeRender : function(data) {
		var filter = this.sandbox.util._.filter;
		this.achievements = data.achievements;
		data.quizzes = filter(data.achievements, function(a) {
			return a.type === 'quiz';
		});
	},

	afterRender : function() {
		if (this.options.quizId) {
			this.$find('[data-hull-quiz-id="' + this.options.quizId + '"]')
					.addClass('active');
		}
	}
});



//--------


/**
 * 
 * A complete Quiz engine.
 * 
 * A quiz is a game in which the player attempts to find the answer to questions
 * from multiple possible answers. To create a quiz, use the `admin/quiz`
 * component in an admin page, which will let you create a new Quiz (which is a
 * particular type of achievement).
 * 
 * Then use this quiz's ID as a parameter for your component.
 * 
 * @name Quiz
 * @param {String}
 *            id The id of the quiz you want to display
 * @template {quiz} Show the title and the description of the quiz. And
 *           secondarily the identity component if the user is not connected..
 * @datasource {quiz} A collection of all the questions and their possible
 *             answers.
 * @datasource {badge} The result of the Quiz for the current user.
 * @example <div data-hull-component="games/quiz@hull"
 *          data-hull-id="5130a76ed4384e508f000009"></div>
 */


Hull.component('quiz', {

	templates : ['quiz'],
	requiredOptions : ['id'],

	datasources : {
		quiz : ':id',
		badge : 'me/badges/:id'
	},

	initialize : function() {
		this.sandbox.on('registration.submitted', this.finishQuiz, this);
		this.sandbox.on('quiz.already', this.actions.already, this);
	},

	actions : {

		answer : function(event, action) {
			var qRef = action.data.questionRef, aRef = action.data.answerRef;
			this.selectAnswer(qRef, aRef);
		},

		submit : function(event, action) {
			this.finishQuiz();
		},

		next : function() {
			this.selectNextQuestion();
		},

		previous : function() {
			this.selectPreviousQuestion();
		},

		replay : function(event, action) {
			this.resetAnswers = !!action.data.reset;
			this.playing = true;
			if (this.resetAnswers) {
				this.answers = {};
			}
			this.render();
		},

		start : function(event, action) {
			this.resetAnswers = !!action.data.reset;
			if (this.resetAnswers) {
				this.answers = {};
			}
			this.startQuiz();
		},
		
		share : function(e, action) {
			var self = this;
			var provider = action.data.provider;
			
			this.track('hull.share.open', {
				provider: provider
			});

			switch(provider) {
				case 'facebook' :
					FB.ui({
						method : 'feed',
						name : 'Fan des Frères coen ?',
						link : 'http://bit.ly/concours-Inside-Llewyn-Davis',
						picture : 'https://facebook.carburant.fr/silenzio/ild_quiz/images/250x250_.jpg',
						caption : 'Concours du 17 octobre au 9 novembre',
						description : 'Testez vos connaissances et gagnez DVD/Blu Ray des frères COEN ainsi que des places pour aller voir Inside Llewyn Davis, au cinéma le 6 novembre 2013 !'
					}, function(response) {
						if (response) {
							self.track('hull.share.complete', {
								provider: provider
							});							
						} else {
							self.track('hull.share.cancel', {
								provider: provider
							});							
						}
					});
					
					break;
				case 'twitter' :
					window.open('https://twitter.com/share?url=' +
						encodeURIComponent('http://bit.ly/concours-Inside-Llewyn-Davis') + '&text=' +
						encodeURIComponent('Testez vos connaissances sur les films des frères Coen pour la sortie de Inside Llewyn Davis le 6 novembre'));
					
					break;
			}
		},
		
		close : function(event, action) {
			this.$('#overlay').fadeOut(250);
		},
		
		already : function() {
			this.$find('.page-like').hide();
			this.$find('.page-already').show();
			this.$find('#overlay').fadeIn(250);
		}

	},

	// Rendering

	beforeRender : function(data) {
    this.trackingData = {
    	type: 'quiz',
    	name: data.quiz.name,
    	id: data.quiz.id
    };

		var _ = this.sandbox.util._;
				
		if (data.badge && data.badge.id && !this.playing) {
			data.playing = false;
			data.badge.playedEnough = data.badge.stats.attempts > 1 ? false : true;
		} else {
			data.playing = true;
			if (this.resetAnswers) {
				this.answers = {};
			} else {
				var answers = {};
				if (data.badge && data.badge.data) {
					answers = data.badge.data.answers || {};
				}
				this.answers = answers;
			}
			this.questions = data.quiz.questions;
			data.questions = this.getQuestions();
			this.userRegistered = _.all(['email', 'terms'], function(f) {
				return data.me && data.me.profile && !!data.me.profile[f];
			});
		}
	},

	afterRender : function(data) {
		var self = this;
		_ = this.sandbox.util._;
		if (data.playing) {
			this.$find('[data-hull-action="answer"]').removeClass('active');
			if (this.options.highlightAnswers) {
				_.each(this.answers, function(a, q) {
					self.getAnswerEl(q, a).addClass('active');
				});
			}
			if (this.options.autoStart) {
				this.startQuiz();
			} else {
				this.showSection('intro');
			}
		}
		
		if(!this.playing && !Modernizr.touch) {
			this.api({
				provider : 'facebook',
				path : 'me/likes?fields=id&limit=500' //543838809012885
			}).then(function(pageLikes) {
				var pageLiked = false;
				if(pageLikes && pageLikes.data && pageLikes.data.length) {
					pageLiked = _.find(_.flatten(pageLikes.data), function(page) {
						return page.id == '543838809012885';
					});
				}
				if (!pageLiked) {
					FB.XFBML.parse(document.getElementById('overlay'));
					self.$find('.page-like').show();
					self.$find('#overlay').fadeIn(250);
					
					FB.Event.subscribe('edge.create', function(response) {
						self.$find('#overlay').fadeOut(250, function() {
							self.$find('.page-like').hide();
						});
					});					
				}
			});
		}
	},

	showSection : function(sectionName) {
		this.$find('[data-hull-section]').addClass('hidden');
		this.$find('[data-hull-section="' + sectionName + '"]').removeClass('hidden');
	},

	// Questions

	getQuestions : function(resetQuestionsList) {
		var _ = this.sandbox.util._;
		if (this.questionsList && !resetQuestionsList) {
			return this.questionsList;
		} else {		
			var questions = (this.questions || []).slice(0);
			if (this.options.sampleQuestions > 0) {
				this.answers = {};
				questions = _.sample(questions, this.options.sampleQuestions);
			}
			var index = 0;
			this.questionsList = _.map(questions, function(q) {
				index += 1
				return _.extend(q, {
					pagination : {
						index : index,
						total : questions.length
					}
				});
			});
			return this.questionsList;
		}
	},

	getCurrentQuestion : function() {
		var questions = this.getQuestions();
		this.currentQuestionIndex = this.currentQuestionIndex || 0;
		return questions[this.currentQuestionIndex];
	},

	getNextQuestion : function() {
		this.currentQuestionIndex += 1;
		return this.getCurrentQuestion();
	},

	getPreviousQuestion : function() {
		this.currentQuestionIndex = Math.max(this.currentQuestionIndex - 1, 0);
		return this.getCurrentQuestion();
	},

	// Quiz Lifecycle

	startQuiz : function() {
		var self = this;
		this.showSection('questions');
		this.currentQuestionIndex = 0;
		var currentQuestion = this.getCurrentQuestion();
		this.startTicker();
		this.selectQuestion(currentQuestion.ref);
		this.track('hull.quiz.start');
		return this;
	},

	finishQuiz : function() {
		var self = this;
		this.stopTicker();
		var $submitBtn = this.$find('[data-hull-action="submit"]');
		$submitBtn.attr('disabled', true);
		var timing = this.timer.finishedAt - this.timer.startedAt;
		this.api(this.id + "/achieve", 'post', {
			answers : this.answers,
			timing : timing
		}, function(badge) {
			if (badge && badge.data) {
				var score 		= badge.data && badge.data.score;
				var attempts 	= badge.stats && badge.stats.attempts;
				self.track('hull.quiz.finish', {
					score: score,
					timing: timing / 1000,
					attempts: attempts
				});
			}
			$submitBtn.attr('disabled', false);
			self.playing = false;
			self.render();
		});
	},

	// Timers

	startTicker : function() {
		this.ticker = setInterval(this.onTick.bind(this), 1000);
		this.timer = {
			countdowns : {},
			timings : {},
			startedAt : new Date()
		};
		if (this.options.questionTimer > 0) {
			this.timer.countdowns.question = this.options.questionTimer;
		}
		if (this.options.quizTimer > 0) {
			this.timer.countdowns.quiz = this.options.quizTimer;
		}
	},

	stopTicker : function() {
		this.timer.finishedAt = new Date();
		clearInterval(this.ticker);
	},

	onTick : function() {
		if (this.sandbox.stopped) {
			return this.stopTicker();
		}
		var timer = this.timer;

		// Global Timer
		if (this.options.quizTimer) {
			if (timer.countdowns.quiz > 0) {
				timer.countdowns.quiz -= 1;
				this.onQuizTick(timer.countdowns.quiz, this.options.quizTimer);
			} else if (timer.countdowns.quiz === 0) {
				this.finishQuiz();
			}
		}

		// Question Timer
		if (this.options.questionTimer) {
			if (timer.countdowns.question > 0) {
				timer.countdowns.question -= 1;
				this.onQuestionTick(timer.countdowns.question);
			} else if (timer.countdowns.question === 0) {
				this.selectNextQuestion();
			}
		}
	},

	resetQuestionCountdown : function() {
		if (this.options.questionTimer) {
			this.timer.countdowns.question = this.options.questionTimer;
			this.onQuestionTick(this.options.questionTimer);
		}
	},

	onQuestionTick : function(remaining, total) {
		this.$find('[data-hull-question-ticker]').html(remaining);
	},

	onQuizTick : function(remaining, total) {
		this.$find('[data-hull-quiz-ticker]').html(remaining);
	},

	// Navigation

	selectQuestion : function(qRef) {
		var self = this;
		this.$find('[data-hull-question]').addClass('hidden');
		var qEl = this.getQuestionEl(qRef);
		qEl.removeClass('hidden');
	},

	selectNextQuestion : function() {
		var q = this.getNextQuestion();
		if (q) {
			this.selectQuestion(q.ref);
			this.resetQuestionCountdown();
		} else {
			
			this.$('.question').addClass('hidden');
			if (this.userRegistered) {
				this.finishQuiz();
			} else {
				if (this.options.autoSubmit) {
					this.finishQuiz();
				} else {
					this.showSection('finished');
					this.stopTicker();
				}
			}
		}
	},

	selectPreviousQuestion : function() {
		var q = this.getPreviousQuestion();
		this.selectQuestion(q.ref);
		this.resetQuestionCountdown();
	},

	selectAnswer : function(qRef, aRef) {
		this.getQuestionEl(qRef).find("[data-hull-action='answer']").removeClass('active');
		this.answers[qRef] = aRef;
		this.getAnswerEl(qRef, aRef).addClass('active');
		if (this.options.autoNext) {
			this.selectNextQuestion();
		}
	},

	// DOM getters

	getQuestionEl : function(qRef) {
		
		return this.$find("[data-hull-question='" + qRef + "']");
	},

	getAnswerEl : function(qRef, aRef) {
		var $q = this.getQuestionEl(qRef);
		return $q.find("[data-hull-action='answer'][data-hull-answer-ref='" + aRef + "']");
	}

});





//--------


[
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
    "label": 'j\'ai lu et approuvé le <a href="reglement.pdf" target="_blank">règlement</a>',
    "error": "Veuillez cocher la case du règlement",
    "required": true
  }
]



//--------


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
