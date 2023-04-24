
const firstName = "John";

function replaceVariables() {
     // Get the HTML body element
     const body = document.querySelector('body');

     // Get all elements with {{ variable }} inside
     const elements = body.querySelectorAll(':not(script):not(style)');

     // Loop through each element and replace variables
     elements.forEach(element => {
          // Get the HTML content of the element
          const content = element.innerHTML;

          // Use regular expressions to find all instances of {{ variable }}
          const matches = content.match(/{{\s*(\w+)\s*}}/g);

          if (matches == null) return;

          // Replace each instance of {{ variable }} with its corresponding value
          matches.forEach(match => {
               // Get the variable name
               const variable = match.replace('{{', '').replace('}}', '').trim();

               console.log(variable);

               // Get the value of the variable from the global scope
               const value = window[variable];

               // Replace the variable in the HTML content with its value
               const replacedContent = content.replace(match, value);

               // Set the new HTML content of the element
               element.innerHTML = replacedContent;
          });
     });
}

window.onload = function () {
     const body = document.querySelector('body');

     //body.style.display = 'none';

     replaceVariables();
     body.style.display = '';
};










