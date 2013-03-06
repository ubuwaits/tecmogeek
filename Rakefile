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

task :deploy do
  sh 'echo "tecmogeek.com\n">CNAME'
  sh 'git init'
  sh 'git add .'
  sh 'git commit -m "Deploy site"'
  sh 'git remote add origin git@github.com:ubuwaits/tecmogeek-production.git'
  sh 'git checkout -b gh-pages'
  sh 'git push -u origin gh-pages --force'
  puts 'Site deployed to production'
end

