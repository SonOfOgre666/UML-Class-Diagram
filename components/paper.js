/******************************************
 * INITIALIZATION AND CONFIGURATION
 ******************************************/
// Initialize the graph
const graph = new joint.dia.Graph();

// Define constants for click offset and click count
const CLICK_OFFSET = { x: 50, y: 50 };
let clickCount = 0;

// Initialize the paper with configuration options
const paper = new joint.dia.Paper({
    el: document.getElementById('graph'), // DOM element for the paper
    model: graph, // The graph model
    width: 800, // Width of the paper
    height: 600, // Height of the paper
    gridSize: 10, // Size of the grid
    drawGrid: true, // Enable grid drawing
    background: {
        color: 'rgba(0, 0, 0, 0.1)' // Background color
    },
    interactive: true // Enable interactivity
});

/******************************************
 * EVENT HANDLERS
 ******************************************/
// Replace the cell:pointerclick handler with cell:pointerdblclick
paper.off('cell:pointerclick'); // Remove the old click handler
paper.on('cell:pointerdblclick', function(cellView, evt, x, y) {
    const cell = cellView.model; // Get the clicked cell model
    if (cell.isElement()) {
        showDialog(cell); // Show dialog for the element
    }
});

// Mouse event handlers for drawing relationships
paper.on('blank:pointerdown', function() {
    if (isDrawingRelationship) {
        // Set the cursor style to '+'
        paper.el.style.cursor = 'crosshair';
    }
});

paper.on('blank:pointerup', function() {
    // Reset the cursor style to default
    paper.el.style.cursor = 'default';
});

// Function to reset drawing state and remove active class from buttons
function resetDrawingState() {
    isDrawingRelationship = false;
    relationshipType = null;
    sourceElement = null;
    paper.el.style.cursor = 'default';
    
    const buttons = document.querySelectorAll('.stencil-item[data-type="aggregation"], .stencil-item[data-type="composition"], .stencil-item[data-type="generalization"]');
    buttons.forEach(button => button.classList.remove('button-active'));
}

// Mouse event handlers for drawing relationships
paper.on('element:pointerup', function(elementView, evt) {
    console.log('Element pointerup', isDrawingRelationship, sourceElement);
    if (isDrawingRelationship && sourceElement && elementView.model !== sourceElement) {
        const targetElement = elementView.model;
        
        // Validate target element
        if (!targetElement.isElement()) {
            console.error('Invalid target element for association');
            return;
        }

        console.log('Target element selected:', targetElement.id);
        createRelationship(sourceElement, targetElement, relationshipType);
        
        // Reset drawing state
        resetDrawingState();
    }
});

// Mouse event handlers for drawing relationships
paper.on('element:pointerdown', function(elementView, evt) {
    console.log('Element pointerdown', isDrawingRelationship, sourceElement);
    console.log('Element clicked:', elementView.model.id); // Log the clicked element ID
    if (isDrawingRelationship) {
        if (!sourceElement) {
            sourceElement = elementView.model; // Set source element
            console.log('Source element selected:', sourceElement.id);
            paper.el.style.cursor = 'crosshair';
        } else if (sourceElement && elementView.model !== sourceElement) {
            const targetElement = elementView.model; // Set target element
            
            // Validate target element
            if (!targetElement.isElement()) {
                console.error('Invalid target element for association');
                return;
            }

            console.log('Target element selected:', targetElement.id);
            console.log('Current relationship type:', relationshipType); // Debugging output
            createRelationship(sourceElement, targetElement, relationshipType);
                        
            // Reset drawing state
            resetDrawingState();
        }
    }
});

// Mouse event handlers for drawing relationships
paper.on('element:mouseover', function(elementView, evt) {
    console.log('Element mouseover:', elementView.model.id); // Log the element being hovered over
    if (isDrawingRelationship && sourceElement && elementView.model !== sourceElement) {
        // Ensure elementView is defined and is a valid element
        if (elementView && elementView.model.isElement()) {
            console.log('Changing border color to green for:', elementView.model.id); // Log the change
            elementView.model.attr('rect/stroke', '#00ff00'); // Change to green on hover
            elementView.model.attr('rect/stroke-width', 3);
            console.log('New attributes:', elementView.model.attributes); // Log new attributes
        } else {
            console.error('elementView is not valid or not an element');
        }
    }
});

paper.on('element:mouseout', function(elementView, evt) {
    console.log('Element mouseout:', elementView.model.id); // Log the element being hovered out
    if (isDrawingRelationship && elementView.model !== sourceElement) {
        // Ensure elementView is defined and is a valid element
        if (elementView && elementView.model.isElement()) {
            console.log('Resetting border color for:', elementView.model.id); // Log the reset
            elementView.model.attr('rect/stroke', '#000000'); // Reset to default color
            elementView.model.attr('rect/stroke-width', 2);
            console.log('New attributes after reset:', elementView.model.attributes); // Log new attributes
        } else {
            console.error('elementView is not valid or not an element');
        }
    }
});

// Keyboard events
document.addEventListener('keydown', function(evt) {
    if (evt.key === 'Escape' && isDrawingRelationship) {
        console.log('Canceling relationship drawing (Escape key)');
        resetDrawingState(); // Reset drawing state on Escape
    }
});