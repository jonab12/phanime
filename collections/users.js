Meteor.users.helpers({

	avatarImageUrl: function() {
		if (this.profile && this.profile.avatarImage) {
			return "http://cdn.phanime.com/images/users/avatar/" + this._id + "/" + this.profile.avatarImage;
		} else {
			return "http://cdn.phanime.com/images/site/na.gif";	
		}
	},
	profileBannerImageUrl: function() {
		if (this.profile && this.profile.profileBannerImage) {
			return "http://cdn.phanime.com/images/users/profileBanner/" + this._id + "/" + this.profile.profileBannerImage;
		} else {
			return "http://cdn.phanime.com/images/site/na.gif";	
		}

	},
	isAdmin: function() {
		return this.username === 'Maaz' || this.username === 'Lovabelle' || this.username === 'despisal';
	}

});