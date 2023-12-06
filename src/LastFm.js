export class LastFm {
	/**
	 * @param {object} params
	 * @param {string} params.apiKey
	 */
	constructor({ apiKey }) {
		this.apiKey = apiKey
	}

	/**
	 * @param {string} artist
	 * @returns {Promise<string[]>} The artist top tags, sorted by popularity
	 */
	async getArtistTopTags(artist) {
		// TODO Encode params
		const res = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${artist}&api_key=${this.apiKey}&format=json`
		)
		const data = await res.json()
		if (data.error) throw data
		return data.toptags.tag.map((tagData) => tagData.name)
	}
}
