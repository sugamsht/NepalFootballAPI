document.addEventListener("DOMContentLoaded", function (event) {
    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000'
    } else {
        url = 'https://nepalscores.herokuapp.com'
    }
    console.log("This is your live site ", url + '/api/teams');

    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;
        console.log("Tournament title is ", tournament_title);
        document.getElementById('resultTitle').setAttribute('value', tournament_title);
        document.getElementById('teamTitle').setAttribute('value', tournament_title);
        document.getElementById('fixtureTitle').setAttribute('value', tournament_title);
    })

    // function tournament() {

    // }

    fetch(url + '/api/teams')
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

    fetch(url + '/api/fixtures')
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

    fetch(url + '/api/results')
        .then(response => response.json())
        .then(data => {


            options = data.map(item => item.fixtureResult)
            var selectx = document.getElementById("selectResult");

            for (var i = 0; i < options.length; i++) {
                var opt = options[i];

                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;

                selectx.add(el);
            }
        });

    fetch(url + '/api/tournaments')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.title)
            var select = document.getElementById("selectTournament");

            for (var i = 0; i < options.length; i++) {
                var opt = options[i];
                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;

                select.add(el);
            }
        });

});



