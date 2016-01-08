
"use strict";

var todosList;
var oldList;
var sleepycounter = 0;
var justChanged;
var fading;
var backgroundImage, backgroundOpacity;

if (typeof console === "undefined") {
	console = {
		log: function(i) {},
		debug: function(i) {}
	};
}

if ($('#inputDeadline').length) {
	$.datetimepicker.setLocale('en');
	$('#inputDeadline').datetimepicker();
}

if ($("#tasksTable").length) {
	getTasks();
}

if ($("#prefs").length) {	
	getPrefs();
} else {
	backgroundImage = "https://farm8.staticflickr.com/7788/18388023062_1803b02299_k_d.jpg";
	backgroundOpacity = 0.6;
	$('body').css('background', 'rgb(11,26,33) url(' + backgroundImage + ') no-repeat left top');
	$('body').css('background-attachment', 'fixed');
	$('body').css('background-size', 'cover');
	$('#content').css('background-color', 'rgba(255, 255, 255, ' + backgroundOpacity + ')');
}

$('#btnSubmit').click(function () {
	justChanged = $('#inputCourseCode').val() + " " + $('#inputTask').val();
	addTask($('#inputCourseCode').val(), $('#inputTask').val(), $('#inputDeadline').val(), $('#inputWeight').val() / 100);
});

$('#prefslink').click(function () {
	$('#prefs').show();
	$('#bigbkgdiv').show();
	$('#inputBkgURL').val(backgroundImage);
	$('#inputOpacity').val(backgroundOpacity);
	showOpacity(backgroundOpacity);
	showPreviewImage();
});

$('#inputBkgURL').change(function () {
	showPreviewImage();
});

$('#btnPrefSubmit').click(function () {
	$('#prefs').hide();
	$('#bigbkgdiv').hide();
	$.ajax({
		url: 'setPrefs',
		type: 'POST',
		data: {
			BkgURL: $('#inputBkgURL').val(),
			inputOpacity: $('#inputOpacity').val()
		},
		success: function (result) {
			if (result) {
				getPrefs();
			}
		},
		timeout: function () {
			console.log("setPrefs: timeout");
		},
		error: function (error) {
			console.log("setPrefs: error", error);
		}
	});
});

$('#btnPrefCancel').click(function () {
	$('#prefs').hide();
	$('#bigbkgdiv').hide();
});

$('#completedHead').click(function () {
	$('#completedTable').toggle();
	$('#complRight').toggle();
	$('#complDown').toggle();
});

$('#currentHead').click(function () {
	$('#currentTasks').toggle();
	$('#currRight').toggle();
	$('#currDown').toggle();
});

$('#toastRight').click(function () {
	clearTimeout(fading);
	fading = setTimeout(fadeToast, 1);
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
			getPrefs();
		}
	}
}, 300000);


function jsDateToExcelDate(inDate) {
	var returnDateTime = 25569.0 + ((inDate.valueOf()) / (1000 * 60 * 60 * 24));
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

function getPrefs() {
	$.ajax({
		url: 'getPrefs',
		type: 'POST',
		data: {
			gettasks: "get prefs"
		},
		success: function (result) {
			if (result) {
				backgroundImage = result[0].backgroundURL;
				backgroundOpacity = result[0].backgroundOpacity;
				$('body').css('background', 'rgb(11,26,33) url(' + backgroundImage + ') no-repeat left top');
				$('body').css('background-attachment', 'fixed');
				$('body').css('background-size', 'cover');
				$('#content').css('background-color', 'rgba(255, 255, 255, ' + backgroundOpacity + ')');
			}
		},
		timeout: function () {
			console.log("getPrefs: timeout");
		},
		error: function (error) {
			console.log("getPrefs: error", error);
		}
	});
}

function updateTables(result) {
	var len = result.length;
	var currentText = '', completedText = '', priority, style, weight, dueDate, isCompleted, completedButton, priorityColumn, string;
	var red = 'rgb(255,0,0)', yellow = 'rgb(255,255,0)';
	var rightNow = new Date();
	var momentDeadline;
	var rightNowPlusSeven = rightNow.addDays(7);
	var rightNowPlusFourteen = rightNow.addDays(14);

	// Check for RGBA support
	// via http://lea.verou.me/2009/03/check-whether-the-browser-supports-rgba-and-other-css3-values/
	var prevcolor = document.getElementsByTagName('script')[0].style.color;
	try {
		document.getElementsByTagName('script')[0].style.color = 'rgba(0,0,0,0.5)';
	} catch(e) {}
	var supportsRGBA = document.getElementsByTagName('script')[0].style.color != prevcolor;
	document.getElementsByTagName('script')[0].style.color = prevcolor;
	if (supportsRGBA) {
		red = 'rgba(255,0,0,0.4)';
		yellow = 'rgba(255,255,0,0.4)';
	}

	$("#tasksTable").find("tr:gt(0)").remove();
	$("#completedTable").find("tr:gt(0)").remove();

	if (len > 0) {
		for (var i = 0; i < len; i++) {
			if (result[i].coursecode && result[i].task && result[i].deadline && result[i].weight) {
				momentDeadline = moment(result[i].deadline);
				dueDate = momentDeadline;
				weight = parseFloat(result[i].weight * 100).toFixed(1);
				priority = (result[i].weight / (jsDateToExcelDate(dueDate) - jsDateToExcelDate(rightNow))) * 100;
				priority = parseFloat(priority).toFixed(2);
				if (priority < 0 || result[i].completed) {
					isCompleted = true;
				} else {
					isCompleted = false;
				}
				if (isCompleted === false) {
					completedButton = '<i title="Mark completed" class="fa fa-check complete" onclick="completeItem(\'' + result[i]._id + '\')"></i>';
					priorityColumn = '<td class="priority">' + priority + '</td>'
					if (dueDate && dueDate < rightNowPlusSeven) {
						style = ' style="background-color: '+red+';"';
					} else if (dueDate && dueDate < rightNowPlusFourteen) {
						style = ' style="background-color: '+yellow+';"';
					} else {
						style = "";
					}
				} else { // If the task is completed
					completedButton = '';
					priorityColumn = '';
					style = "";
				}
				string = '<tr><td id="' + result[i]._id + '">' + completedButton + '<i title="Delete task" class="fa fa-times remove" onclick="deleteItem(\'' + result[i]._id + '\')"></i></td><td class="coursecode">' + result[i].coursecode + '</td><td>' + result[i].task + '</td><td class="dateTD dayTD"' + style + ' name="' + dueDate.toString() + '">' + moment(dueDate).format("ddd") + '</td><td class="dateTD"' + style + '>' + moment(dueDate).format("D") + '</td><td class="dateTD"' + style + '>' + moment(dueDate).format("MMM") + '<span class="datecomma">,</span></td><td class="dateTD time"' + style + '>' + moment(dueDate).format("h:mm A") + '</td><td class="weight" name="' + result[i].weight + '">' + weight + '%</td>' + priorityColumn + '</tr>';

				if (isCompleted === false) {
					currentText += string;
				} else {
					completedText += string;
				}
			}
		}
		$("#tasksTable").find("tr:gt(0)").remove();
		if (currentText !== "") {
			$("#tasksTable").append(currentText);
			if ($('#tasksTable tbody tr').length !== 1) sortTable();
		}
		$("#completedTable").find("tr:gt(0)").remove();
		if (completedText !== "") {
			$("#completedTable").append(completedText);
		}
	}
	if ($('#tasksTable tbody tr').length === 1) {
		$('#gettingstarted').show();
		$("#tasksTable").hide();
	} else {
		$('#gettingstarted').hide();
		$('#tasksTable').show();
	}
}

function sortTable() {
	var tbl = document.getElementById("tasksTable").tBodies[0];
	var store = [],
		len;
	for (var i = 0, len = tbl.rows.length; i < len; i++) {
		var row = tbl.rows[i];
		try {var sortnr = parseFloat(row.cells[8].textContent || row.cells[8].innerText);} catch(e) {console.log(e)};
		if (!isNaN(sortnr)) store.push([sortnr, row]);
	}
	store.sort(function (y, x) {
		return x[0] - y[0];
	});
	for (var j = 0, len = store.length; j < len; j++) {
		tbl.appendChild(store[j][1]);
	}
	store = null;
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
	var undo = ' <a href="#" onclick="addTask(\'' + t.next().text() + '\',\'' + t.next().next().text() + '\',\'' + t.next().next().next().attr("name") + '\',\'' + t.next().next().next().next().next().next().next().attr("name") + '\');return false;">Undo</a>';
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
	$("#toastInner").empty();
	$("#toast").hide();
};

function showToast(text, action) {
	clearTimeout(fading);
	$("#toastInner").text(text);
	if (action) {
		var oldHTML = $("#toastInner").html();
		$("#toastInner").html(oldHTML + action);
		$("#toast").show();
		fading = setTimeout(fadeToast, 8000);
	} else {
		$("#toast").show();
		fading = setTimeout(fadeToast, 2000);
	}
}

function showPreviewImage() {
	var imgURL = $('#inputBkgURL').val();
	$('#imgPreview').css('background', 'rgb(11,26,33) url(' + imgURL + ') no-repeat left top');
	$('#imgPreview').css('background-size', 'cover');
}


function showOpacity(opacity) {
	document.querySelector('#inputOpacityText').value = opacity;
	$('#tasksPreview').css('opacity', opacity);
}
