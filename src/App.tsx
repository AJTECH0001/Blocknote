import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useState, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { marked } from "marked";
import DOMPurify from "dompurify";

import "./styles.css";

// Uploads a file to tmpfiles.org and returns the URL to the uploaded file.
async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);

  const ret = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).data.url.replace(
    "tmpfiles.org/",
    "tmpfiles.org/dl/"
  );
}

export default function App() {
  // Stores the editor's contents as Markdown.
  const [markdown, setMarkdown] = useState<string>("");

  // Creates a new editor instance with some initial content.
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: [
          " ",
          {
            type: "text",
            text: "",
            styles: {
              bold: true,
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "image",
      },
      {
        type: "paragraph",
      },
    ],
    uploadFile,
  });

  const onChange = async () => {
    // Converts the editor's contents from Block objects to Markdown and store to state.
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(markdown);
    localStorage.setItem("editorContent", markdown);
  };

  const renderMarkdown = (markdown: string) => {
    // Parse the Markdown content to HTML
    const rawHTML = marked(markdown);
    // Sanitize the HTML
    const cleanHTML = DOMPurify.sanitize(rawHTML);
    return cleanHTML;
  };

  useEffect(() => {
    // Apply syntax highlighting after rendering the HTML
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block as HTMLElement);
    });
  });

  // Renders the editor instance, and its contents as Markdown below.
  return (
    <div className={"wrapper"}>
      <div>Input (BlockNote Editor):</div>
      <div className={"item"}>
        <BlockNoteView editor={editor} onChange={onChange} />
      </div>
      <div>Output (Markdown):</div>
      <div className={"item bordered"}>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />
      </div>
    </div>
  );
}
