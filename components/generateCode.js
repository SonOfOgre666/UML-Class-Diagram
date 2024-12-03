    // Add event listener for tab clicks to generate code
    $('a[data-toggle="tab"]').on('click', function () {
        generateCode(); // Call generateCode when a tab is clicked
        printAllElements();
    });
// Function to print all elements in the graph without specifying names
function printAllElements() {
    const elements = graph.getElements(); // Get all elements from the graph
    console.log('All elements in the graph:');
    elements.forEach(element => {
        console.log(element); // Print the entire element object
    });
}

// Call the function to print elements (you can call this wherever appropriate)

function generateCode() {
    const classes = graph.getElements().map(element => {
        if (element.isElement()) {
            const className = element.attributes.name; // Access the name attribute
            const attributes = element.attributes.attributes.join(', ');
            const methods = element.attributes.methods.join(', ');
            
            return {
                className: className,
                attributes: attributes.split(', '),
                methods: methods.split(', ')
            };
        }
        return null;
    }).filter(Boolean);

    // Generate code for each language
    const pythonCode = generatePythonCode(classes);
    const javaCode = generateJavaCode(classes);
    const phpCode = generatePhpCode(classes);

    // Display the generated code in the appropriate tab
    document.getElementById('python-code').innerText = pythonCode;
    document.getElementById('java-code').innerText = javaCode;
    document.getElementById('php-code').innerText = phpCode;
}

function generatePythonCode(classes) {
    return classes.map(cls => {
        // Process attributes: Add a space before the attribute and ensure proper formatting
        const attributes = cls.attributes
            .map(attr => ` ${attr.replace(/^[-+~#]/, '').trim()} = None`) // Add a space before the attribute
            .join('\n');

        // Process methods: Ensure method names are captured correctly
        const methods = cls.methods
            .map(method => {
                const cleanMethod = method.replace(/^[-+~#]/, '').trim(); // Clean the method name
                return `    def ${cleanMethod}(self) -> None:\n        pass`; // Add a space before the method
            })
            .join('\n\n');

        // Combine attributes and methods, ensuring at least a `pass` statement if the class is empty
        const classBody = [attributes, methods].filter(section => section.trim()).join('\n\n');
        return `class ${cls.className}:\n${classBody || '    pass'}`; // Ensure proper indentation
    }).join('\n\n');
}



function generateJavaCode(classes) {
    return classes.map(cls => {
        const attributes = cls.attributes.map(attr => `    private String ${attr};`).join('\n');
        const methods = cls.methods.map(method => `    public void ${method}() { }\n`).join('\n');
        return `public class ${cls.className} {\n${attributes}\n\n${methods}\n}`;
    }).join('\n\n');
}

function generatePhpCode(classes) {
    return classes.map(cls => {
        const attributes = cls.attributes.map(attr => `    private $${attr};`).join('\n');
        const methods = cls.methods.map(method => `    public function ${method}() { }\n`).join('\n');
        return `class ${cls.className} {\n${attributes}\n\n${methods}\n}`;
    }).join('\n\n');
}

