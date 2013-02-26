
use strict;
use warnings;

use 5.010001;

use ExtUtils::MakeMaker 6.30;



my %WriteMakefileArgs = (
  "ABSTRACT" => "Modern Perl IDE",
  "AUTHOR" => "Ahmad M. Zawawi <ahmad.zawawi\@gmail.com>",
  "BUILD_REQUIRES" => {
    "Test::EOL" => "1.5",
    "Test::MinimumVersion" => "0.101080",
    "Test::More" => "0.98"
  },
  "CONFIGURE_REQUIRES" => {
    "ExtUtils::MakeMaker" => "6.30"
  },
  "DISTNAME" => "Farabi",
  "EXE_FILES" => [
    "bin/farabi"
  ],
  "LICENSE" => "perl",
  "NAME" => "Farabi",
  "PREREQ_PM" => {
    "Capture::Tiny" => "0.21",
    "Code::CutNPaste" => "0.04",
    "DBD::SQLite" => "1.37",
    "DBIx::Simple" => "1.35",
    "File::Find::Rule" => "0.33",
    "File::HomeDir" => "1.00",
    "File::Which" => "1.09",
    "IO::String" => "1.08",
    "IPC::Run" => "0.92",
    "Module::Pluggable" => "4.5",
    "Module::Starter" => "1.60",
    "Mojolicious" => "3.87",
    "Moo" => "1.000008",
    "Parse::ErrorString::Perl" => "0.15",
    "Path::Tiny" => "0.013",
    "Perl::Critic" => "1.118",
    "Perl::Tidy" => 20121207
  },
  "VERSION" => "0.41",
  "test" => {
    "TESTS" => "t/*.t"
  }
);


unless ( eval { ExtUtils::MakeMaker->VERSION(6.56) } ) {
  my $br = delete $WriteMakefileArgs{BUILD_REQUIRES};
  my $pp = $WriteMakefileArgs{PREREQ_PM};
  for my $mod ( keys %$br ) {
    if ( exists $pp->{$mod} ) {
      $pp->{$mod} = $br->{$mod} if $br->{$mod} > $pp->{$mod};
    }
    else {
      $pp->{$mod} = $br->{$mod};
    }
  }
}

delete $WriteMakefileArgs{CONFIGURE_REQUIRES}
  unless eval { ExtUtils::MakeMaker->VERSION(6.52) };

WriteMakefile(%WriteMakefileArgs);



