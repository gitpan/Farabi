package Farabi::Controller;
use Mojo::Base 'Mojolicious::Controller';

our $VERSION = '0.01';

use Config;

# Taken from Padre::Plugin::PerlCritic
sub perl_critic {
	my $self = shift;
	my $source = $self->param('source');

	my @violations;

	# Check for problems
	unless ( defined $source ) {
		$self->render( json => \@violations );
		return;
	}

	# Hand off to Perl::Critic
    require Perl::Critic;
    @violations = Perl::Critic->new->critique( \$source );
 	$self->render( json => \@violations );
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

	return $self->render( json => \%result );;
}

sub help_search {
	my $self = shift;
	my $topic = $self->param('topic') // '';

	require File::Spec;
	my $pod_path = File::Spec->catfile($Config{archlibexp}, 'pods');
	my $pod_index_filename = 'index.txt';
	unless ( -f $pod_index_filename ) {

		# Create an index
		say "Creating POD index";
		require Pod::Index::Builder;
		my $p     = Pod::Index::Builder->new;
		require File::Glob;
		my @files = File::Glob::glob($pod_path, '*.pod');
		my $t0    = time;
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
			if($podname =~ /^.+::(.+?)$/) {
				$podname = File::Spec->catfile($pod_path, "$1.pod");
			}
			return $podname;
		}
	);

	my @results = $q->search($topic);
	my @help_results;
	for my $r (@results) {
		next if $r->podname =~ /perltoc/;
		push @help_results, {
			'podname' => $r->podname,
			'line'    => $r->line,
			'pod'     => $r->pod,
		};
	}

	$self->render( json => \@help_results );
}

sub default {
	my $self = shift;

	# Render template "controller/default.html.ep"
	$self->render;
}

1;
