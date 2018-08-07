class AllData {
	constructor () {
		this.allData = JSON.parse(localStorage.getItem("quizData"));
	}
	getSingleUserData (email) {
		return this.allData[email];
	}
}
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

function getEmailfromURL() {
	let email = location.search.substring(1).split("=");
	return email[1];

}

var alldata = new AllData();
var table = new Table();

table.createTableBody();
