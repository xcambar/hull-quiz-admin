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