// menu.js

let selectedTournamentData; // Declare data outside the event listener scope

document.addEventListener("DOMContentLoaded", function (event) {
    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000';
    } else {
        url = 'https://nepalscores.herokuapp.com';
    }

    fetch(url + '/api/tournaments')
        .then(response => response.json())
        .then(responseData => {
            tournamentData = responseData; // Assign responseData to the global variable
            var optionsd = tournamentData.map(item => item.title);
            optionsd.reverse(); // New Tournament first
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

    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;
        console.log("Tournament title is ", tournament_title);

        selectedTournamentData = tournamentData.find(item => item.title === tournament_title);

        if (selectedTournamentData) {
            console.log("Selected tournament data:", selectedTournamentData);

            // You can use the tournament data as needed in other parts of your code
        } else {
            console.log("No data found for the selected tournament.");
        }
    });
});