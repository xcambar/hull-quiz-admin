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

