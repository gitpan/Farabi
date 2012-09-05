/**
 * Starts Farabi... :)
 */
function StartFarabi(editorId) {

	// Cache dialog jQuery references for later use
	var $help_search_dialog = $("#help_search_dialog");
	var $perl_critic_dialog = $("#perl_critic_dialog");

	$("#theme_selector").change(function() {
		var $selectedTheme = $(":selected", this);
		editor.setOption("theme", $selectedTheme.val());
		humane.log("Mode changed to " + $selectedTheme.html());
	});

	function displayHelp(cm) {
		var selection = cm.getSelection();
		if(selection) {
			_displayHelp(selection, true);
		} else {
			_displayHelp('', true);
		}
	}

	function _displayHelp(topic, bShowDialog) {
		$.post('/help_search', {"topic": topic}, function(results) {
			if(results.length > 0) {
				humane.log("Found " + results.length + " help results for '" + topic +"'!");
				$(".topic", $help_search_dialog).val(topic);
				var html = '';
				for(var i = 0; i < results.length; i++) {
					html += '<option value="' + i + '">' + results[i].podname + "  (" + results[i].context + ")" +'</option>';
				}

				$(".results", $help_search_dialog)
					.html(html)
					.change(function() {
						var index = $(':selected', this).val();
						$(".preview", $help_search_dialog).html(results[index].html);
					}).change().show();
			} else {
				humane.log("No help found for '" + topic + "'");

				$(".topic", $help_search_dialog).val(topic);
				$(".results", $help_search_dialog).html('').hide();
				$(".preview", $help_search_dialog).html('<span class="text-error">No results found!</span>');
			}
			if(bShowDialog) {
				$help_search_dialog.modal('show');
			}
		});
	}

	function changeMode(cm, modeFile, mode) {
		if(typeof mode == 'undefined') {
			mode = modeFile;
		}
		CodeMirror.modeURL = "assets/codemirror/mode/%N.js";
		cm.setOption("mode", mode);
		CodeMirror.autoLoadMode(cm, modeFile);	
	}

	$("#mode_selector").change(function() {
		var $selectedMode = $(":selected", this);
		humane.log("Mode changed to " + $selectedMode.html());
		var mode = $selectedMode.val();
		if(mode == 'clike') {
			changeMode(editor, mode, 'text/x-csrc');
		} else if(mode == 'plsql') {
			changeMode(editor, mode, 'text/x-plsql');
		} else {
			changeMode(editor, mode);
		}
	});

	var editor = CodeMirror.fromTextArea(document.getElementById(editorId), {
		lineNumbers: true,
		matchBrackets: true,
		tabSize: 4,
		indentUnit: 4,
		indentWithTabs: true,
		extraKeys: {
			"F1": function(cm) {
				displayHelp(cm);
			},
		},
		onCursorActivity: function() {
			// Highlight active line
			editor.setLineClass(hlLine, null, null);
			hlLine = editor.setLineClass(editor.getCursor().line, null, "activeline");

			// Highlight selection matches
			editor.matchHighlight("CodeMirror-matchhighlight");
		},
		onGutterClick: function(cm, n) {
			var info = cm.lineInfo(n);
			if (info.markerText) {
				cm.clearMarker(n);
			} else {
				cm.setMarker(n, "<span style=\"color: #900\">*</span> %N%");
			}
		}
	});
	// Editor is by default Perl
	changeMode(editor, 'perl');

	// focus!
	editor.focus();


	// Highlight active line
	var hlLine = editor.setLineClass(0, "activeline");

	$(".run_in_browser_button").click(function() {
		// Load Perlito - Perl 5 to JS Compiler
		humane.log("Loading Perlito 5");
		$.ajax({
			url: 'assets/perlito/perlito5.js',
			dataType: "script",
			cache: true,
			success: function() {
				runOnPerlito(editor.getValue());
				humane.log("Run in browser finished");
			}
		});
	});

	var $output = $("#output");

	$(".perl_tidy_button").click(function() {
		$.post('/perl_tidy', {"source": editor.getValue()}, function(data) {
			if(data.error == '') {
				editor.setValue(data.source);
				humane.log("Your code is tidied!");
			} else {
				$output.val('Error:\n' + data.error);
				humane.log("Perl::Tidy failed! Please check output");
			}
		});
	});

	$(".perl_critic_button").click(function() {
		$.post('/perl_critic', {"source": editor.getValue()}, function(violations) {
			if(violations.length > 0) {
				humane.log("Found Perl::Critic violations!");
				var html = '';
				for(var i = 0; i < violations.length; i++) {
					var violation = violations[i];
					var policy = violation.policy;
					html += '<strong>Description:</strong><br/>' + violation.description;
					html += '<br/><strong>Line:</strong><br/>' + violation.line_number;
					html += '<br/><strong>Explanation:</strong><br/>' + violation.explanation;
					html += '<br/><strong>Policy:</strong><br/><a target="_blank" href="https://metacpan.org/module/' + policy + '">' + policy + '</a>';
					html += '<br/><strong>Diagnositcs:</strong><br/>' + violation.diagnostics;
					html += '<br/><br/>';
				}
				$('.results', $perl_critic_dialog).html(html);
				$perl_critic_dialog.modal("show");
			} else {
				humane.log('Your code passed Perl::Critic!');
			}
		});
	});

	$help_search_dialog.on('hidden', function () {
		editor.focus();
	});
	$perl_critic_dialog.on('hidden', function () {
		editor.focus();
	});

	$help_search_dialog.hide();
	$perl_critic_dialog.hide();

	$(".topic").typeahead({
		source : function(query, process) {
			$.ajax({
				type: 'POST',
				url: '/typeahead',
				async: false,
				data: {'query': query},
				success: function(matches) {
					process(matches);
				},
				dataType: 'json',
			});
		}
	}).change(function() {
		_displayHelp($(this).val(), false);
	});;
}

function runOnPerlito(source) {

	var $output = $('#output');
	var $logResult = $("#log-result");

	p5pkg.CORE.print = function(List__) {
		var i;
		for (i = 0; i < List__.length; i++) {
			$output.val( $output.val() + p5str(List__[i]));
		}
		return true;
	};
	p5pkg.CORE.warn = function(List__) {
		var i;
		List__.push("\n");
		for (i = 0; i < List__.length; i++) {
			$logResult.val( $logResult.val() + p5str(List__[i]));
		}
		return true;
	};
	p5pkg["main"]["v_^O"] = "browser";
	p5pkg["main"]["Hash_INC"]["Perlito5/strict.pm"] = "Perlito5/strict.pm";
	p5pkg["main"]["Hash_INC"]["Perlito5/warnings.pm"] = "Perlito5/warnings.pm";

	$logResult.val('');
	$output.val('');
	try {
		// Compile Perl 5 source code into JavaScript
		$logResult.val($logResult.val() + "Compiling.\n");
		var start = new Date().getTime();
		var js_source = p5pkg["Perlito5"].compile_p5_to_js([source]);
		$logResult.val($logResult.val() + "Compilation time: " + (new Date().getTime() - start) + "ms\n");

		// Run JavaScript inside your browser
		start = new Date().getTime();
		eval(js_source);
		$logResult.val( $logResult.val() + "Running time: " + (new Date().getTime() - start) + "ms\n");
	}
	catch(err) {
		$logResult.val("Error:\n" + err + "\nCompilation aborted.\n");
		//$("#bottom_panel").tabs( "select" , 1 );
	}
}