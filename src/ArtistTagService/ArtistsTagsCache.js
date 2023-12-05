import fs from 'node:fs'

export class ArtistsTagsCache {
	/**
	 * @param {object} params
	 * @param {string} params.path
	 */
	constructor({ path }) {
		this.path = path
		this.artistsTags = this.#loadPersistedCache()
	}

	/**
	 * @param {string} artist
	 * @returns {string | null | undefined}
	 */
	get(artist) {
		return this.artistsTags.get(artist)
	}

	/**
	 * @param {string} artist
	 * @param {string | null} tag
	 */
	set(artist, tag) {
		this.artistsTags.set(artist, tag)
		this.#persistCache()
	}

	/**
	 * @returns {Map<string, string | null>}
	 */
	#loadPersistedCache() {
		try {
			return new Map(JSON.parse(fs.readFileSync(this.path, 'utf-8')))
		} catch {
			return new Map()
		}
	}

	#persistCache() {
		fs.writeFileSync(this.path, JSON.stringify([...this.artistsTags], null, 2))
	}
}
