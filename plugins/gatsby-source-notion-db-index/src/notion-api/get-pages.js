const fetch = require("node-fetch")
const { errorMessage } = require("../error-message")
const { getBlocks } = require("./get-blocks")

exports.getPages = async ({ token, databaseId, notionVersion = "2021-05-13" }, reporter) => {
	let hasMore = true
	let startCursor = ""
	const url = `https://api.notion.com/v1/databases/${databaseId}/query`
	const body = {
		page_size: 100,
	}

	const pages = []

	while (hasMore) {
		if (startCursor) {
			body.start_cursor = startCursor
		}

		try {
			const result = await fetch(url, {
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json",
					"Notion-Version": notionVersion,
					Authorization: `Bearer ${token}`,
				},
			}).then((res) => res.json())

			startCursor = result.next_cursor
			hasMore = result.has_more

			for (let page of result.results) {
        console.log(JSON.stringify(page, null, 2))
				pages.push(page)
			}
		} catch (e) {
			reporter.panic(errorMessage)
		}
	}

	return pages
}
