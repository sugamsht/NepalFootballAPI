document.addEventListener("DOMContentLoaded", function (event) {
    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;

        var selectedTournamentData = tournamentData.find(item => item.title === tournament_title);
        console.log("Selected Tournament is ", selectedTournamentData);

        if (selectedTournamentData) {
            console.log("Selected tournament data:", selectedTournamentData);

            // Set value attribute for specific elements
            document.getElementById('resultTitle').setAttribute('value', tournament_title);
            document.getElementById('teamTitle').setAttribute('value', tournament_title);
            document.getElementById('fixtureTitle').setAttribute('value', tournament_title);
            document.getElementById('tournament_title').setAttribute('value', tournament_title);

            // Call createOptions for different select elements with specific properties
            createOptions(selectedTournamentData.teamList, "selectTeam", "name");
            createOptions(selectedTournamentData.teamList, "selectTeam1", "name");
            createOptions(selectedTournamentData.teamList, "selectTeam2", "name");
            createOptions(selectedTournamentData.fixtureList, "selectFixture", "fixname");
            createOptions(selectedTournamentData.fixtureList, "selectFixture1", "fixname");
            createOptions(selectedTournamentData.resultList, "selectResult", "fixtureResult");
        } else {
            console.log("No data found for the selected tournament.");
        }
    });
});