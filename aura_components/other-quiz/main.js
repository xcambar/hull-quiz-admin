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
