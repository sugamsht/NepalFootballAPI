let data; // Declare data outside the event listener scope

document.addEventListener("DOMContentLoaded", function (event) {
    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000';
    } else {
        url = 'https://nepalscores.herokuapp.com';
    }
    console.log("This is your live site ", url + '/api/teams');

    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;
        console.log("Tournament title is ", tournament_title);
        document.getElementById('resultTitle').setAttribute('value', tournament_title);
        document.getElementById('teamTitle').setAttribute('value', tournament_title);
        document.getElementById('fixtureTitle').setAttribute('value', tournament_title);
        document.getElementById('tournament_title').setAttribute('value', tournament_title);

        // Loop through data object to find a match for tournament_title
        var selectedTournamentData = data.find(item => item.title === tournament_title);

        if (selectedTournamentData) {
            // Use selectedTournamentData for further processing
            console.log("Selected tournament data:", selectedTournamentData);

            // Access properties like selectedTournamentData.resultList, selectedTournamentData.fixtureList, etc.
            // ...

            // Create options for select elements similar to your previous code
            createOptions(selectedTournamentData);
        } else {
            console.log("No data found for the selected tournament.");
        }
    });

    function createOptions(selectedData) {
        // Assuming your select elements have IDs: selectTeam, selectTeam1, selectTeam2, etc.
        var select = document.getElementById("selectTeam");
        var select1 = document.getElementById("selectTeam1");
        var select2 = document.getElementById("selectTeam2");

        var selectf1 = document.getElementById("selectFixture");
        var selectf2 = document.getElementById("selectFixture1");

        var selectr = document.getElementById("selectResult");

        // Remove existing options
        removeOptions(select);
        removeOptions(select1);
        removeOptions(select2);
        removeOptions(selectf1);
        removeOptions(selectf2);
        removeOptions(selectr);

        // Create options based on the selected data
        var opt2 = selectedData.resultList.map(item2 => item2.fixtureResult);
        console.log("This is your result list ", opt2);
        for (var i = 0; i < opt2.length; i++) {
            var opt = opt2[i];
            var el = document.createElement("option");
            el.text = opt;
            el.value = opt;
            selectr.add(el);
        }

        var opt1 = selectedData.fixtureList.map(item1 => item1.fixname);
        console.log("This is your fixture list ", opt1);
        for (var i = 0; i < opt1.length; i++) {
            var opt = opt1[i];
            var el = document.createElement("option");
            var el1 = document.createElement("option");
            el.text = opt;
            el.value = opt;
            selectf1.add(el);
            el1.text = opt;
            el1.value = opt;
            selectf2.add(el1);
        }

        var opt = selectedData.teamList.map(item => item?.name);
        console.log("This is the team list ", opt);
        for (var i = 0; i < opt.length; i++) {
            var option = opt[i];
            var el = document.createElement("option");
            var el1 = document.createElement("option");
            var el2 = document.createElement("option");
            el.text = option;
            el.value = option;
            select.add(el);
            el1.text = option;
            el1.value = option;
            select1.add(el1);
            el2.text = option;
            el2.value = option;
            select2.add(el2);
        }
    }

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    fetch(url + '/api/tournaments')
        .then(response => response.json())
        .then(responseData => {
            data = responseData; // Assign responseData to the global data variable
            var optionsd = data.map(item => item.title);
            optionsd.reverse(); //New Tournament first
            var select0 = document.getElementById("selectTournament");


            console.log("This is your data ", optionsd);

            for (var i = 0; i < optionsd.length; i++) {
                var opt = optionsd[i];
                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;
                select0.add(el);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});
