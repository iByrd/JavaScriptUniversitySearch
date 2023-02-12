const queryFields =
    'school.name,school.city,school.state,id,latest.student.size,latest.student.demographics.men,latest.student.demographics.women,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state';
const myKey = '';
let table;
let formattedInput = '';

$(document).ready(function () {
    'use strict';
    // build empty table when page loads
    table = $('#table').DataTable();

    // Add event lister for submit button
    $('#submit').click(() => validateAndPrepareInput());
    
    // event lister for Enter press in search field
    $('#search').keypress(function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('submit').click();
        }
    })

    // event lister that shows additional row details
    showDetails();
});

function validateAndPrepareInput() {
    // get user input
    let userInput = document.getElementById('search').value;

    // validation time - setup some regular expressions
    const regex = /^[\w\-\s]*$/;
    const regexBlank = /^\s*$/;
    // check for alphanumeric,space, or - only
    if (!regex.test(userInput)) {
        alert('Please use alphanumeric characters only');
        return;
    }
    // restrict length
    if (userInput.length > 50) {
        alert('Please limit search to 50 characters');
        return;
    }
    // check for no input or blank space only
    if (userInput.length == 0 || regexBlank.test(userInput)) {
        alert('Please enter a university name');
        return;
    }

    // prep user input for ajax query string
    userInput = userInput.trim();
    let inputArray = userInput.split(' ');

    // build input for valid query
    formattedInput = '';
    inputArray.forEach((element, index) => {
        if (index == inputArray.length - 1) {
            // end of array, dont add the html space
            formattedInput = formattedInput + element;
        } else {
            // not end, add html space encoding
            formattedInput = formattedInput + element + '%20';
        }
    });
    // now input is valid, build table
    buildTable();
}

function buildTable() {
    $('#table').DataTable().destroy();
    table = $('#table').DataTable({
        // use datatable to make ajax request
        ajax: {
            url: `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${formattedInput}&per_page=50&_fields=${queryFields}&api_key=${myKey}`,
            dataSrc: 'results',
            cache: true,
        },
        columns: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: '',
            },
            { data: 'school\\.name' },
            { data: 'school\\.city' },
            { data: 'school\\.state' },
        ],
    });
}

// Add event listener for opening and closing details
// CITATION - this method is from the DataTables website
// @ https://datatables.net/examples/api/row_details.html
function showDetails() {
    $('#table tbody').on('click', 'td.dt-control', function () {
        let tr = $(this).closest('tr');
        let row = table.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        } else {
            // Open this row
            row.child(formatRowDetails(row.data())).show();
            tr.addClass('shown');
        }
    });
}

// adds additional details when row is clicked
function formatRowDetails(rowDetails) {
    return `<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">
                <tr>
                    <td>ID: </td>
                    <td>${rowDetails.id}</td>
                </tr> 
                <tr>
                    <td>Undergrads Enrolled: </td>
                    <td>${rowDetails['latest.student.size']}</td>
                </tr>
                <tr>
                    <td>Male: </td>
                    <td>${rowDetails['latest.student.demographics.men']}</td>
                </tr>
                <tr>
                    <td>Female: </td>
                    <td>${rowDetails['latest.student.demographics.women']}</td>
                </tr>
                <tr>
                    <td>In-State Tuition: </td>
                    <td>${rowDetails['latest.cost.tuition.in_state']}</td>
                </tr>
                <tr>
                    <td>Out-of-State Tuition: </td>
                    <td>${rowDetails['latest.cost.tuition.out_of_state']}</td>
                </tr>
            </table>`;
};