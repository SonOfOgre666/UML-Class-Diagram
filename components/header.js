document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isSidebarOpen = true;

    sidebarToggle.addEventListener('click', () => {
        isSidebarOpen = !isSidebarOpen;
        sidebar.style.width = isSidebarOpen ? '16rem' : '0'; // Adjust width only
        sidebar.style.visibility = isSidebarOpen ? 'visible' : 'hidden'; // Control visibility
    
        // Adjust main content margin based on sidebar visibility
        const mainContent = document.getElementById('mainContent');
        mainContent.style.marginLeft = isSidebarOpen ? '16rem' : '0'; // Adjust margin
    });
        // Undo/Redo buttons
    document.getElementById('undoButton').addEventListener('click', undo);
    document.getElementById('redoButton').addEventListener('click', redo);

    // Initialize buttons state
    updateUndoRedoButtons();
});


// Function to update the state of the undo/redo buttons
function updateUndoRedoButtons() {
    document.getElementById('undoButton').disabled = undoStack.length === 0;
    document.getElementById('redoButton').disabled = redoStack.length === 0;
}

// Undo function
function undo() {
    if (undoStack.length > 0) {
        const currentState = graph.toJSON();
        redoStack.push(currentState);
        const previousState = undoStack.pop();
        graph.fromJSON(previousState);
        updateUndoRedoButtons();
    }
}

// Redo function
function redo() {
    if (redoStack.length > 0) {
        const currentState = graph.toJSON();
        undoStack.push(currentState);
        const nextState = redoStack.pop();
        graph.fromJSON(nextState);
        updateUndoRedoButtons();
    }
}
