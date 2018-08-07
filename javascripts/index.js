
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
		let tr = $("<tr data-toggle='tooltip' data-placement='top' title='"+ questions[index].getQuestion() +"'></tr>").append($("<td></td>").text(index+1));
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
		answer == "Not answered" ? td.css({"color": "red"}) : td.css({"color": "#00cccc"});
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

		let quesNo = $("<kbd class='question-no'></kbd>").text(no+1);
		$(".question-block").text(qn.getQuestion());
		$(".question-block").prepend(quesNo);

		let aBlock = $(".answer-block").empty();
		let i = 0;
		for (let ans of aws) {
			let div = $("<div class='custom-control custom-radio single-answer'></div>");
			let input = $("<input type='radio' id='customRadio" + ++i +"' name='answer' value='" +ans+ "' class='custom-control-input' />");
			let label = $("<label class='custom-control-label' for='customRadio"+ i +"'></label>").text(ans);

			if (no < uStorage.allDetails.length) {
				if (ans == uStorage.getUserAnswer(no))
					input.prop("checked", true);
			}

			aBlock.append(div.append(input, label));
		}

		//Creation of the  Previous button.
		let pButton = $(".prev-button").off("click");
		pButton.click(function () {
			if (uStorage.allDetails.length+1 == questions.length)
				uStorage.insertDetail(createObj(no, false), no);
			display.displayQuestion(no-1);
		});
		no == 0 ? pButton.attr("disabled", "disabled") : pButton.removeAttr("disabled");					//The button is disabled for the first page.

		//Creation of the Submit button.
		let sButton = $(".submit-button").off("click");
		sButton.click(function () {
			uStorage.insertDetail(createObj(no, true), no);
			display.displayQuestion(no+1 > questions.length ? no: no+1);
			updateHeader();
		});

		//Creation of the Next button.
		let nButton = $(".next-button").off("click");
		nButton.click(function () {
			uStorage.insertDetail(createObj(no, false), no);
			display.displayQuestion(no+1);
			updateHeader();
		});

		if (no+1 == questions.length) {
			nButton.attr("disabled", "disabled");							//The button is disabled for the last page.
			this.displaySureButton();
		}
		else
			nButton.removeAttr("disabled");
	}

	/**
	 *This function acts as a private function.
	 *It only invoked within the class.
	 *
	 *It is invoked only after all questions have been covered.
	 *
	 */
	displaySureButton () {
		let button = $(".sureButtonContainer > button");
		button.click(function () {
			clearTimeout(myTimer);
			if (uStorage.allDetails.length+1 == questions.length)
				uStorage.insertDetail(createObj(questions.length-1, false), questions.length-1);
			$(".content-header").hide();
			$(".main").hide();
			$(".sureButtonContainer").hide();
			$(".quiz-timer").hide();
			$(".user-form-container").show();
		});
	}
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
	saveToStorage (name, email) {
		let innerObj = {};
		innerObj["name"] = name;
		innerObj["performance"] = this.allDetails;

		let ls = localStorage.getItem("quizData");
		ls == null ? ls = {} : ls = JSON.parse(ls);
		ls[email] = innerObj;
		localStorage.setItem("quizData", JSON.stringify(ls));
	}

	allDetails () { return allDetails; }

	getUserAnswer (index) { return this.allDetails[index]["answer"]; }

}

/**
 *This class is for validation of user details.
 *
 *The valdiateName() and validateEmail() are attached to the corresponding
 *input's blur event.
 *The valdiateAll() again valdiates the name and email ones the user clicks
 *on the submit button.
 *If it returns to be true, then user would be taken to the resul page.
 *
 *@param name- Stores the name of the user if it validates to be true.
 *@param email- Stores the email of the user if it validates to be true.
 *@param namePattern- Regular Expression for name.
 *@param emailPattern- Regular Expression for email.
 *
 *
 */
class UserValidation {
	constructor() {
		this.name = "";
		this.email = "";
		this.namePattern = /[a-zA-Z]{3}([\s]?[a-zA-Z]+)*/;
		this.emailPattern = /\w+@[a-z]{3,7}\.\w+/
	}
	validateName () {
		let uName = $(".user-name").val();

		if(uName.length >= 5) {
			if (this.namePattern.test(uName)) {
				$(".uname-msg").html('<i class="fas fa-check"></i>');
				this.name = uName;
				return true;
			}
			else
				$(".uname-msg").text('should start with a letter and contain only alphabets.');
		}
		else
			$(".uname-msg").text('should be atleast 5 characters long.');
		return false;
	}
	validateEmail () {
		let uEmail = $(".user-email").val();

		if (this.emailPattern.test(uEmail)) {
			$(".uemail-msg").html('<i class="fas fa-check"></i>');
			this.email = uEmail;
			return true;
		}
		else
			$(".uemail-msg").text('should be in the form: example@qburst.com');
		return false;
	}
	validateAll (event) {
		event.preventDefault();
		if (this.validateName() && this.validateEmail()) {
			uStorage.saveToStorage(this.name, this.email);
			window.location.href = "result.html?email=" + this.email;
			return true;
		}
	}

}

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
	if (questions.length-2 < uStorage.allDetails.length) {
		$(".content-header").text("You have coverd all questions. Click on the 'Yes I am completed' button to finish");
		setTimeout(function(){
			$(".content-header").hide();
			$(".main").css({"margin-top": "40px",});
			$(".sureButtonContainer").show();
		}, 1500);
	}
	else
		$(".rem-ques-nos").text(questions.length-uStorage.allDetails.length-1);

}

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
		$(".main").show();
    }
});

var questions = [];

var display = new Display();
var uStorage = new UserStorage();
var table = new Table();
var user = new UserValidation();


/**
 *A function to show timer of 30 seconds.
 *The Quiz question page will automatically closed after the times up.
 *
 *@arg i- Corresponds to minutes
 *@arg j- Corresponds to minutes
 *@arg m- Corresponds to seconds
 *@arg n- Corresponds to seconds
 *
 */
var updateTimer = function (i=0, j=0, m=0, n=9) {
    myTimer = setTimeout(function () {
        $(".timer-d-1").text(i);
        $(".timer-d-2").text(j);
        $(".timer-d-3").text(m);
        $(".timer-d-4").text(n);
        n = n == 0 ? (--m, 10) : n;
        if (m == -1 && n == 10) {
			for (let x=uStorage.allDetails.length; x<questions.length; x++) {
				display.displayQuestion(x);
				uStorage.insertDetail(createObj(x, false), x);
			}
			$("#timesupModal").modal('show');
			$(".content-header").hide();
			$(".main").hide();
			$(".sureButtonContainer").hide();
			$(".quiz-timer").hide();
			$(".user-form-container").show();

            return;
        }
        updateTimer(i, j, m, --n);
    }, 1000);
}

updateTimer();
