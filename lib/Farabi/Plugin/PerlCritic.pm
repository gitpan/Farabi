package Farabi::Plugin::PerlCritic;

use Moo;

# ABSTRACT: Perl::Critic support for Farabi
our $VERSION = '0.45'; # VERSION

# Plugin module dependencies
has 'deps' => (
	is      => 'ro',
	default => sub {
		[ 'Perl::Critic' => '1.118', ];
	}
);

# Plugin's name
has 'name' => (
	is      => 'ro',
	default => sub {
		'Perl::Critic support';
	}
);

1;

__END__

=pod

=encoding UTF-8

=head1 NAME

Farabi::Plugin::PerlCritic - Perl::Critic support for Farabi

=head1 VERSION

version 0.45

=head1 AUTHOR

Ahmad M. Zawawi <ahmad.zawawi@gmail.com>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2014 by Ahmad M. Zawawi.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
