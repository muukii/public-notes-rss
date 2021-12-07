const { blockToString } = require("../block-to-string")

const EOL_MD = "\n"

exports.notionBlockToMarkdown = (block, lowerTitleLevel, depth = 0) =>
	block.children.reduce((acc, childBlock) => {
		let childBlocksString = ""

		if (childBlock.has_children) {
			childBlocksString = "  "
				.repeat(depth)
				.concat(childBlocksString)
				.concat(this.notionBlockToMarkdown(childBlock, lowerTitleLevel, depth + 2))
				.concat(EOL_MD)
		}

		if (childBlock.type == "paragraph") {
			const p = blockToString(childBlock.paragraph.text)

			const isTableRow = p.startsWith("|") && p.endsWith("|")

			return acc
				.concat(p)
				.concat(isTableRow ? EOL_MD : EOL_MD.concat(EOL_MD))
				.concat(childBlocksString)
		}

		if (childBlock.type.startsWith("heading_")) {
			const headingLevel = Number(childBlock.type.split("_")[1])

			return acc
				.concat(EOL_MD)
				.concat(lowerTitleLevel ? "#" : "")
				.concat("#".repeat(headingLevel))
				.concat(" ")
				.concat(blockToString(childBlock[childBlock.type].text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "to_do") {
			return acc
				.concat(`- [${childBlock.to_do.checked ? "x" : " "}] `)
				.concat(blockToString(childBlock.to_do.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "bulleted_list_item") {
			return acc
				.concat("* ")
				.concat(blockToString(childBlock.bulleted_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "numbered_list_item") {
			return acc
				.concat("1. ")
				.concat(blockToString(childBlock.numbered_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "toggle") {
			return acc
				.concat("<details><summary>")
				.concat(blockToString(childBlock.toggle.text))
				.concat("</summary>")
				.concat(childBlocksString)
				.concat("</details>")
		}

		if (childBlock.type == "code") {
			return acc
				.concat(EOL_MD)
				.concat("```", childBlock.code.language, EOL_MD)
				.concat(blockToString(childBlock.code.text))
				.concat(EOL_MD)
				.concat("```")
				.concat(childBlocksString)
				.concat(EOL_MD)
		}

		if (childBlock.type == "image") {
			const imageUrl =
				childBlock.image.type == "external" ? childBlock.image.external.url : childBlock.image.file.url

			return acc
				.concat("![")
				.concat(blockToString(childBlock.image.caption))
				.concat("](")
				.concat(imageUrl)
				.concat(")")
				.concat(EOL_MD)
		}

		if (childBlock.type == "audio") {
			const audioUrl =
				childBlock.audio.type == "external" ? childBlock.audio.external.url : childBlock.audio.file.url

			return acc
				.concat("<audio controls>")
				.concat(EOL_MD)
				.concat(`<source src="${audioUrl}" />`)
				.concat(EOL_MD)
				.concat("</audio>")
				.concat(EOL_MD)
		}

		if (childBlock.type == "video" && childBlock.video.type == "external") {
			const videoUrl = childBlock.video.external.url

			return acc.concat(videoUrl).concat(EOL_MD)
		}

		if (childBlock.type == "embed") {
			return acc.concat(childBlock.embed.url).concat(EOL_MD)
		}

		if (childBlock.type == "quote") {
			return acc.concat("> ").concat(blockToString(childBlock.quote.text)).concat(EOL_MD)
		}

		// TODO: Add support for callouts, internal video, andd files

		if (childBlock.type == "bookmark") {
			const bookmarkUrl = childBlock.bookmark.url

			const bookmarkCaption = blockToString(childBlock.bookmark.caption) || bookmarkUrl

			return acc
				.concat("[")
				.concat(bookmarkCaption)
				.concat("](")
				.concat(bookmarkUrl)
				.concat(")")
				.concat(EOL_MD)
		}

		if (childBlock.type == "divider") {
			return acc.concat("---").concat(EOL_MD)
		}

		if (childBlock.type == "unsupported") {
			return acc
				.concat(`<!-- This block is not supported by Notion API yet. -->`)
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		return acc
	}, "")
