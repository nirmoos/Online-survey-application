/**
 *This class, when created read all quiz data from the local storage.
 *@param allData- All quiz data from the local storage.
 *
 *It also perform some functions for createing and returning objects for
 *table population and graph simulations.
 */

class AllData {
	constructor () {
		this.allData = JSON.parse(localStorage.getItem("quizData"));
	}

	/**
	 *@arg email- email of the last submitted user that parsed from the URL.
	 *
	 *It returns the details of a particular user.
	 *
	 */
	getSingleUserData (email) {
		return this.allData[email];
	}

	/**
	 *It is especially for showing graph of users with individual scores.
	 *
	 *It returns an object in a form corresponds to 'value' of 'data' key for
	 *the char.js constructor.
	 *
	 */
	getIndividualDatasetAsObjects () {

        let backgroundColor = "rgba(0, 204, 204, 0.5)";
        let borderColor = "rgba(0, 77, 77, 0.7)";

        let labels = [];
        let datasets = {
            "label": "# of individual scores",
            "data": [],
            "backgroundColor": [],
            "borderColor": [],
            "borderWidth": 1
        }
        for (let x in this.allData) {
            labels.push(this.allData[x]["name"]);
            datasets["backgroundColor"].push(backgroundColor);
            datasets["borderColor"].push(borderColor);
            let total = 0;
            for (let user of this.allData[x]["performance"]) {
                total += user["score"] != "null" ? parseInt(user["score"]) : 0;
            }
            datasets["data"].push(total);
        }

        return {
            "labels": labels,
            "datasets": [datasets],
        }
    }

	/**
	 *It is especially for showing graph of score percentile.
	 *
	 *It returns an object in a form corresponds to 'value' of 'data' key for
	 *the char.js constructor.
	 *
	 */
	getScorePercentile() {
		let backgroundColor = "rgba(0, 204, 204, 0.5)";
		let borderColor = "rgba(0, 77, 77, 0.7)";

		let labels = ["15-20", "10-14", "5-9", "0-4"];
		let datasets = {
			"label": "# score percentile",
			"data": [],
			"backgroundColor": [
				backgroundColor,
				backgroundColor,
				backgroundColor,
				backgroundColor
			],
			"borderColor": [
				borderColor,
				borderColor,
				borderColor,
				borderColor
			],
			"borderWidth": 1
		}

		let totalArray = [];
		for (let x in this.allData) {
			let total = 0;
			for (let user of this.allData[x]["performance"]) {
				total += user["score"] != "null" ? parseInt(user["score"]) : 0;
			}
			totalArray.push(total);
		}
		datasets["data"].push(totalArray.filter(isGreaterThan(15)).length);
		datasets["data"].push(totalArray.filter(isGreaterThan(10)).length);
		datasets["data"].push(totalArray.filter(isGreaterThan(5)).length);
		datasets["data"].push(totalArray.filter(isGreaterThan(0)).length);

		function isGreaterThan(limit) {
			return function (element) {
				return (element >= limit) && (element < (limit+5 == 20 ? 21 : limit+5));
			}
		}

		return {
			"labels": labels,
			"datasets": [datasets],
		}
	}
}

/**
 *This class is for table body creation.
 *
 *@param dataSet- Datas of a particular user whose emailid is parsed
 *from the URL.
 *
 */
class Table {
	constructor () {
		this.dataSet = alldata.getSingleUserData(getEmailfromURL());
	}

	createTableBody () {
		let tbody, tr;

		tbody = $("tbody");
		for (let question of this.dataSet["performance"]) {
			tr = $("<tr></tr>");
			for (let name in question)
				tr.append($("<td></td>").text(question[name]));

			tbody.append(tr);
		}
	}
}

//This function just parse the email from the URL.
function getEmailfromURL() {
	let email = location.search.substring(1).split("=");
	return email[1];

}

var alldata = new AllData();
var table = new Table();

table.createTableBody();

//Creation of graph of users with individual scores.
var ctx1 = document.getElementById("myChart1").getContext('2d');
var myChart1 = new Chart(ctx1, {
    type: 'bar',
    data: alldata.getIndividualDatasetAsObjects(),
});

//Creation of graph of score percentile.
var ctx2 = document.getElementById("myChart2").getContext('2d');
var myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: alldata.getScorePercentile(),
});

//Event listener for button.
//The graphs are actually hidden until the button click.
$(".button-for-canvas").click(function () {
	$(".button-container").hide();
	$(".result-block").slideUp();
	$(".canvas-wrapper").css("display", "flex");
});
