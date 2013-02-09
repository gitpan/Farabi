package Farabi::Plugin::Debug;

# ABSTRACT: Debugger support for Farabi
use Moo;

# Plugin module dependencies
has 'deps' => (
	is      => 'ro',
	default => sub {
		[ 'Debug::Client' => '0.20', ];
	}
);

# Plugin's name
has 'name' => (
	is      => 'ro',
	default => sub {
		'Perl 5 Debugger';
	}
);

1;

__END__

=pod

=head1 NAME

Farabi::Plugin::Debug - Debugger support for Farabi

=head1 VERSION

version 0.33

=head1 AUTHOR

Ahmad M. Zawawi <ahmad.zawawi@gmail.com>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2013 by Ahmad M. Zawawi.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
