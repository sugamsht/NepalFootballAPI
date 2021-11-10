

document.addEventListener("DOMContentLoaded", function (event) {
    var options = []
    fetch('http://localhost:3000/api/test')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.team_name)
            var select = document.getElementById("selectTeam");
            // var options = ["1", "2", "3", "4", "5"];

            for (var i = 0; i < options.length; i++) {
                var opt = options[i];

                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;

                select.add(el);
            }
        });

    document.getElementById('yolo').innerHTML = "New text!";

});



