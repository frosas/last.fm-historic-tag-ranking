/**
 * @typedef {import('./LastFm.js').LastFm} LastFm
 * @typedef {import('./ArtistTagsCache.js').ArtistTagsCache} ArtistTagsCache
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
	 * @param {ArtistTagsCache} params.cache
	 * @param {LastFm} params.lastFm
	 */
	constructor({ cache, lastFm }) {
		this.cache = cache
		this.lastFm = lastFm
	}

	async getArtistTag(artist) {
		const originalTag = await this.#getOriginalArtistTag(artist)
		return this.#normalizeTag(originalTag)
	}

	/**
	 * @param {string} artist
	 * @returns {Promise<string | undefined>} The artist main tag or undefined if they has no tag
	 */
	// TODO getArtistTopTag
	async #getOriginalArtistTag(artist) {
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
		// TODO Convert too-specific tags to more general tags (eg, 'hard rock' -> 'rock')
		const tag = tags.find((tag) => !ignoredTags.includes(tag))
		console.warn('Tag:', tag)
		this.cache.setArtistTag(artist, tag ?? null)
		return tag
	}

	/**
	 * @param {string | undefined} tag
	 */
	#normalizeTag(tag) {
		if (tag === undefined) return undefined
		const normalizedTag = tag.toLocaleLowerCase()
		// TODO Better use a more specific original tag if available (eg, 'indie rock' -> 'rock')
		if (normalizedTag === 'indie') return 'rock'
		if (normalizedTag.match(/rock/)) return 'rock'
		if (normalizedTag.match(/punk/)) return 'rock'
		if (normalizedTag.match(/metal/)) return 'rock'
		if (normalizedTag === 'trance') return 'electronic'
		if (normalizedTag === 'techno') return 'electronic'
		if (normalizedTag === 'minimal') return 'electronic'
		if (normalizedTag === 'drum and bass') return 'electronic'
		if (normalizedTag === 'electro') return 'electronic'
		if (normalizedTag === 'dance') return 'electronic'
		if (normalizedTag.match(/house/)) return 'electronic'
		if (normalizedTag.match(/pop/)) return 'pop'
		return normalizedTag
	}

	get artistsTags() {
		return this.cache.allTags
	}
}
