import fs from 'node:fs'

export class ArtistTagCache {
	#path
	#tags

	/**
	 * @param {object} params
	 * @param {string} params.path
	 */
	constructor({ path }) {
		this.#path = path
		this.#tags = this.#loadPersistedCache()
	}

	/**
	 * @param {string} artist
	 * @returns {string | null | undefined}
	 */
	getArtistTag(artist) {
		return this.#tags.get(artist)
	}

	/**
	 * @param {string} artist
	 * @param {string | null} tag
	 */
	setArtistTag(artist, tag) {
		this.#tags.set(artist, tag)
		this.#persistCache()
	}

	get allTags() {
		return new Map(this.#tags)
	}

	/**
	 * @returns {Map<string, string | null>}
	 */
	#loadPersistedCache() {
		try {
			return new Map(JSON.parse(fs.readFileSync(this.#path, 'utf-8')))
		} catch {
			return new Map()
		}
	}

	#persistCache() {
		fs.writeFileSync(this.#path, JSON.stringify([...this.#tags], null, 2))
	}
}
