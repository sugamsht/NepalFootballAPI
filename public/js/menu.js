document.addEventListener("DOMContentLoaded", function (event) {
    const url = window.location.origin;
    let tournamentData;
    let selectedTournamentData;

    fetch(`${url}/api/tournaments`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            tournamentData = responseData.data; // Access the 'data' property

            const selectTournament = document.getElementById("selectTournament");
            tournamentData.forEach(tournament => {
                const option = document.createElement("option");
                option.value = tournament.title;
                option.text = tournament.title;
                selectTournament.appendChild(option);
            });

            if (tournamentData.length > 0) {
                selectTournament.value = tournamentData[0].title;
                document.getElementById('titleButton').click(); // Trigger initial data load
            }
        })
        .catch(error => {
            console.error('Error fetching tournaments:', error);
            const selectTournament = document.getElementById("selectTournament");
            const errorOption = document.createElement("option");
            errorOption.text = "Error loading tournaments";
            errorOption.disabled = true;
            selectTournament.appendChild(errorOption);
        });

    document.getElementById('titleButton').addEventListener('click', function (e) {
        const selectedTournamentTitle = document.getElementById("selectTournament").value;

        selectedTournamentData = tournamentData.find(item => item.title === selectedTournamentTitle);

        if (selectedTournamentData) {
            console.log("Selected tournament data:", selectedTournamentData);

            // Now you have the selectedTournamentData.  Use it as needed.
            // Example: Display fixtures for the selected tournament
            displayFixtures(selectedTournamentData.fixtureList);

            // Example: Display teams for the selected tournament
            displayTeams(selectedTournamentData.teamList);

            // Example: Display results for the selected tournament
            displayResults(selectedTournamentData.resultList);
        } else {
            console.log("No data found for the selected tournament.");
        }
    });

    // Example functions to display data (you'll need to implement these)
    function displayFixtures(fixtures) {
        // Implement logic to display fixtures in your UI
        console.log("Fixtures:", fixtures); // Placeholder
        // ... (Code to update the DOM with fixture data)
    }

    function displayTeams(teams) {
        // Implement logic to display teams in your UI
        console.log("Teams:", teams); // Placeholder
        // ... (Code to update the DOM with team data)
    }

    function displayResults(results) {
        // Implement logic to display results in your UI
        console.log("Results:", results); // Placeholder
        // ... (Code to update the DOM with result data)
    }
});