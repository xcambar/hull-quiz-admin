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