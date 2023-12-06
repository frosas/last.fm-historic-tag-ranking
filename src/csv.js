/**
 * @param {string[][]} rows
 */
export function buildCsv(rows) {
	return rows.map(buildCsvLine).join('\n')
}

/**
 * @param {string[]} row
 */
function buildCsvLine(row) {
	return row.map((value) => `"${value}"`).join(', ')
}
