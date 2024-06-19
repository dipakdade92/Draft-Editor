import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./MyEditor.css";

const { hasCommandModifier } = KeyBindingUtil;

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    // Load editor content from localStorage on component mount
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleReturn = (e) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const blockText = currentBlock.getText();

    if (blockText.startsWith("# ")) {
      const trimmedText = blockText.replace(/^#\s*/, "");
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        trimmedText,
        editorState.getCurrentInlineStyle().add("header-one")
      );

      const newState = EditorState.push(
        editorState,
        newContentState,
        "change-block-data"
      );

      const newStateWithNewLine = insertNewLine(newState);
      setEditorState(newStateWithNewLine);
      return "handled";
    }

    if (blockText.startsWith("* ")) {
      const trimmedText = blockText.replace(/^\*\s*/, "");
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        trimmedText,
        editorState.getCurrentInlineStyle().add("BOLD")
      );

      const newState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const newStateWithNewLine = insertNewLine(newState);
      setEditorState(newStateWithNewLine);
      return "handled";
    }

    if (blockText.startsWith("** ")) {
      const trimmedText = blockText.replace(/^\*\*\s*/, "");
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        trimmedText,
        editorState.getCurrentInlineStyle().add("RED")
      );

      const newState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const newStateWithNewLine = insertNewLine(newState);
      setEditorState(newStateWithNewLine);
      return "handled";
    }

    if (blockText.startsWith("*** ")) {
      const trimmedText = blockText.replace(/^\*\*\*\s*/, "");
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        trimmedText,
        editorState.getCurrentInlineStyle().add("UNDERLINE")
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const newStateWithNewLine = insertNewLine(newState);
      setEditorState(newStateWithNewLine);
      return "handled";
    }

    const newState = insertNewLine(editorState);
    setEditorState(newState);
    return "handled";
  };

  const insertNewLine = (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = Modifier.splitBlock(currentContent, selection);
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "split-block"
    );

    // Reset inline styles for the new line
    const resetEditorState = EditorState.setInlineStyleOverride(
      newEditorState,
      newEditorState.getCurrentInlineStyle().clear()
    );

    return resetEditorState;
  };

  const handleInputChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 13 && hasCommandModifier(e)) {
      // Ctrl+Enter
      return "myeditor-save";
    }
    return getDefaultKeyBinding(e);
  };

  const styleMap = {
    RED: {
      color: "red",
    },
    BOLD: {
      fontWeight: "bold",
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
    "header-one": {
      fontSize: "2em",
      fontWeight: "bold",
    },
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", contentStateJSON);
    alert("Response saved successfully to local storage!");
  };

  return (
    <div>
      <div className="editor-container">
        <header className="App-header">Text Editor Example</header>

        <div className="editor">
          <Editor
            placeholder="Start writing here"
            editorState={editorState}
            onChange={handleInputChange}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
            handleReturn={handleReturn}
            customStyleMap={styleMap}
          />
        </div>
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default MyEditor;
