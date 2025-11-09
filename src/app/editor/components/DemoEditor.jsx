"use client";

import {
  toolbarPlugin,
  KitchenSinkToolbar,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  sandpackPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  diffSourcePlugin,
  markdownShortcutPlugin,
  SandpackConfig,
  MDXEditor,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import { useCallback } from "react";
import { debounce } from "lodash";

const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim();

const reactSandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
      initialSnippetContent: defaultSnippetContent,
    },
  ],
};

const allPlugins = (diffMarkdown, modeState) => [
  toolbarPlugin({
    toolbarContents: () => <KitchenSinkToolbar/>,
  }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({ imageUploadHandler: async () => "/sample-image.png" }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
  sandpackPlugin({ sandpackConfig: reactSandpackConfig }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: "JavaScript",
      css: "CSS",
      txt: "Text",
      tsx: "TypeScript",
    },
  }),
  directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),

  // ✅ KEY PART
  diffSourcePlugin({
    viewMode: modeState, // ensures visual diff view
    diffMarkdown, // previous markdown version
    renderDiff: true, // 👈 ensures rendered comparison, not text
  }),

  markdownShortcutPlugin(),
];

export default function DemoEditor({
  markdown,
  diffMarkdown,
  setDocData,
  modeState,
}) {
  const handleChange = useCallback(
    debounce((value) => setDocData?.(value), 300),
    []
  );

  return (
    <MDXEditor
      key={modeState}
      markdown={markdown}
      contentEditableClassName="prose max-w-full font-sans"
      plugins={allPlugins(diffMarkdown, modeState)}
      onChange={handleChange}
    />
  );
}
