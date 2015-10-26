
"use strict";

var todosList;
var oldList;
var sleepycounter = 0;
var justChanged;
var fading;

$(document).ready(function () {

	if ($('#inputDeadline').length) {
		$.datetimepicker.setLocale('en');
		$('#inputDeadline').datetimepicker();
	}

	if ($("#tasksTable").length) {
		getTasks();
		sortTable();
	}

	$('#btnSubmit').click(function () {

		justChanged = $('#inputCourseCode').val() + " " + $('#inputTask').val();
		addTask($('#inputCourseCode').val(), $('#inputTask').val(), $('#inputDeadline').val(), $('#inputWeight').val()/100);
	});

	// Updates
	var updateLoop = setInterval(function () {
		if (todosList) {
			oldList = todosList;
			if (todosList === oldList && sleepycounter < 6) {
				// Every five minutes, update the table order and the priorities
				console.log("Just updating the numbers");
				updateTables(todosList);
				sleepycounter++;
			} else {
				// Every half hour, poll the server
				console.log("Updating the list");
				sleepycounter = 0;
				getTasks();
			}
		}
	}, 300000);
});


function jsDateToExcelDate(inDate) {
	var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
	return returnDateTime.toString().substr(0, 20);
}

function getTasks() {
	$.ajax({
		url: 'getTasks',
		type: 'POST',
		data: {
			gettasks: "get tasks"
		},
		success: function (result) {
			if (result) {
				todosList = result;
				updateTables(todosList);
			}
		},
		timeout: function () {
			console.log("Timeout");
			updateTables(todosList);
		},
		error: function (error) {
			console.log("Error", error);
			updateTables(todosList);
		}
	});
}

function updateTables(result) {
	var len = result.length;
	var currentText, completedText, priority, style, weight, dueDate;
	var rightNow = new Date();
	var rightNowPlusSeven = rightNow.addDays(7);
	var rightNowPlusFourteen = rightNow.addDays(14);
	if (len > 0) {
		for (var i = 0; i < len; i++) {
			if (result[i].coursecode && result[i].task && result[i].deadline && result[i].weight) {
				result[i].deadline = new Date(result[i].deadline);
				priority = (result[i].weight / (jsDateToExcelDate(result[i].deadline) - jsDateToExcelDate(rightNow))) * 100;
				dueDate = new Date(result[i].deadline);
				weight = parseFloat(result[i].weight*100).toFixed(1);
				// If the task is already completed
				if (priority < 0 || result[i].completed) {
					completedText += '<tr><td id="' + result[i]._id + '"><i title="Delete task" class="fa fa-times remove" onclick="deleteItem(\'' + result[i]._id + '\')"></i></td><td>' + result[i].coursecode + '</td><td>' + result[i].task + '</td><td' + style + ' name="' + dueDate.toString() + '">' + dueDate.toLocaleString() + '</td><td class="weight" name="'+result[i].weight+'">' + weight + '%</td></tr>';
				} else { // If the task is current
					priority = parseFloat(priority).toFixed(2);
					if (dueDate && dueDate < rightNowPlusSeven) {
						style = ' style="background-color: red;"';
					} else if (dueDate && dueDate < rightNowPlusFourteen) {
						style = ' style="background-color: yellow;"';
					} else {
						style = "";
					}
					currentText += '<tr><td id="' + result[i]._id + '"><i title="Mark completed" class="fa fa-check complete" onclick="completeItem(\'' + result[i]._id + '\')"></i> <i title="Delete task" class="fa fa-times remove" onclick="deleteItem(\'' + result[i]._id + '\')"></i></td><td>' + result[i].coursecode + '</td><td>' + result[i].task + '</td><td' + style + ' name="' + dueDate.toString() + '">' + dueDate.toLocaleString() + '</td><td class="weight" name="'+result[i].weight+'">' + weight + '%</td><td class="priority">' + priority + '</td></tr>';
				}
			}
		}
		if (currentText !== "") {
			$("#tasksTable").find("tr:gt(0)").remove();
			$("#tasksTable").append(currentText);
			sortTable();
		}
		if (completedText !== "") {
			$("#completedTable").find("tr:gt(0)").remove();
			$("#completedTable").append(completedText);
		}
	}
}

function sortTable() {
	var tbl = document.getElementById("tasksTable").tBodies[0];
	var store = [],
		len;
	for (var i = 0, len = tbl.rows.length; i < len; i++) {
		var row = tbl.rows[i];
		var sortnr = parseFloat(row.cells[5].textContent || row.cells[5].innerText);
		if (!isNaN(sortnr)) store.push([sortnr, row]);
	}
	store.sort(function (y, x) {
		return x[0] - y[0];
	});
	for (var j = 0, len = store.length; j < len; j++) {
		tbl.appendChild(store[j][1]);
	}
	store = null;
	var tableWidth = $("#tasksTable").width;
	$("#content").width(tableWidth);
}

function addTask(coursecode, task, deadline, weight) {
	$.ajax({
		url: 'addTask',
		type: 'POST',
		data: {
			'coursecode': coursecode,
			'task': task,
			'deadline': deadline,
			'weight': weight
		},
		success: function (result) {
			getTasks();
			showToast("Task " + justChanged + " added.");
		},
		timeout: function () {
			showToast("Task could not be added. Server did not respond.");
		},
		error: function (error) {
			console.log(error);
			showToast("Task could not be added. Server gave an error.");
		}
	});
}

function deleteItem(id) {
	var t = $("#" + id);
	var undo = ' <a href="#" onclick="addTask(\'' + t.next().text() + '\',\'' + t.next().next().text() + '\',\'' + t.next().next().next().attr("name") + '\',\'' + t.next().next().next().next().attr("name") + '\');return false;">Undo</a>';
	justChanged = t.next().text() + " " + t.next().next().text();
	$.ajax({
		url: 'deleteTask',
		type: 'POST',
		data: {
			'delID': id
		},
		success: function (result) {
			if (result) {
				getTasks();
				showToast("Task " + justChanged + " deleted.", undo);
			}
		},
		timeout: function () {
			showToast("Task could not be deleted. Server did not respond.");
		},
		error: function (error) {
			console.log(error);
			showToast("Task could not be deleted. Server gave an error.");
		}
	});
}

function completeItem(id) {
	$.ajax({
		url: 'completeTask',
		type: 'POST',
		data: {
			'complID': id
		},
		success: function (result) {
			if (result) {
				getTasks();
			}
		},
		timeout: function () {
			showToast("Task could not be marked as complete. Server did not respond.");
		},
		error: function (error) {
			console.log(error);
			showToast("Task could not be marked as complete. Server gave an error.");
		}
	});
}

Date.prototype.addDays = function (days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};

var fadeToast = function () {
	$("#toast").empty();
	$("#toast").css('background-color', 'white');
};

function showToast(text, action) {
	clearTimeout(fading);
	$("#toast").text(text);
	if (action) {
		var oldHTML = $("#toast").html();
		$("#toast").html(oldHTML + action);
	}
	$("#toast").css('background-color', 'pink');
	fading = setTimeout(fadeToast, 8000);
}
