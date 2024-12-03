function saveState() {
    const currentState = graph.toJSON();
    undoStack.push(currentState);
    redoStack = []; // Clear redo stack when new action is performed
    updateUndoRedoButtons();
}