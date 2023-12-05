import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * @param {object} importMeta
 * @param {string} importMeta.url
 * @returns {string}
 */
export const getImportDirname = (importMeta) => dirname(fileURLToPath(importMeta.url))
