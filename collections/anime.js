Anime = new Meteor.Collection("anime");

AnimeSchema = new SimpleSchema({
	canonicalTitle: {
		type: String,
		label: "Canonical Title",
		index: 1,
		unique: true,
		min: 1,
		max: 500 // sanity check max value
	},
	romajiTitle: {
		type: String,
		label: "Romaji Title",
		min: 1,
		max: 500, // sanity check max value
		optional: true
	},
	englishTitle: {
		type: String,
		label: "English Title",
		min: 1,
		max: 500, // sanity check max value
		optional: true
	},
	japaneseTitle: {
		type: String,
		label: "Japanese Title",
		min: 1,
		max: 500, // sanity check max value
		optional: true
	},
	slug: {
		type: String,
		label: "Slug",
		autoform: {
			disabled: true,
			value: null
		},
		autoValue: function() {
			// Let's grab the document
			var canonicalTitle;

			if (this.isUpdate && !this.field("canonicalTitle").value) {
				canonicalTitle = Anime.findOne({_id: this.docId}).canonicalTitle;
			} else {
				canonicalTitle = this.field("canonicalTitle").value;
			}

			console.log(canonicalTitle);

			return getSlug(canonicalTitle);
		}
	},
	coverImage: {
		type: String,
		optional: true
	},
	bannerImage: {
		type: String,
		autoform: {
			disabled: true,
		},
		optional: true
	},
	type: {
		type: String,
		allowedValues: [
			"TV",
			"OVA",
			"Movie",
			"Special",
			"ONA",
			"Music" // This is for MAL compatibility
		],
		autoform: {
			firstOption: "Select Type of Anime"
		},
		optional: true
	},
	status: {
		type: String,
		allowedValues: [
			"On-going",
			"Complete",
			"Not Yet Aired"
		],
		autoform: {
			firstOption: "Select Anime Status"
		},
		optional: true
	},
	startDate: {
		type: Date,
		optional: true
		// Do a check that this is less than endDate if endDate is defined
	},
	endDate: {
		type: Date,
		optional: true,
	},
	languageVersion: {
		type: [String],
		allowedValues: ["Subbed", "Dubbed"],
	},
	ageRating: {
		type: String,
		allowedValues: [
			"NR - Not Rated",
			"G - All Ages",
			"PG - Children",
			"PG-13 - Teens 13 or older",
			"R - 17+ (violence & profanity)",
			"R+ - Mild Nudity",
			"Rx - Hentai"
		],
		autoform: {
			firstOption: "Select Age Rating"
		}
	},
	genres: {
		type: [String],
		optional: true
	},
	themes: {
		type: [String],
		optional: true
	},
	studios: {
		type: [String],
		optional: true
	},
	seasonNumber: {
		type: Number,
		min: 0,
		optional: true
	},
	totalEpisodes: {
		type: Number,
		min: 0,
		max: 5000, // sanity check max value
		optional: true
	},
	episodeDuration: {
		type: Number,
		min: 0,
		max: 5000, // sanity check max value
		optional: true
	},
	titleSynonyms: {
		type: String,
		autoform: {
			rows: 5
		},
		optional: true
	},
	description: {
		type: String,
		autoform: {
			rows: 10
		},
		min: 0,
		max: 10000, // sanity check max value
		optional: true
	},
	myAnimeListId: {
		type: String,
		label: "MyAnimeList ID",
		optional: true
	},
	animeNewsNetworkId: {
		type: String,
		label: "AnimeNewsNetwork ID",
		optional: true
	},
	anidbId: {
		type: String,
		label: "aniDB ID",
		optional: true
	},
	createdAt: {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}
			//  else if ((this.value === null || this.value === undefined) && !this.isUpdate) {
			// 	// this is more for the times where validation needs to happen without "inserting"
			// 	return new Date();
			// }
		},
		denyUpdate: true,
		optional: true // this is only made optional because validation before insert will not work if it was required, however, this does not make much of a difference as the createdAt value will still be generated on insert.
	},
	updatedAt: {
		type: Date,
		autoValue: function() {
			if (this.isUpdate) {
				return new Date();
			}
		},
		denyInsert: true,
		optional: true // this is only made optional because validation before insert will not work if it was required, however, this does not make much of a difference as the value will still be generated on update.
	},
	newImageURLFormat: {
		type: Boolean,
		autoValue: function() {
			if (this.isInsert) {
				return true;
			}
		},
		optional: true // this is only made optional because validation before insert will not work if it was required, however, this does not make much of a difference as the value will still be generated on insert.

	},
	importFromMyAnimeList: {
		type: Boolean,
		optional: true
	},
	myAnimeListScore: {
		type: Number,
		decimal: true,
		optional: true
	}
});

Anime.attachSchema(AnimeSchema);

Anime.helpers({

	coverImageUrl: function() {
		// If revisionId exists then we're using the new upload system
		// so we should use animeId in the url
		if (this.newImageURLFormat) {
			if (this.coverImage) {
				return "http://cdn.phanime.com/images/anime/cover/" + this._id  + "/" + this.coverImage;
			} else {
				return "http://cdn.phanime.com/images/site/na.gif";
			}
		} else {
			if (this.coverImage) {
				return "http://cdn.phanime.com/images/anime/cover/" + this.coverImage;
			} else {
				return "http://cdn.phanime.com/images/site/na.gif";
			}
		}
	},
	title: function() {
		// For the time being we just choose
		// the standard title
		return this.canonicalTitle;
	},
	libraryEntry: function() {
		return LibraryEntries.findOne({animeId: this._id, userId: Meteor.userId()});
	}
});

Anime.allow({

	insert: function(userId, doc) {

		// We need to ensure that there is only one anime per canonicalTitle
		var titleCheck = Anime.findOne({canonicalTitle: doc.canonicalTitle});
		var slugCheck = Anime.findOne({slug: doc.slug});

		var uniqueCondition;

		// console.log(titleCheck);
		// console.log(slugCheck);

		if (titleCheck || slugCheck) {
			uniqueCondition = false;
		} else {
			uniqueCondition = true;
		}
		return uniqueCondition;
	}
});

EasySearch.createSearchIndex('anime', {
	'use' : 'elastic-search',
	'field' : ['canonicalTitle', 'englishTitle', 'romajiTitle', 'titleSynonyms'],
	'collection' : Anime,
	'limit' : 24,
	transform: function(doc) {
		if (doc.startDate) {
			delete doc.startDate;
		}

		if (doc.endDate) {
			delete doc.endDate;
		}

		if (doc.ratingCounts) {
			delete doc.ratingCounts;
		}
	},
	'changeResults' : function (results) {
		// We should attach libraryEntries to anime if the user exists

		// if (Meteor.userId()) {
		// 	results.results.forEach(function(anime) {
		// 		anime.libraryEntry = LibraryEntries.findOne({userId: Meteor.userId(), animeId: anime._id});
		// 	});
		// }
		// var ids = _.pluck(results.results, "_id");
		// return results;
		console.log(results);
		return results;
	}
});


AnimeRevisionsSchema = new SimpleSchema({
	_id: {
		type: String,
		optional: true,
		label: " " // The only trick to hide the labels for now
	},
	revisionId: {
		type: String,
		label: ' ', // The only trick to hide the labels for now
		optional: true
	},
	canonicalTitle: {
		type: String,
		label: "Canonical Title",
	},
	romajiTitle: {
		type: String,
		label: "Romaji Title",
		optional: true,
	},
	englishTitle: {
		type: String,
		label: "English Title",
		optional: true,
	},
	japaneseTitle: {
		type: String,
		label: "Japanese Title",
		optional: true,
	},
	slug: {
		type: String,
		label: "Slug",
		autoform: {
			disabled: true,
			value: null
		},
		optional: true,
	},
	coverImage: {
		type: String,
		optional: true,
	},
	bannerImage: {
		type: String,
		autoform: {
			disabled: true,
		},
		optional: true,
	},
	type: {
		type: String,
		allowedValues: [
			"TV",
			"OVA",
			"Movie",
			"Special",
			"ONA"
		],
		autoform: {
			firstOption: "Select Type of Anime"
		},
		optional: true
	},
	status: {
		type: String,
		allowedValues: [
			"On-going",
			"Complete",
			"Not Yet Aired"
		],
		autoform: {
			firstOption: "Select Anime Status"
		},
		optional: true
	},
	startDate: {
		type: Date,
		optional: true,
	},
	endDate: {
		type: Date,
		optional: true,
	},
	languageVersion: {
		type: [String],
		allowedValues: ["Subbed", "Dubbed"],
	},
	ageRating: {
		type: String,
		allowedValues: [
			"NR - Not Rated",
			"G - All Ages",
			"PG - Children",
			"PG-13 - Teens 13 or older",
			"R - 17+ (violence & profanity)",
			"R+ - Mild Nudity",
			"Rx - Hentai"
		],
		autoform: {
			firstOption: "Select Age Rating"
		}
	},
	genres: {
		type: [String],
		autoform: {
			type: "selectize",
			afFieldInput: {
				multiple: true
			}
		},
		optional: true
	},
	themes: {
		type: [String],
		optional: true
	},
	studios: {
		type: [String],
		optional: true
	},
	seasonNumber: {
		type: Number,
		optional: true,
		min: 0,
	},
	totalEpisodes: {
		type: Number,
		optional: true,
		min: 0,
	},
	episodeDuration: {
		type: Number,
		optional: true,
		min: 0,
	},
	titleSynonyms: {
		type: String,
		optional: true,
		autoform: {
			rows: 5
		}
	},
	description: {
		type: String,
		optional: true,
		autoform: {
			rows: 10
		}
	},
	myAnimeListId: {
		type: String,
		label: "MyAnimeList ID",
		optional: true
	},
	animeNewsNetworkId: {
		type: String,
		label: "AnimeNewsNetwork ID",
		optional: true
	},
	anidbId: {
		type: String,
		label: "aniDB ID",
		optional: true
	}
});
