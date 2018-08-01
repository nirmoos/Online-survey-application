class Table {
	constructor () {
		this.dataSet = JSON.parse(localStorage.getItem("Questionare"));
	}

	createTableBody () {
		let tbody, tr;

		tbody = $("tbody");
		for (let question of this.dataSet) {
			tr = $("<tr></tr>");
			for (let name in question) 
				tr.append($("<td></td>").text(question[name]));

			tbody.append(tr);
		}
	}
}
var table = new Table();
table.createTableBody();