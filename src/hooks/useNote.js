import { useState, useEffect } from "react";
import { useStoreState, useStoreActions } from "easy-peasy";
import {
  ContentState,
  EditorState,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import {
  DEFAULT_TEXT,
  DEFAULT_CONTENT_STATE_RAW,
} from "../constants/constants";

let timeout = null;

export default function useNote() {
  const currentNote = useStoreState(state => state.notes.currentNote);
  const setCurrentNote = useStoreActions(
    dispatch => dispatch.notes.setCurrentNote
  );
  const [editorState, _setEditorState] = useState(null);

  // Initial state from global state
  useEffect(() => {
    // initial editor state from global state OR empty
    let initialEditorState;
    if (!currentNote.content) {
      if (currentNote.content === null) {
        initialEditorState = EditorState.createEmpty();
        // initialEditorState = EditorState.createWithContent(
        //   ContentState.createFromText("Your new note here.")
        // );
      } else {
        initialEditorState = EditorState.createWithContent(
          convertFromRaw(DEFAULT_CONTENT_STATE_RAW)
        );
      }
    } else {
      const contentState = convertFromRaw(currentNote.content);
      initialEditorState = EditorState.createWithContent(contentState);
    }

    _setEditorState(initialEditorState);
  }, [currentNote.id]);

  function setEditorState(newEditorState) {
    // https://github.com/facebook/draft-js/issues/1060
    const contentHasChanged =
      editorState.getCurrentContent() !== newEditorState.getCurrentContent();

    _setEditorState(newEditorState);

    if (!contentHasChanged) {
      return;
    }

    // Save contentState to global state
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const contentState = newEditorState.getCurrentContent();
      const contentStateRaw = convertToRaw(contentState);
      setCurrentNote(contentStateRaw);
    }, 300);
  }

  return [editorState, setEditorState];
}
