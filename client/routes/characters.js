CharactersController = RouteController.extend({
	
	onBeforeAction: function () {
		SEO.set({
			title: siteSettings.getFullTitle("Characters"),
			meta: {
				'description' : 'Explore the all the characters related to anime shows on phanime'
			}
		});
	},

	waitOn: function () {
		return Meteor.subscribe('characters');
	},

	data: function () {
		return Characters.find({}, {sort: {createdAt: -1}});
	}

});