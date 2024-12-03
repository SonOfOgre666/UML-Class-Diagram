let currentRelationshipType = null; // Holds the current relationship type
let isDrawingRelationship = false; // Indicates if a relationship is being drawn
let sourceElement = null; // The source element for the relationship
let classCounter = 1; // Counter for class names
let tempLink = null; // Temporary link for drawing
let relationshipType = null; // Stores the current relationship type
let undoStack = []; // Stack for undo functionality
let redoStack = []; // Stack for redo functionality