import type { Root } from "mdast"
import { directiveFromMarkdown } from "mdast-util-directive"
import { fromMarkdown } from "mdast-util-from-markdown"
import { gfmStrikethroughFromMarkdown } from "mdast-util-gfm-strikethrough"
import { gfmTableFromMarkdown } from "mdast-util-gfm-table"
import { directive } from "micromark-extension-directive"
import { gfmStrikethrough } from "micromark-extension-gfm-strikethrough"
import { gfmTable } from "micromark-extension-gfm-table"
import type { PhrasingContent } from "@siteforge/markdown-utils"

export type { RootContentMap } from "mdast"
export type { RootContent } from "mdast"
export type { PhrasingContent } from "mdast"

export function generate_ast(markdown: string): Root {
    return fromMarkdown(markdown, {
        extensions: [
            gfmTable(),
            directive(),
            gfmStrikethrough(),
        ],
        mdastExtensions: [
            directiveFromMarkdown(),
            gfmTableFromMarkdown(),
            gfmStrikethroughFromMarkdown(),
        ],
    })
}

/**
 * Registry of all mdast nodes that can occur as children of {@link Root}.
 *
 * > 👉 **Note**: {@link Root} does not need to be an entire document.
 * > it can also be a fragment.
 *
 * This interface can be augmented to register custom node types:
 *
 * For a union of all {@link Root} children, see {@link RootContent}.
 */

declare module "mdast" {
    // interface RootContentMap {
    //     // Allow using toml nodes defined by `remark-frontmatter`.
    //     // table: Table
    // }
}


export function get_plain_text(content: PhrasingContent[]): string {
    let text = ""
    for (const node of content) {
        // we will recursively call this function for nested nodes
        if (node.type === "text" || node.type === "inlineCode") {
            text += node.value
        }
        if ("children" in node) {
            text += get_plain_text(node.children)
        }
    }

    return text
}
