import React from "react";
import cx from "classnames";
import { useStoreState, useStoreActions } from "easy-peasy";
import { RichUtils } from "draft-js";
import Editor from "draft-js-plugins-editor";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import createMarkdownShortcutsPlugin from "draft-js-markdown-shortcuts-plugin";

import useNote from "../../hooks/useNote";
import "draft-js/dist/Draft.css";
import EditorToolbar from "../EditorToolbar/EditorToolbar";
// import "draft-js-linkify-plugin/lib/plugin.css";
import styles from "./Editor.css";

const linkifyPlugin = createLinkifyPlugin({
  target: "_blank",
  component: props => (
    <a {...props} onClick={() => window.open(props.href, "_blank")} />
  ),
});
const markdownPlugin = createMarkdownShortcutsPlugin();

export default function MyEditor() {
  const [editorState, setEditorState] = useNote();
  const font = useStoreState(state => state.settings.font);
  const fontSize = useStoreState(state => state.settings.fontSize);
  const nightmode = useStoreState(state => state.settings.nightmode);
  const listOpen = useStoreState(state => state.notes.listOpen);
  const closeList = useStoreActions(dispatch => dispatch.notes.closeList);

  function onChange(newEditorState) {
    setEditorState(newEditorState);
  }

  function handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  }

  function handleFocus() {
    if (listOpen) {
      closeList();
    }
  }

  function blockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    if (type === "header-one") {
      return styles.title;
    }
  }

  const styleMap = {
    BOLD: {
      fontWeight: "700",
    },
  };

  const fontStyle = {
    fontFamily: font,
    fontSize,
  };

  return (
    <div
      style={fontStyle}
      className={cx(styles.container, {
        [styles.nightmode]: nightmode,
      })}
    >
      <EditorToolbar editorState={editorState} onChange={onChange} />
      {editorState !== null && (
        <Editor
          editorState={editorState}
          customStyleMap={styleMap}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          onFocus={handleFocus}
          plugins={[linkifyPlugin, markdownPlugin]}
          blockStyleFn={blockStyleFn}
        />
      )}
    </div>
  );
}
