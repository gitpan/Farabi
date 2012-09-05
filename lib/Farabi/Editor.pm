package Farabi::Editor;
use Mojo::Base 'Mojolicious::Controller';

our $VERSION = '0.05';

use Config;

# Taken from Padre::Plugin::PerlCritic
sub perl_critic {
	my $self   = shift;
	my $source = $self->param('source');

	# Check for problems
	unless ( defined $source ) {
		$self->render( json => [] );
		return;
	}

	# Hand off to Perl::Critic
	require Perl::Critic;
	my @violations = Perl::Critic->new->critique( \$source );

	my @results;
	for my $violation (@violations) {
		push @results,
			{
			policy      => $violation->policy,
			line_number => $violation->line_number,
			description => $violation->description,
			explanation => $violation->explanation,
			diagnostics => $violation->diagnostics,
			};
	}

	$self->render( json => \@results );
}

# Taken from Padre::Plugin::PerlTidy
# TODO document it in 'SEE ALSO' POD section
sub perl_tidy {
	my $self   = shift;
	my $source = $self->param('source');

	my %result = (
		'error'  => '',
		'source' => '',
	);

	# Check for problems
	unless ( defined $source ) {
		$self->render( json => \%result );
		return;
	}

	my $destination = undef;
	my $errorfile   = undef;
	my %tidyargs    = (
		argv        => \'-nse -nst',
		source      => \$source,
		destination => \$destination,
		errorfile   => \$errorfile,
	);

	# TODO: suppress the senseless warning from PerlTidy
	eval {
		require Perl::Tidy;
		Perl::Tidy::perltidy(%tidyargs);
	};

	if ($@) {
		$result{error} = "PerlTidy Error:\n" . $@;
	}

	if ( defined $errorfile ) {
		$result{error} .= "\n$errorfile\n";
	}

	$result{source} = $destination;

	return $self->render( json => \%result );
}

# i.e. Autocompletion
sub typeahead {
	my $self = shift;
	my $query = quotemeta( $self->param('query') // '' );

	my %items;
	if ( open my $fh, '<', 'index.txt' ) {
		while (<$fh>) {
			$items{$1} = 1 if /^(.+?)\t/;
		}
		close $fh;
	}

	my @matches;
	for my $item ( keys %items ) {
		if ( $item =~ /$query/ ) {
			push @matches, $item;
		}
	}

	return $self->render( json => \@matches );
}

sub help_search {
	my $self = shift;
	my $topic = $self->param('topic') // '';

	# Determine perlfunc POD path
	require File::Spec;
	my $pod_path;
	for my $path (@INC) {
		for (qw(pod pods)) {
			if ( -e File::Spec->catfile( $path, $_, 'perlfunc.pod' ) ) {
				$pod_path = File::Spec->catfile( $path, $_ );
				last;
			}
		}
	}

	# TODO improve this check...
	return unless defined $pod_path;

	my $pod_index_filename = 'index.txt';
	unless ( -f $pod_index_filename ) {

		# Create an index
		say "Creating POD index";
		require Pod::Index::Builder;
		my $p = Pod::Index::Builder->new;
		require File::Glob;
		my @files = File::Glob::glob( File::Spec->catfile( $pod_path, '*.pod' ) );
		my $t0 = time;
		for my $file (@files) {
			say "Parsing $file";
			$p->parse_from_file($file);
		}
		say "Job took " . ( time - $t0 ) . " seconds";
		$p->print_index($pod_index_filename);
	}

	# Search for a keyword in the file-based index
	require Pod::Index::Search;
	my $q = Pod::Index::Search->new(
		filename => $pod_index_filename,
		filemap  => sub {
			my $podname = shift;
			if ( $podname =~ /^.+::(.+?)$/ ) {
				$podname = File::Spec->catfile( $pod_path, "$1.pod" );
			}
			return $podname;
		}
	);

	my @results = $q->search($topic);
	my @help_results;
	for my $r (@results) {
		next if $r->podname =~ /perltoc/;
		my $podname = $r->podname;
		$podname =~ s/^.+::(.+)$/$1/;
		push @help_results,
			{
			'podname' => $podname,
			'context' => $r->context,
			'html'    => _pod2html( $r->pod ),
			};
	}

	$self->render( json => \@help_results );
}

sub _pod2html {
	my $pod = shift;

	require Pod::Simple::XHTML;
	my $psx = Pod::Simple::XHTML->new;
	$psx->no_errata_section(1);
	$psx->no_whining(1);
	$psx->output_string( \my $html );
	$psx->parse_string_document($pod);

	return $html;
}

sub default {
	my $self = shift;

	# Render template "editor/default.html.ep"
	$self->render;
}

1;
