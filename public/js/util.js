// util.js
function createOptions(selectedData, selectElementId, property) {
    var select = document.getElementById(selectElementId);
    removeOptions(select); // Clear existing options

    // Your logic to create and add options based on selectedData
    selectedData.forEach(item => {
        var option = document.createElement("option");
        option.text = item[property];
        option.value = item[property];
        select.add(option);
    });
}

function removeOptions(selectElement) {
    // Your logic to remove options from the select element
    while (selectElement.options.length > 0) {
        selectElement.remove(0);
    }
}
