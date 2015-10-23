
"use strict";

var todosList;
var oldList;
var sleepycounter = 0;

$(document).ready(function () {

	if ($('#inputDeadline').length) {
		$('#inputDeadline').datetimepicker({
			timeFormat: 'hh:mm tt z'
		});
	}

	if ($("#tasksTable").length) {
		GetTasks();
		sortTable();
	}

	$('#btnSubmit').click(function () {

		$.ajax({
			url: 'addTask',
			type: 'POST',
			data: {
				'coursecode': $('#inputCourseCode').val(),
				'task': $('#inputTask').val(),
				'deadline': $('#inputDeadline').val(),
				'time': $('#inputDeadlineTime').val(),
				'weight': $('#inputWeight').val()
			},
			success: function (result) {
				GetTasks();
			}
		});

	});

	// Updates
	var updateLoop = setInterval(function () {
		if (todosList) {
			oldList = todosList;
			if (todosList === oldList && sleepycounter < 6) {
				// Every five minutes, update the table order and the priorities
				console.log("Just updating the numbers");
				updateTable(todosList)
				sleepycounter++;
			} else {
				// Every half hour, poll the server
				console.log("Updating the list");
				sleepycounter = 0;
				GetTasks();
			}
		}
	}, 300000);
});


function JSDateToExcelDate(inDate) {
	var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
	return returnDateTime.toString().substr(0, 20);
}

function GetTasks() {
	$.ajax({
		url: 'getTasks',
		type: 'POST',
		data: {
			gettasks: "get tasks"
		},
		success: function (result) {
			if (result) {
				todosList = result;
				updateTable(todosList);
			}
		},
		timeout: function () {
			console.log("Timeout");
			updateTable(todosList);
		},
		error: function (error) {
			console.log("Error", error);
			updateTable(todosList);
		}
	});
}

function updateTable(result) {
	var len = result.length;
	var txt = "";
	var priority;
	var rightNow = new Date();
	if (len > 0) {
		for (var i = 0; i < len; i++) {
			if (result[i].coursecode && result[i].task && result[i].deadline && result[i].weight) {
				result[i].deadline = new Date(result[i].deadline);
				priority = (result[i].weight / (JSDateToExcelDate(result[i].deadline) - JSDateToExcelDate(rightNow))) * 100;
				priority = parseFloat(priority).toFixed(2);
				if (priority < 0) {
					continue;
				}
				txt += '<tr><td><i class="fa fa-times remove" onclick="deleteItem(\'' + result[i]._id + '\')"></i></td><td>' + result[i].coursecode + '</td><td>' + result[i].task + '</td><td>' + result[i].deadline + '</td><td>' + result[i].weight + '</td><td class="priority">' + priority + '</td></tr>';
			}
		}
		if (txt != "") {
			$("#tasksTable").find("tr:gt(0)").remove();
			$("#tasksTable").append(txt);
			sortTable();
		}
	}
}

function sortTable() {
	var tbl = document.getElementById("tasksTable").tBodies[0];
	var store = [];
	for (var i = 0, len = tbl.rows.length; i < len; i++) {
		var row = tbl.rows[i];
		var sortnr = parseFloat(row.cells[4].textContent || row.cells[4].innerText);
		if (!isNaN(sortnr)) store.push([sortnr, row]);
	}
	store.sort(function (y, x) {
		return x[0] - y[0];
	});
	for (var i = 0, len = store.length; i < len; i++) {
		tbl.appendChild(store[i][1]);
	}
	store = null;
}

function deleteItem(id) {
	$.ajax({
		url: 'deleteTask',
		type: 'POST',
		data: {
			'delID': id
		},
		success: function (result) {
			if (result) {
				GetTasks();
			}
		}
	});
}