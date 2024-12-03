/******************************************
 * CLASS DIALOG FUNCTIONS
 ******************************************/
let selectedCell = null;

const COMMON_TYPES = [
    'int', 'float', 'double', 'String', 'boolean', 'void',
    'char', 'long', 'byte', 'Object', 'List', 'Map', 'Set', 'Array'
];

// Function to show the dialog
function showDialog(cell) {
    selectedCell = cell;
    const dialog = document.getElementById('classDialog');
    const overlay = document.getElementById('dialogOverlay');
    const classNameInput = document.getElementById('className');
    const attributesList = document.getElementById('attributesList');
    const methodsList = document.getElementById('methodsList');

    // Set current class name
    classNameInput.value = cell.get('name') || 'NewClass';

    // Clear and populate attributes
    attributesList.innerHTML = '';
    (cell.get('attributes') || []).forEach(attr => {
        attributesList.appendChild(createAttributeRow(attr));
    });

    // Clear and populate methods
    methodsList.innerHTML = '';
    (cell.get('methods') || []).forEach(method => {
        methodsList.appendChild(createMethodRow(method));
    });

    dialog.style.display = 'block';
    overlay.style.display = 'block';
}

// function to mention where to put the div that created by createAttributeRow()
function addAttribute() {
    document.getElementById('attributesList').appendChild(createAttributeRow());
}

// function to mention where to put the div that created by createMethodRow()
function addMethod() {
    document.getElementById('methodsList').appendChild(createMethodRow());
}

// Create a div that have the structure of Attribute Row 
function createAttributeRow(attr = '') {
    const div = document.createElement('div');
    div.className = 'dialog-row attr-row'; 
    const { visibility, name, type } = parseAttribute(attr);

    div.innerHTML = `
        <select class="attr-visibility">
            <option value="+" ${visibility === '+' ? 'selected' : ''}>+ public</option>
            <option value="-" ${visibility === '-' ? 'selected' : ''}>- private</option>
            <option value="#" ${visibility === '#' ? 'selected' : ''}>⌗ protected</option>
            <option value="~" ${visibility === '~' ? 'selected' : ''}>~ package</option>
        </select>
        <input type="text" class="attr-name" placeholder="name" value="${name}" />
        <select class="attr-type">
            <option value="">Select type</option>
            ${COMMON_TYPES.map(t => 
                `<option value="${t}" ${type === t ? 'selected' : ''}>${t}</option>`
            ).join('')}
        </select>
        <button onclick="removeRow(this)" class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
    `;
    return div;
}

// Create a div that have the structure of Method Row 
function createMethodRow(method = '') {
    const div = document.createElement('div');
    div.className = 'dialog-row';

    const { visibility, name, params, returnType } = parseMethod(method);

    div.innerHTML = `
        <div class="method-row">
            <select class="method-visibility">
                <option value="+" ${visibility === '+' ? 'selected' : ''}>+ public</option>
                <option value="-" ${visibility === '-' ? 'selected' : ''}>- private</option>
                <option value="#" ${visibility === '#' ? 'selected' : ''}>⌗ protected</option>
                <option value="~" ${visibility === '~' ? 'selected' : ''}>~ package</option>
            </select>
            <input type="text" class="method-name" placeholder="name" value="${name}" />
            <div class="params-list">
                ${params.split(',').map(param => createParamRow(param.trim())).join('')}
            </div>
            <button onclick="addParam(this)" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Parameter</button>
            <select class="method-return">
                <option value="">Select return type</option>
                ${COMMON_TYPES.map(t => 
                    `<option value="${t}" ${returnType === t ? 'selected' : ''}>${t}</option>`
                ).join('')}
            </select>
            <button onclick="removeRow(this)" class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
        </div>
    `;
    return div;
}
function createParamRow(param = '') {
    return `
        <div class="param-row flex items-center">
            <input type="text" class="param-name" placeholder="parameter name" value="${param.split(':')[0] || ''}" />
            <select class="param-type">
                <option value="">Select type</option>
                ${COMMON_TYPES.map(t => 
                    `<option value="${t}" ${param.split(':')[1] === t ? 'selected' : ''}>${t}</option>`
                ).join('')}
            </select>
            <button onclick="removeRow(this)" class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
        </div>
    `;
}

// Function to add a parameter row
function addParam(button) {
    const paramsList = button.previousElementSibling; // Get the params list
    paramsList.insertAdjacentHTML('beforeend', createParamRow());
}
// Function to save class details
function saveClassDetails() {
    if (!selectedCell) return;

    const classNameInput = document.getElementById('className').value;

    const attributes = Array.from(document.querySelectorAll('#attributesList > div'))
        .map(div => {
            const visibility = div.querySelector('.attr-visibility').value;
            const name = div.querySelector('.attr-name').value.trim();
            const type = div.querySelector('.attr-type').value.trim();
            if (!name) return null;
            return `${visibility}${name}: ${type}`;
        })
        .filter(attr => attr !== null);

    const methods = Array.from(document.querySelectorAll('#methodsList > div'))
        .map(div => {
            const visibility = div.querySelector('.method-visibility').value;
            const name = div.querySelector('.method-name').value.trim();
            const returnType = div.querySelector('.method-return').value.trim();
            const params = Array.from(div.querySelectorAll('.param-row')).map(paramDiv => {
                const paramName = paramDiv.querySelector('.param-name').value.trim();
                const paramType = paramDiv.querySelector('.param-type').value.trim();
                return `${paramName}: ${paramType}`;
            }).filter(param => param !== '').join(', '); // Join parameters
            if (!name) return null;
            return `${visibility}${name}(${params}): ${returnType}`;
        })
        .filter(method => method !== null);

    selectedCell.set('name', classNameInput);
    selectedCell.set('attributes', attributes);
    selectedCell.set('methods', methods);

    updateClassShape(selectedCell);
    closeDialog();
    saveState();
}
function removeRow(button) {
    button.parentElement.remove();
}

function closeDialog() {
    document.getElementById('classDialog').style.display = 'none';
    document.getElementById('dialogOverlay').style.display = 'none';
    selectedCell = null;
}

function updateClassShape(cell) {
    const name = cell.get('name');
    const attributes = cell.get('attributes') || [];
    const methods = cell.get('methods') || [];

    // Remove the divider line
    const label = [
        name,
        ...attributes,
        ...methods
    ].join('\n');

    cell.attr('text/text', label);
    
    const lineHeight = 20;
    const totalLines = 1 + attributes.length + methods.length;
    cell.resize(180, Math.max(100, lineHeight * totalLines));
}

function parseAttribute(attrString) {
    if (!attrString) return { visibility: '+', name: '', type: '' };
    const visibilityMatch = attrString.match(/^[\+\-#~]/);
    const visibility = visibilityMatch ? visibilityMatch[0] : '+';
    const cleanAttrString = attrString.replace(/^[\+\-#~]/, '').trim();
    const [name, type] = cleanAttrString.split(':').map(s => s.trim());
    return { visibility, name: name || '', type: type || '' };
}

function parseMethod(methodString) {
    if (!methodString) return { visibility: '+', name: '', params: '', returnType: '' };
    const visibilityMatch = methodString.match(/^[\+\-#~]/);
    const visibility = visibilityMatch ? visibilityMatch[0] : '+';
    const cleanMethodString = methodString.replace(/^[\+\-#~]/, '').trim();
    const nameMatch = cleanMethodString.match(/^(.*?)\(/);
    const name = nameMatch ? nameMatch[1].trim() : '';
    const paramsMatch = cleanMethodString.match(/\((.*?)\)/);
    const params = paramsMatch ? paramsMatch[1].trim() : '';
    const returnType = cleanMethodString.split(':')[1]?.trim() || '';
    return { visibility, name, params, returnType };
}
