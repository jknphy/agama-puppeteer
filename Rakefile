#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require "fileutils"
require "yast/rake"

Rake::Task["install"].clear
task :install do
    integrationdir = "/usr/share/agama/integration-tests"
    destdir = ENV.has_key?( "DESTDIR" ) ? ENV["DESTDIR"] : integrationdir
    testdir = File.join(destdir, integrationdir)

    puts "Installing the integration tests at #{testdir} folder..."
    FileUtils.mkdir_p(testdir)
    FileUtils.cp_r("build", testdir)
end
