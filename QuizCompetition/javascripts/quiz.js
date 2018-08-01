class Answer {

	constructor (ans) {
		this.id = ans["id"];
		this.title = ans["title"];
		this.isCorrect = ans["correct"];
		this.score = ans["score"];
	}

	title () { return this.title; }

	isCorrect () { return this.isCorrect; }

	score () { return this.score; }
}

class Question {

	constructor (qn) {
		this.id = qn["id"];
		this.title = qn["title"];
		this.answers = [];

		for (let ans of qn["answers"]) {
			let a = new Answer(ans);
			this.answers.push(a);
		}
	}

	getQuestion () { return this.title; }

	getAnswers () {
		let ansArray = [];
		for (let x of this.answers)
			ansArray.push(x.title);

		return ansArray;
	}

	isAnswerCorrect (index) { return this.answers[index].isCorrect; }

	answerScore (index) { return this.answers[index].score; }
}

class LocalStorage {

	constructor () { this.allDetails = []; }

	insertDetail (obj, index) {
		if (index+1 > this.allDetails.length)
			this.allDetails.push(obj);
		else
			this.allDetails.splice(index, 1, obj);
	}

	saveToStorage () {
		localStorage.setItem("Questionare", JSON.stringify(this.allDetails));
	}

	allDetails () { return allDetails; }

	getUserAnswer (index) {
		return this.allDetails[index]["answer"];
	}

}

class Display {

	displayQuestion (no) {
		let qn = questions[no];
		let aws = qn.getAnswers();

		$(".question-block").text(qn.getQuestion());

		let aBlock = $(".answer-block").empty();

		for (let ans of aws) {
			let div = $("<div class='single-answer'></div>");
			let input = $("<input type='radio' name='answer' value='"+ans+"' />");
			let label = $("<label></label>").text(ans);

			if (no < lStorage.allDetails.length) {
				if (ans == lStorage.getUserAnswer(no))
					input.prop("checked", true);
			}

			aBlock.append(div.append(input, label));
		}

		let pButton = $("<button class='prev-Button'></button>").text("Back");
		pButton.click(function () {
			display.displayQuestion(no-1);
		});
		if (no == 0)
			pButton.attr("disabled", "disabled");

		let nButton = $("<button class='next-button'></button>").text("Next");
		nButton.click(function () {
			display.displayQuestion(no+1);
		});
		if (no == lStorage.allDetails.length)
			nButton.attr("disabled", "disabled");

		let sButton = $("<button class='submit-button'></button>").text("Submit");
		sButton.click(function () {
			lStorage.insertDetail(createObj(no), no);

			if (no == 3) {
				$(".ques-ans-block").hide();
				lStorage.saveToStorage();
				$(".name-form").show();
			}
			else {
				display.displayQuestion(no+1);
			}
		});

		aBlock.append(pButton, sButton, nButton);
	}

	displayReviewForm (name) {
		$(".user-name").text(name);

		let dataSet = lStorage.allDetails;
		let reviewForm = $(".review-form");

		for (let obj of dataSet) {
			let div = $("<div class='user-test-details'></div>");
			let input = $("<input type='text' value='"+obj["answer"]+"' />");
			let label = $("<label></label>").text(obj["no"]+ " " +obj["title"]);

			reviewForm.append(div.append(label, input));
			reviewForm.find("input").attr("disabled", "disabled");
		}

		let button = $("<button class='all-done' type='button'></button>").text('SUBMIT');
		button.click(function () {
			window.location.href = "result.html";
		});
		reviewForm.append(button);
	}
}

var display = new Display();
var lStorage = new LocalStorage();
var questions = [];

$.ajax({
    type        : 'GET',
    url         : 'http://10.2.0.104:3000/api/v4/calculators/dibly',
    dataType    : 'json',
    success		: function (data) {
    	let listQn = data["calculator"]["questions"];
    	for (let qn of listQn) {
    		let q = new Question(qn);
    		questions.push(q);
    	}

		display.displayQuestion(0);
    }
});
$(function () {
	// $(".welcome-page").fadeIn(2000);
	// $(".welcome-page").fadeOut(1000);
});

function createObj (index) {
	let obj = {};
	let qn = questions[index];

	obj["no"] = index + 1;
	obj["title"] = qn.getQuestion();

	let selRadioBtn = $("input[name=answer]:checked");
	let x = $(".single-answer").index(selRadioBtn.parent());

	obj["answer"] = selRadioBtn.val();
	obj["isCorrect"] = qn.isAnswerCorrect(x);
	obj["score"] = qn.answerScore(x);

	return obj;
}

function validate (event) {
	event.preventDefault();

	let name = $(".input-name").val();

	$(".name-form").hide();
	$(".review-page").show();

	display.displayReviewForm(name);
}

