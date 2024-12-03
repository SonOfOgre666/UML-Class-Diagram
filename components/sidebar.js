document.addEventListener('DOMContentLoaded', () => {
    const stencilItems = document.querySelectorAll('.stencil-item');
    stencilItems.forEach(item => {
        item.addEventListener('click', handleClick);
        item.addEventListener('dragstart', handleDragStart);
        item.setAttribute('draggable', 'true');
    });
});

// Click handler
function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const type = e.currentTarget.getAttribute('data-type');
    console.log('Clicked type:', type);
    
    if (type === 'class') {
        const position = {
            x: CLICK_OFFSET.x + (clickCount * 20),
            y: CLICK_OFFSET.y + (clickCount * 20)
        };
        createClass(position);
        clickCount = (clickCount + 1) % 10;
    } else if (['association', 'directional-association', 'bidirectional-association', 'aggregation', 'composition', 'generalization', 'realization', 'dependency'].includes(type)) {
        startDrawingRelationship(type); // Start drawing relationship
    }
}

// Drag handlers
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-type'));
}

// Function to create a class
function createClass(position) {
    const className = `NewClass${classCounter++}`;  // Generate new name and increment counter
    const classShape = new joint.shapes.uml.Class({
        position: position,
        size: { width: 180, height: 100 },
        attrs: {
            rect: { fill: '#FFFFFF', stroke: '#000000', 'stroke-width': 2 },
            text: { text: className, fill: '#000000', 'font-size': 14 }
        },
        name: className,
        attributes: [],
        methods: []
    });
    graph.addCell(classShape);
    saveState();
    return classShape;
}

/******************************************
 * RELATIONSHIP FUNCTIONS
 ******************************************/

function startDrawingRelationship(type) {
    relationshipType = type; // Ensure this line is present
    console.log('Starting to draw relationship:', type); // Debug log
    const buttons = document.querySelectorAll('.stencil-item[data-type="association"], .stencil-item[data-type="directional-association"], .stencil-item[data-type="bidirectional-association"], .stencil-item[data-type="aggregation"], .stencil-item[data-type="composition"], .stencil-item[data-type="generalization"], .stencil-item[data-type="realization"], .stencil-item[data-type="dependency"]');
    
    if (currentRelationshipType === type) {
        // Cancel drawing
        console.log('Canceling relationship drawing:', type);
        resetDrawingState();
        buttons.forEach(button => button.classList.remove('button-active'));
        removeHoverEffects(); // Remove hover effects
    } else {
        // Start drawing
        isDrawingRelationship = true;
        currentRelationshipType = type;
        paper.el.style.cursor = 'crosshair';
        buttons.forEach(button => {
            if (button.getAttribute('data-type') === type) {
                button.classList.add('button-active');
            } else {
                button.classList.remove('button-active');
            }
        });
        addHoverEffects(); // Add hover effects
    }
}

// Function to add hover effects
function addHoverEffects() {
    paper.on('element:mouseover', function(elementView) {
        if (isDrawingRelationship && sourceElement && elementView.model !== sourceElement) {
            elementView.model.attr('rect/stroke', '#00ff00'); // Change to green on hover
            elementView.model.attr('rect/stroke-width', 3);
        }
    });

    paper.on('element:mouseout', function(elementView) {
        if (isDrawingRelationship && elementView.model !== sourceElement) {
            elementView.model.attr('rect/stroke', '#000000'); // Reset to default color
            elementView.model.attr('rect/stroke-width', 2);
        }
    });
}

// Function to remove hover effects
function removeHoverEffects() {
    paper.off('element:mouseover');
    paper.off('element:mouseout');
}

function createRelationship(source, target, type) {
    console.log('Creating relationship:', type, 'from', source.id, 'to', target.id);
    
    if (!type) {
        console.error('Relationship type is null. Cannot create relationship.');
        return; // Exit if type is null
    }

    let link;
    const commonAttributes = {
        source: { id: source.id },
        target: { id: target.id },
        router: { name: 'manhattan' },
        connector: { name: 'rounded' }
    };

    switch (type) {
        case 'association':
            link = new joint.shapes.standard.Link({
                ...commonAttributes,
                attrs: {
                    line: {
                        stroke: '#0000FF', // Blue color for association
                        'stroke-width': 3,
                        targetMarker: {
                            'type': 'none' // No arrowhead for association
                        }                    },
                    label: {
                        text: type, // Add relationship type as label
                        fill: 'black',
                        'font-size': 12,
                        'ref-x': 0.5,
                        'ref-y': 0.5,
                        'ref': 'source', // Position the label at the source
                        'y-alignment': 'middle',
                        'x-alignment': 'middle'
                    }
                }
            });
            break; 
            case 'directional-association':
                link = new joint.shapes.standard.Link({
                    ...commonAttributes,
                    attrs: {
                        line: {
                            stroke: '#0000FF', // Blue color for directional association
                            'stroke-width': 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 15 -8 L 0 0 L 15 8', // Arrow shape for directional association
                                'fill': 'none',
                                'stroke': '#0000FF',
                                'stroke-width': 2
                            }
                        },
                        label: {
                            text: type, // Add relationship type as label
                            fill: 'black',
                            'font-size': 12,
                            'ref-x': 0.5,
                            'ref-y': 0.5,
                            'ref': 'source', // Position the label at the source
                            'y-alignment': 'middle',
                            'x-alignment': 'middle'
                        }
                    }
                });
                break;
    
            case 'bidirectional-association':
                link = new joint.shapes.standard.Link({
                    ...commonAttributes,
                    attrs: {
                        line: {
                            stroke: '#0000FF', // Blue color for bidirectional association
                            'stroke-width': 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 15 -8 L 0 0 L 15 8', // Arrow shape for one direction
                                'fill': 'none',
                                'stroke': '#0000FF',
                                'stroke-width': 2
                            },
                            sourceMarker: {
                                'type': 'path',
                                'd': 'M 15 -8 L 0 0 L 15 8', // Arrow shape for the opposite direction
                                'fill': 'none',
                                'stroke': '#0000FF',
                                'stroke-width': 2
                            }
                        },
                        label: {
                            text: type, // Add relationship type as label
                            fill: 'black',
                            'font-size': 12,
                            'ref-x': 0.5,
                            'ref-y': 0.5,
                            'ref': 'source', // Position the label at the source
                            'y-alignment': 'middle',
                            'x-alignment': 'middle'
                        }
                    }
                });
                break; 

        case 'aggregation':
            link = new joint.shapes.standard.Link({
                ...commonAttributes,
                attrs: {
                    line: {
                        stroke: '#0000FF', // Orange color for aggregation
                        'stroke-width': 2,
                        targetMarker: {
                            'type': 'path',
                            'd': 'M 15 -8 0 0 15 8 30 0 z', // Larger diamond shape for aggregation
                            'fill': 'white',
                            'ref': 'target', // Reference to target to align the marker
                            'ref-x': 0.5,    // Center the marker horizontally
                            'ref-y': 0.5     // Center the marker vertically
                        }
                    },
                    label: {
                        text: type, // Add relationship type as label
                        fill: 'black',
                        'font-size': 12,
                        'ref-x': 0.5,
                        'ref-y': 0.5,
                        'ref': 'source', // Position the label at the source
                        'y-alignment': 'middle',
                        'x-alignment': 'middle'
                    }
                }
            });
            break;

        case 'composition':
            link = new joint.shapes.standard.Link({
                ...commonAttributes,
                attrs: {
                    line: {
                        stroke: '#0000FF', // Red color for composition
                        'stroke-width': 2,
                        targetMarker: {
                            'type': 'path',
                            'd': 'M 15 -8 0 0 15 8 30 0 z', // Larger diamond shape for aggregation
                            'fill': '#0000FF'
                        }
                    },
                    label: {
                        text: type, // Add relationship type as label
                        fill: 'black',
                        'font-size': 12,
                        'ref-x': 0.5,
                        'ref-y': 0.5,
                        'ref': 'source', // Position the label at the source
                        'y-alignment': 'middle',
                        'x-alignment': 'middle'
                    }
                }
            });
            break;

        case 'generalization':
            link = new joint.shapes.standard.Link({
                ...commonAttributes,
                attrs: {
                    line: {
                        stroke: '#0000FF', // Blue color for generalization
                        'stroke-width': 2,
                        targetMarker: {
                            'type': 'path',
                            'd': 'M 0 0 L 20 -10 L 20 10 z', // Inverted triangle for generalization
                            'fill': 'white'
                        }
                    },
                    label: {
                        text: type, // Add relationship type as label
                        fill: 'black',
                        'font-size': 12,
                        'ref-x': 0.5,
                        'ref-y': 0.5,
                        'ref': 'source', // Position the label at the source
                        'y-alignment': 'middle',
                        'x-alignment': 'middle'
                    }
                }
            });
            break;

        case 'realization':
            link = new joint.shapes.standard.Link({
                ...commonAttributes,
                attrs: {
                    line: {
                        stroke: '#0000FF', // Blue color for realization
                        'stroke-width': 3,
                        'stroke-dasharray': '5,5', // Dashed line for realization
                        targetMarker: {
                            'type': 'path',
                            'd': 'M 0 0 L 20 -10 L 20 10 z', // Triangle for realization
                            'fill': '#0000FF'
                        }
                    },
                    label: {
                        text: type,
                        'font-size': 12,
                        'ref-x': 0.5,
                        'ref-y': 0.5,
                        'ref': 'source',
                        'y-alignment': 'middle',
                        'x-alignment': 'middle'
                    }
                }
            });
            break;

            // ... existing code ...
            case 'dependency':
                link = new joint.shapes.standard.Link({
                    ...commonAttributes,
                    attrs: {
                        line: {
                            stroke: '#0000FF', // Black color for dependency
                            'stroke-width': 3,
                            'stroke-dasharray': '5 5', // Dashed line
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 15 -8 L 0 0 L 15 8 ', // '>' shape
                                'fill': 'none',
                                'stroke': '#0000FF',
                                'stroke-width': 3
                            }
                        },
                        label: {
                            text: "type", // Add relationship type as label
                            fill: 'black',
                            'font-size': 12,
                            'ref-x': 0.5,
                            'ref-y': 0.5,
                            'ref': 'source', // Position the label at the source
                            'y-alignment': 'middle',
                            'x-alignment': 'middle'
                        }
                        },
                });
                break;          
        }
    if (link) {
        graph.addCell(link);
        saveState();
        return link;
    }
}