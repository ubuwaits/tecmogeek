desc 'Start Jekyll server and watch Sass/Bourbon files'
task :server do
  puts "Starting the Jekyll server and watching Sass files."
  jekyllPid = Process.spawn('jekyll --server')
  sassPid = Process.spawn('sass --watch stylesheets/scss:stylesheets -r ./stylesheets/scss/bourbon/lib/bourbon.rb')

  trap("INT") {
    [jekyllPid, sassPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, sassPid].each { |pid| Process.wait(pid) }
end
