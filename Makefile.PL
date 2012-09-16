use strict;
use warnings;

use ExtUtils::MakeMaker;

WriteMakefile(
	NAME          => 'Farabi',
	VERSION_FROM  => 'lib/Farabi.pm',
	ABSTRACT_FROM => 'lib/Farabi.pm',
	AUTHOR        => 'Ahmad M. Zawawi <ahmad.zawawi@gmail.com>',
	PREREQ_PM     => {
		'IO::String'   => '1.08',
		'Mojolicious'  => '3.36',
		'Perl::Critic' => '1.118',
		'Perl::Tidy'   => '20120714',
		'Pod::Index'   => '0.14',
		'Pod::Parser'  => '1.51',
	},
	EXE_FILES  => ['bin/farabi'],
	test       => { TESTS => 't/*.t xt/*.t' },
	META_MERGE => {
		requires => { perl => '5.010001' },
		no_index => {
			directory => [ 't', 'xt', 'eg', 'share', 'inc' ],
		},
		resources => {
			license    => 'http://dev.perl.org/licenses/',
			homepage   => 'http://code.google.com/p/farabi/',
			bugtracker => 'http://code.google.com/p/farabi/issues/list',
			repository => 'http://farabi.googlecode.com/svn/trunk/',
		},
	},
);
