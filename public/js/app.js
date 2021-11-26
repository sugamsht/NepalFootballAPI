
document.addEventListener("DOMContentLoaded", function (event) {
    fetch('http://localhost:3000/api/teams')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.name)
            var select = document.getElementById("selectTeam");
            var select1 = document.getElementById("selectTeam1");
            var select2 = document.getElementById("selectTeam2");
            // var options = ["1", "2", "3", "4", "5"];

            for (var i = 0; i < options.length; i++) {
                var opt = options[i];

                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;

                var el1 = document.createElement("option");
                el1.text = opt;
                el1.value = opt;

                var el2 = document.createElement("option");
                el2.text = opt;
                el2.value = opt;

                select.add(el);
                select1.add(el1);
                select2.add(el2);

            }
        });

    fetch('http://localhost:3000/api/fixtures')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.fixname)
            var select = document.getElementById("selectFixture");
            var select1 = document.getElementById("selectFixture1");

            for (var i = 0; i < options.length; i++) {
                var opt = options[i];

                var el = document.createElement("option");
                var el1 = document.createElement("option");

                el.text = opt;
                el.value = opt;

                select.add(el);


                el1.text = opt;
                el1.value = opt;

                select1.add(el1);
            }

            // optioon = data.map(item => item.date)
            // var seelect = document.getElementById("selectdate");
            // for (var j = 0; j < optioon.length; j++) {
            //     var op = optioon[j];
            //     var el2 = document.createTextNode(optioon);
            //     el2.text = op;
            //     el2.value = op;
            //     seelect.add(el2);

            // }
        });

    fetch('http://localhost:3000/api/results')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.fixtureResult)
            var selectx = document.getElementById("selectResult");

            for (var i = 0; i< options.length; i++){
                var opt = options[i];

                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;

                selectx.add(el);
            }
        });

});



