
"use strict";
$(document).ready(function () {

	GetTasks();
	sortTable();

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
				GetTasks();
			}
		});

	});
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
							txt += "<tr><td>" + result[i].coursecode + "</td><td>" + result[i].task + "</td><td>" + result[i].deadline + "</td><td>" + result[i].weight + "</td><td class=\"priority\">" + priority + "</td></tr>";
						}
					}
					if (txt != "") {
						$("#tasksTable").find("tr:gt(0)").remove();
						$("#tasksTable").append(txt);
						sortTable();
					}
				}
			}
		}
	});
}

function sortTable(){
    var tbl = document.getElementById("tasksTable").tBodies[0];
    var store = [];
    for(var i=0, len=tbl.rows.length; i<len; i++){
        var row = tbl.rows[i];
        var sortnr = parseFloat(row.cells[4].textContent || row.cells[4].innerText);
        if(!isNaN(sortnr)) store.push([sortnr, row]);
    }
    store.sort(function(y,x){
        return x[0] - y[0];
    });
    for(var i=0, len=store.length; i<len; i++){
        tbl.appendChild(store[i][1]);
    }
    store = null;
}