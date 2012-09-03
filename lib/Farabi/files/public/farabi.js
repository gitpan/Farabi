/**
 * Starts Farabi... :)
 */
function StartFarabi(editorId) {

	function winHeight() {
		return window.innerHeight || (document.documentElement || document.body).clientHeight;
	}
	function goFullScreen(cm) {
		var wrap = cm.getWrapperElement(), scroll = cm.getScrollerElement();
		wrap.className += " CodeMirror-fullscreen";
		scroll.style.height = winHeight() + "px";
		document.documentElement.style.overflow = "hidden";
		cm.refresh();
	}
	CodeMirror.connect(window, "resize", function() {
		var showing = document.body.getElementsByClassName("CodeMirror-fullscreen")[0];
		if (!showing) return;
		showing.CodeMirror.getScrollerElement().style.height = winHeight() + "px";
	});

	$("#theme_selector").change(function() {
		var $selectedTheme = $(":selected", this);
		editor.setOption("theme", $selectedTheme.val());
		humane.log("Mode changed to " + $selectedTheme.html());
	});

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

	var jsResultEditor = CodeMirror.fromTextArea(document.getElementById("js-result"), {
		lineNumbers: true,
		matchBrackets: true,
		readOnly: true,
	});
	changeMode(jsResultEditor, 'javascript');
	
	var editor = CodeMirror.fromTextArea(document.getElementById(editorId), {
		lineNumbers: true,
		matchBrackets: true,
		tabSize: 4,
		indentUnit: 4,
		indentWithTabs: true,
		extraKeys: {
			"F1": function(cm) {
				var selection = cm.getSelection();
				if(selection) {
					humane.log("The following is selected: '" + selection + "'");
				} else {
					humane.log("No selection found!");
				}
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

	// Farabi should be fullscreen
	goFullScreen(editor);

	// Highlight active line
	var hlLine = editor.setLineClass(0, "activeline");

	// Cache dialog jQuery references for later use
	var $actions_dialog = $("#actions_dialog");
	var $output_dialog = $("#output_dialog");
	var $options_dialog = $("#options_dialog");

	$("#run_in_browser_button").click(function() {
		$actions_dialog.dialog("close");
		$output_dialog.dialog("open");
		runOnPerlito(jsResultEditor, editor.getValue());
		humane.log("Run in browser finished");
	}).button();

	$("#perl_tidy_button").click(function() {
		$.post('/perl_tidy', {"source": editor.getValue()}, function(data) {
			$actions_dialog.dialog("close");
			if(data.error == '') {
				editor.setValue(data.source);
				humane.log("Your code is tidied!");
			} else {
				$output.val('Error:\n' + data.error);
				humane.log("Perl::Tidy failed! Please check output");
			}
		});
	}).button();

	$("#perl_critic_button").click(function() {
		$.post('/perl_critic', {"source": editor.getValue()}, function(violations) {
			$actions_dialog.dialog("close");
			if(violations.length > 0) {
				$output.val(violations.join('\n'));
			} else {
				humane.log('Your code passed Perl::Critic!');
			}
		});
	}).button();

	

	$("#run_button").click(function() { 
		humane.log("Not implemented yet!");
	}).button().hide();
	
	$("#open_button").click(function() {
		humane.log("Not implemented yet!");
	}).button().hide();

	$("#save_button").click(function() {
		humane.log("Not implemented yet!");
	}).button().hide();
	
	$("#save_as_button").click(function() {
		humane.log("Not implemented yet!");
	}).button().hide();

	$("#output_tabs").tabs();
	$output_dialog.dialog({autoOpen: false, title: "Output", width: 500});
	$options_dialog.dialog({autoOpen: false, title: "Options"});
	$actions_dialog.dialog({autoOpen: false, title: "Actions"});
	$("#help_dialog").dialog({autoOpen: false});

	$("#js-result + .CodeMirror").css("width", "100%");
	$("#editor + .CodeMirror").css("box-shadow", "0px 0px 81px 11px gray");

	$("#options_dialog_selector").mouseover(function() {
		$(this).animate({
			opacity: 1.0,
		});
		humane.log("Options provides a way to configure Farabi");
	}).mouseout(function() {
		humane.remove();
		$(this).animate({opacity: 0.3});
	}).click(function() {
		$("div").dialog("close");
		$options_dialog.dialog("open");
	});
	$("#actions_dialog_selector").mouseover(function() {
		$(this).animate({
			opacity: 1.0,
		});
		humane.log("Actions that you can do with Farabi");
	}).mouseout(function() {
		humane.remove();
		$(this).animate({opacity: 0.3});
	}).click(function() {
		$("div").dialog("close");
		$actions_dialog.dialog("open");
	});
	$("#output_dialog_selector").mouseover(function() {
		$(this).animate({
			opacity: 1.0,
		});
		humane.log("Output stores stuff that needs to be reviewed");
	}).mouseout(function() {
		humane.remove();
		$(this).animate({opacity: 0.3});
	}).click(function() {
		$("div").dialog("close");
		$output_dialog.dialog("open");
	});

}

function runOnPerlito(jsResultEditor, source) {

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
	jsResultEditor.setValue('');
	$output.val('');
	try {
		// Compile Perl 5 source code into JavaScript
		$logResult.val($logResult.val() + "Compiling.\n");
		var start = new Date().getTime();
		var js_source = p5pkg["Perlito5"].compile_p5_to_js([source]);
		$logResult.val($logResult.val() + "Compilation time: " + (new Date().getTime() - start) + "ms\n");
		jsResultEditor.setValue(js_source + ";\n");
		jsResultEditor.setOption("mode", jsResultEditor.getOption("mode"))

		// Run JavaScript inside your browser
		start = new Date().getTime();
		eval(js_source);
		$logResult.val( $logResult.val() + "Running time: " + (new Date().getTime() - start) + "ms\n");
	}
	catch(err) {
		$logResult.val("Error:\n" + err + "\nCompilation aborted.\n");
		$("#bottom_panel").tabs( "select" , 1 );
	}
}