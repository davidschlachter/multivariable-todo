
"use strict";
$(document).ready(function () {

	$.ajax({
		url: 'getTasks',
		type: 'POST',
		data: {
			gettasks: "get tasks"
		},
		success: function (result) {
			if (result) {
				var len = result.length;
				var txt = "";
				if (len > 0) {
					for (var i = 0; i < len; i++) {
						if (result[i].coursecode && result[i].task && result[i].deadline && result[i].weight) {
							txt += "<tr><td>" + result[i].coursecode + "</td><td>" + result[i].task + "</td><td>" + result[i].deadline + "</td><td>" + result[i].weight + "</td></tr>";
						}
					}
					if (txt != "") {
						$("#tasksTable").find("tr:gt(0)").remove();
						$("#tasksTable").append(txt);
					}
				}
			}
		}
	});


	$('#inputDeadline').datetimepicker({
		timeFormat: 'hh:mm tt z'
	});

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
				console.log(result);

				if (result) {
					var len = result.length;
					var txt = "";
					if (len > 0) {
						for (var i = 0; i < len; i++) {
							if (result[i].coursecode && result[i].task && result[i].deadline && result[i].weight) {
								txt += "<tr><td>" + result[i].coursecode + "</td><td>" + result[i].task + "</td><td>" + result[i].deadline + "</td><td>" + result[i].weight + "</td></tr>";
							}
						}
						if (txt != "") {
							$("tasksTable").find("tr:gt(0)").remove();
							$("#tasksTable").append(txt);
						}
					}
				}
			}
		});

	});
});