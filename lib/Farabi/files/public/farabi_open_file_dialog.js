/**
 * Open file dialog
 *
 * TODO document open file dialog
 */
$(function() {
	var $openFileDialog    = $("#open-file-dialog");

	var findFile = function() {
		var filename = $("#file", $openFileDialog).val();
		$("#matched-files", $openFileDialog).empty();
		$("#ok-button", $openFileDialog).attr("disabled","disabled");
		$.ajax({
			type:    "POST",
			url:     "/find-file",
			data:    { "filename": filename },
			success: function(results) {
				var html = '';
				for(var i = 0; i < results.length; i++) {
					var result = results[i];
					html += "<option id='" + result.id + "' "  + 
						((i == 0) ? "selected" : "") + 
						">" + 
						result.name + 
						"</option>";
				}
				$("#ok-button", $openFileDialog).removeAttr("disabled");
				$("#matched-files", $openFileDialog).html(html);
			},
			error:   function(jqXHR, textStatus, errorThrown) {
				console.error("Error:\n" + textStatus + "\n" + errorThrown);
			}
		});
	}

	$(document).on('action-open-file', function() {
		$openFileDialog.modal('show');
		$openFileDialog.on('shown', function() {
			$("#file", $openFileDialog).val('').focus();
			$("#matched-files", $openFileDialog).empty();
			$("#ok-button", $openFileDialog).attr("disabled","disabled");
			findFile();
		});
	});

	var findFileTimeoutId;
	$("#file", $openFileDialog).on('input', function() {
		clearTimeout(findFileTimeoutId);
		findFileTimeoutId = setTimeout(findFile, 500);
	});

	$("#file", $openFileDialog).keyup(function(e) {
		var keyCode = e.keyCode;
		if(keyCode == 40) {
			$("#matched-files", $openFileDialog).focus();
		}
	});

	$($openFileDialog).keyup(function(e) {
		var keyCode = e.keyCode;
		if(keyCode == 13) {
			$("#ok-button", $openFileDialog).click();
		}
	});
	
	// Handle double click event on the matched files list as an action trigger
	$("#matched-files", $openFileDialog).dblclick(function() {
		$("#ok-button", $openFileDialog).click();
	});
	
	$("#ok-button", $openFileDialog).click(function() {

		if($(this).is(':disabled')) {
			// Button is disabled...
			return;
		}

		var filename = $("#matched-files option:selected", $openFileDialog).attr('id');
		if (!filename) {
			console.warn("file name is empty");
			return;
		}
		$.ajax({
			type:    "POST",
			url:     "/open-file",
			data:    { "filename": filename },
			success: function(result) {
				if(result.ok) {
					AddEditorTab(result.filename, filename, result.mode, result.value);
				} else {
					alert(result.value);
				}
			},
			error:   function(jqXHR, textStatus, errorThrown) {
				console.error("Error!" + textStatus + ", " + errorThrown);
			}
		});
	});

});