package Farabi;
use Mojo::Base 'Mojolicious';

use File::Basename 'dirname';
use File::Spec::Functions 'catdir';

our $VERSION = '0.03';

sub startup {
	my $app = shift;

	# Use content from directories under lib/Farabi/files
	$app->home->parse(catdir(dirname(__FILE__), 'Farabi'));
	$app->static->paths->[0] = $app->home->rel_dir('files/public');
	$app->renderer->paths->[0] = $app->home->rel_dir('files/templates');

	my $route  = $app->routes;
	$route->get('/')->to('controller#default');
	$route->post('/help_search')->to('controller#help_search');
	$route->post('/perl_tidy')->to('controller#perl_tidy');
	$route->post('/perl_critic')->to('controller#perl_critic');
}

1;
__END__

=pod

=head1 NAME

Farabi - A web-based Perl editor

=head1 SYNOPSIS

  # Run as a seperate Farabi webserver
  $ farabi daemon
  

=head1 DESCRIPTION

This is a web-based Perl editor that runs inside your favorite modern
browser.

Please run the following command automatically:

  farabi daemon

Open http://127.0.0.1:3000/ in your favourite modern browser

=head1 SUPPORT

If you find a bug, please report it in:

L<http://code.google.com/p/farabi/issues/list>

If you find this module useful, please rate it in:

L<http://cpanratings.perl.org/d/Farabi>

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicio.us>.

=head1 AUTHOR

Ahmad M. Zawawi <ahmad.zawawi@gmail.com>

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2012 by Ahmad M. Zawawi

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
