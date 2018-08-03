var email = /\w+@[a-z]{3,7}\.\w+/
var password = /^[a-zA-Z]+([0-9]+[a-zA-Z]*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+[a-zA-Z]*[0-9]+)[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/

$(".email").blur(function () {
	var errorMsg = $(".login-form").find(".uname-msg");
	if (errorMsg.length == 0) {
		var errorMsg = $("<p></p>");
		errorMsg.addClass("uname-msg");
		$(".email").after(errorMsg);
	}
	if (email.test($(".email").val()))
		errorMsg.html('<i class="fas fa-check"></i>');
	else
		errorMsg.text('should be in the form: example@qburst.com');
});
$(".password").blur(function () {
	var errorMsg = $(".login-form").find(".pword-msg");
	if (errorMsg.length == 0) {
		var errorMsg = $("<p></p>");
		errorMsg.addClass("pword-msg");
		$(".password").after(errorMsg);
	}
	if($(".password").val().length >= 7) {
		if (password.test($(".password").val()))
			errorMsg.html('<i class="fas fa-check"></i>');
		else
			errorMsg.text('should start with a letter and contain atleast one letter and one special character.');
	}
	else
		errorMsg.text('should be atleast 7 characters long.');
});

function validateLogin (event) {
	event.preventDefault();
	$(".login-form-container").hide();
	$(".main").css("display", "flex");
	updateHeader();
}

/**
 *Answer is a class that represents an answer.
 *We create instances of Answer only in Qurestion class.
 *
 *@param id- Unique id of the Answer
 *@param title- It represents the answer
 *@param isCorrect- It shows whether the  answer is correct or not
 *@param score- The score of the answer if it is correct
 *
 */
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

/**
 *Represents the Question.
 *It contains all the Answers as objects in it.
 *
 *@param id- Unique id of the Question
 *@param title- It represents the Question
 *@param answers- An array contains Answer objects.
 *
 */
class Question {

	//@arg qn- Question object recieved from the Ajax function.
	//It also contains all the Answers too.
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

	//It returns the titles of all answers as an array.
	getAnswers () {
		let ansArray = [];
		for (let x of this.answers)
			ansArray.push(x.title);

		return ansArray;
	}

	//It returns true if the answer is correct.
	//@arg index- Represents the chronological order of the Question.
	isAnswerCorrect (index) { return this.answers[index].isCorrect; }

	//It returns the score of a particular answer.
	//@arg index- Represents the chronological order of the Question.
	answerScore (index) { return this.answers[index].score; }
}

/**
 *Stores all the answered questions.
 *
 *It also stores the allDetails array into local storage after the User
 *is clicked on the "Yes i completed" button.
 *
 *@param allDetails- Array storing details of all User covered Questions.
 *
 */
class UserStorage {

	constructor () { this.allDetails = []; }

	/**
	 *For inserting the details of User answered Questions.
	 *If it is a previously answered question, then it just updates it.
	 *
	 *After insertion, it calls for status table updation.
	 *
	 *@arg obj- Object represents User covered Question.
	 *@arg index- Index of the page that triggered the event.
	 *
	 */
	insertDetail (obj, index) {
		if (index+1 > this.allDetails.length) {
			this.allDetails.push(obj);
			table.createRow(obj, index);
		}
		else {
			this.allDetails.splice(index, 1, obj);
			table.updateRow(obj, index);
		}
	}

	//Save array to local storage on "Yes i am completed" button.
	saveToStorage () {
		localStorage.setItem("Questionare", JSON.stringify(this.allDetails));
	}

	allDetails () { return allDetails; }

	getUserAnswer (index) { return this.allDetails[index]["answer"]; }

}

/**
 *This class correspnds to the status table which is showed in the right side
 *of the Question.
 *
 *It contains the answers the user is submitted and also the unanswered
 *questions.
 *
 *It also contains the links for going to a particular Question.
 *
 *
 */
class Table {

	/**
	 *It is for creating a row in the status table.
	 *Row is created when a user is covered a Question.
	 *
	 *It creates no matter whether the user answered the question or skipped.
	 *
	 *@arg obj- Object contains the Question and Answer details.
	 *@arg index- Question number.
	 *
	 */
	createRow (obj, index) {
		let tr = $("<tr></tr>").append($("<td></td>").text(index+1));
		let td = $("<td></td>").text(obj["answer"]);
		this.changeAnswerColor(obj["answer"], td);
		tr.append(td);

		td = $("<td></td>").append("<i class='far fa-edit'></i>");
		td.click(function () {
			display.displayQuestion(index);
		})

		$(".status-table tbody").append(tr.append(td));
	}

	/**
	 *This function just updates the answer in the status table incase of the
	 *resubmission.
	 *
	 */
	updateRow (obj, index) {
		let td = $(".status-table tr:nth-child("+(index+1)+") td:nth-child(2)");	//Finding the position of the Answer in status table.
		td.text(obj["answer"]);
		this.changeAnswerColor(obj["answer"], td);
	}

	/**
	 *This function is used for setting the color of the answer.
	 *
	 *@arg answer- Answer the user is just submitted.
	 *@arg td- The position of the Answer in the status table.
	 *
	 *@color red- For not answered Questions.
	 *@color green- For answered Questions.
	 *
	 */
	changeAnswerColor (answer, td) {
		answer == "Not answered" ? td.css({"color": "red"}) : td.css({"color": "green"});
	}
}

/**
 *It contains all the display functions in the script.
 *
 *Displays the Question with its Answers.
 *Displays the Review form once the user is completed the Quiz.
 *Creates and displays the Sure button for making sure that he is completed.
 */
class Display {

	/**
	 *It displays the Question and Answers in the screen.
	 *
	 *It also created the next, previous, submit button dynamically.
	 *
	 *@arg no- Question number
	 *
	 *@param qn- Corresponding Question object
	 *@param aws- An array contains all the titles of the Answers
	 *
	 */
	displayQuestion (no) {

		let qn = questions[no];
		let aws = qn.getAnswers();

		$(".question-block").text(no+1 + '. ' +qn.getQuestion());

		let aBlock = $(".answer-block").empty();

		for (let ans of aws) {
			let div = $("<div class='single-answer'></div>");
			let input = $("<input type='radio' name='answer' value='" + ans + "' />");
			let label = $("<label></label>").text(ans);

			if (no < uStorage.allDetails.length) {
				if (ans == uStorage.getUserAnswer(no))
					input.prop("checked", true);
			}

			aBlock.append(div.append(input, label));
		}

		//Creation of the  Previous button.
		let pButton = $("<button class='prev-Button'></button>").text("Back");
		pButton.click(function () {
			if (uStorage.allDetails.length+1 == questions.length)
				uStorage.insertDetail(createObj(no, false), no);
			display.displayQuestion(no-1);
		});
		if (no == 0) pButton.attr("disabled", "disabled");					//The button is disabled for the first page.

		//Creation of the Submit button.
		let sButton = $("<button class='submit-button'></button>").text("Submit");
		sButton.click(function () {
			uStorage.insertDetail(createObj(no, true), no);
			display.displayQuestion(no+1 > questions.length ? no: no+1);
			updateHeader();
		});

		//Creation of the Next button.
		let nButton = $("<button class='next-button'></button>").text("Next");
		nButton.click(function () {
			uStorage.insertDetail(createObj(no, false), no);
			display.displayQuestion(no+1);
			updateHeader();
		});

		aBlock.append(pButton, sButton, nButton);

		if (no+1 == questions.length) {
			nButton.attr("disabled", "disabled");							//The button is disabled for the last page.
			this.displaySureButton();
			updateHeader();
			//
		}

		//The status table is displayed only after the submission of or leaving the first Question.
		if (no == 1 || (no == 0 && uStorage.allDetails.length != 0))
			$(".current-status").css({'visibility': 'visible'});
	}

	/**
	 *It displays the review page in which the user can see all his answers.
	 *Even though he cannot have the permission for further editing.
	 *
	 *@param email- Email-id of the user.
	 *@param dataSet- An array contains all the Answers the user is submitted.
	 *
	 */
	displayReviewForm (name) {
		$(".review-form").empty();

		$(".user-name").text(name);

		let dataSet = uStorage.allDetails;
		let reviewForm = $(".review-form");

		for (let obj of dataSet) {
			let div = $("<div class='user-test-details'></div>");
			let input = $("<input type='text' value='"+obj["answer"]+"' />");
			let label = $("<label></label>").text(obj["no"]+ " " +obj["title"]);

			reviewForm.append(div.append(label, input));
			reviewForm.find("input").attr("disabled", "disabled");
		}

		//Button for going back to the Questionare.
		let backButton = $("<button class='go-back' type='button'></button>").text('BACK');
		backButton.click(function () {
			$(".review-page").hide();
			$(".ques-ans-block").show();
			$(".current-status").show();
			display.displayQuestion(0);
			$(".sureButton").show();
		});

		//Button for going to another page.
		let button = $("<button class='all-done' type='button'></button>").text('SUBMIT');
		button.click(function () {
			window.location.href = "result.html";
		});
		reviewForm.append(backButton, button);
	}

	/**
	 *This function acts as a private function.
	 *It only invoked within the class.
	 *
	 *It is invoked only after all questions have been covered.
	 *
	 */
	displaySureButton () {
		let button = $("<button class='sureButton'></button>").text("Yes. I am Sure");
		button.click(function () {
			if (uStorage.allDetails.length+1 == questions.length)
				uStorage.insertDetail(createObj(questions.length-1, false), questions.length-1);
			$(".ques-ans-block").hide();
			uStorage.saveToStorage();
			$(".current-status").hide();
			$("header.mHeader").hide();
			$(".sureButton").hide();
			$(".review-page").show();
			display.displayReviewForm(name);

		});

		//Checks whether the Sure Button is already generated or not.
		if (!$(".sureButton").length)
			$(".main").after(button);
	}
}

var display = new Display();
var uStorage = new UserStorage();
var table = new Table();

var questions = [];

/**
 *Ajax call for getting the Questionare from the API.
 *
 *It fetch all Questions from the JSON and pushes it to the global
 *Question array.
 *
 *After all questions are pushed, first question is displayed.
 *
 */
$.ajax({
    type        : 'GET',
    url         : 'http://10.2.0.104:3000/api/v4/calculators/dibly',
    dataType    : 'json',
    success	 : function (data) {
	    	let listQn = data["calculator"]["questions"];
	    	for (let qn of listQn) {
	    		let q = new Question(qn);
	    		questions.push(q);
	    	}
		display.displayQuestion(0);
    }
});

/**
 *It returns an object that includes the question and answer details.
 *
 *@arg index- Chronologincal order of the Question
 *@arg isSubmitted- It tells whether the event is occured due to submit
 *				  button or next button click
 *
 *@param qn- Corresponds the Question object
 *@param selRadioBtn- jQuery object represents the checked checkbox.
 *
 */
function createObj (index, isSubmitted) {
	let obj = {};
	let qn = questions[index];

	obj["no"] = index + 1;
	obj["title"] = qn.getQuestion();

	let selRadioBtn = $("input[name=answer]:checked");
	if (isSubmitted) {
		let x = $(".single-answer").index(selRadioBtn.parent());

		obj["answer"] = selRadioBtn.val();
		obj["isCorrect"] = qn.isAnswerCorrect(x);
		obj["score"] = qn.answerScore(x);
	}
	else if (index == uStorage.allDetails.length) {
		obj["answer"] = "Not answered";
		obj["isCorrect"] = "null";
		obj["score"] = "null";
	}
	else
		return uStorage.allDetails[index];
	return obj;
}

//Function to showing how many question remaining.
//If all covered, then indicate about the "Yes I am completed" button.
function updateHeader() {
	let header = $("header.mHeader");
	if (questions.length-2 < uStorage.allDetails.length)
		header.text("You have coverd all questions. Click on the 'Yes I am completed' button to finish");
	else
		header.text(questions.length-uStorage.allDetails.length-1 + " Questions remaining");

}
