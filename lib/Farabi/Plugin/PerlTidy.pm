package Farabi::Plugin::PerlTidy;
{
  $Farabi::Plugin::PerlTidy::VERSION = '0.37';
}

# ABSTRACT: Perl::Tidy support for Farabi

use Moo;

# Plugin module dependencies
has 'deps' => (
	is      => 'ro',
	default => sub {
		[ 'Perl::Tidy' => '20120714', ];
	}
);
s
# Plugin's name
has 'name' => (
	is      => 'ro',
	default => sub {
		'Perl::Tidy support';
	}
);

1;

__END__

=pod

=head1 NAME

Farabi::Plugin::PerlTidy - Perl::Tidy support for Farabi

=head1 VERSION

version 0.37

=head1 AUTHOR

Ahmad M. Zawawi <ahmad.zawawi@gmail.com>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2013 by Ahmad M. Zawawi.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
