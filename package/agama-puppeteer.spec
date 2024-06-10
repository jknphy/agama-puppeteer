#
# spec file for package agama-puppeteer
#
# Copyright (c) 2024 SUSE LLC
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via https://bugs.opensuse.org/
#

Name:           agama-puppeteer
Version:        0
Release:        0
Summary:        Puppeteer tests for the Agama installer
License:        GPL-2.0-only
URL:            https://github.com/openSUSE/agama
# source_validator insists that if obscpio has no version then
# tarball must neither
Source0:        agama.tar
Source10:       package-lock.json
Source11:       node_modules.spec.inc
Source12:       node_modules.sums
%include %_sourcedir/node_modules.spec.inc
BuildArch:      noarch
BuildRequires:  fdupes
BuildRequires:  local-npm-registry
Requires:       nodejs(engine) >= 18

%description
Experimental integration tests for the Agama installer using the Puppeteer
framework.

%prep
%autosetup -p1 -n agama

%build
rm -f package-lock.json
PUPPETEER_SKIP_DOWNLOAD=true local-npm-registry %{_sourcedir} install --omit=optional --with=dev --legacy-peer-deps || ( find ~/.npm/_logs -name '*-debug.log' -print0 | xargs -0 cat; false)

%install
install -D -d -m 0755 %{buildroot}%{_datadir}/agama/puppeteer
cp -aR node_modules %{buildroot}%{_datadir}/agama/puppeteer
cp -aR %{_builddir}/agama/tests %{buildroot}%{_datadir}/agama/puppeteer
cp -a %{_builddir}/agama/package.json %{buildroot}%{_datadir}/agama/puppeteer
install -D -d -m 0755 %{buildroot}%{_bindir}
cp -a %{_builddir}/agama/agama-puppeteer %{buildroot}%{_bindir}

# symlink duplicate files
%fdupes -s %{buildroot}/%{_datadir}/agama/puppeteer

%files
%defattr(-,root,root,-)
%doc README.md
%dir %{_datadir}/agama
%{_datadir}/agama/puppeteer
%attr(0755,root,root) %{_bindir}/agama-puppeteer

%changelog
