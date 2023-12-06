/**
 * @typedef {import('./LastFm.js').LastFm} LastFm
 * @typedef {import('./ArtistTagCache.js').ArtistTagCache} ArtistTagCache
 */

// TODO Use an allowed list instead of an ignored list?
// TODO Don't use an ignored list at all?
const ignoredTags = [
	'seen live',
	'musik um sich allein zu betrinken',
	'dank',
	'boy der am block chillt',
	'horses and ponies and unicorns too',
	'countries and continents',
	'favorites',
	'female vocalists',
	'Deutschrap',
	'angeschwollene Eier',
	'french',
	'Norway',
	'haiti',
	'belgian',
	'spain',
	'catala',
	'catalan',
	'australian',
	'Soundtrack',
	'Espanol',
	'japanese',
	'swedish',
	'spanish',
	'british',
	'UK',
	'60s',
	'80s',
	'USA',
	'oldies',
	'All',
	'norwegian',
	'spotify',
	'under 2000 listeners',
	'icelandic',
	'Canadian',
	'german',
	'irish',
	'dutch',
	'guitar',
	'france',
	'african',
	'germany',
	'New Zealand',
	'composer',
	'brazilian',
	'catalunya',
	'anime',
	'canada',
	'Sleep',
	'spoken word',
	'american',
	'netherlands',
	'70s',
	'Belgium',
	'australia',
	'danish',
	'portuguese',
	'japan',
	'Italy',
	'Disney',
	'Portugal',
	'mexico',
	'brazil',
]

export class ArtistTagService {
	/**
	 * @param {object} params
	 * @param {ArtistTagCache} params.cache
	 * @param {LastFm} params.lastFm
	 */
	constructor({ cache, lastFm }) {
		this.cache = cache
		this.lastFm = lastFm
	}

	/**
	 * @param {string} artist
	 * @returns {Promise<string | undefined>} The artist main tag or undefined if they has no tag
	 */
	async getArtistTag(artist) {
		const cachedTag = this.cache.getArtistTag(artist)
		const isTagCached = cachedTag !== undefined
		/**
		 * We want to retry fetching/saving the tag if it's in the ignored list as it means it's a newly
		 * added tag to the list
		 */
		const isCachedTagIgnored = typeof cachedTag === 'string' && ignoredTags.includes(cachedTag)
		if (isTagCached && !isCachedTagIgnored) return cachedTag ?? undefined
		console.warn('Fetching tag for artist:', artist)
		const tags = await this.lastFm.getArtistTopTags(artist)
		const tag = tags.find((tag) => !ignoredTags.includes(tag))
		console.warn('Tag:', tag)
		this.cache.setArtistTag(artist, tag ?? null)
		return tag
	}
}
