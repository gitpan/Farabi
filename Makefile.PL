use strict;
use warnings;

use ExtUtils::MakeMaker;

WriteMakefile(
	NAME          => 'Farabi',
	VERSION_FROM  => 'lib/Farabi.pm',
	ABSTRACT_FROM => 'lib/Farabi.pm',
	AUTHOR        => 'Ahmad M. Zawawi <ahmad.zawawi@gmail.com>',
	PREREQ_PM     => {
		'Mojolicious'  => '3.36',
		'Pod::Index'   => '0.14',
		'Perl::Tidy'   => '20120714',
		'Perl::Critic' => '1.118',
	},
	EXE_FILES  => ['script/farabi'],
	test       => { TESTS => 't/*.t' },
	META_MERGE => {
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
