desc 'Start Jekyll server and watch Sass files'
task :s do
  puts 'Starting the Jekyll server and watching Sass files.'
  jekyllPid = Process.spawn('jekyll s --livereload')
  sassPid = Process.spawn('sass --watch css/scss:css --style compressed')

  trap('INT') {
    [jekyllPid, sassPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, sassPid].each { |pid| Process.wait(pid) }
end

task :deploy do
  #sh 'echo "tecmogeek.com\n">CNAME'
  sh 'git init'
  #sh 'git add .'
  sh 'git commit -am "Deploy site"'
  #sh 'git remote add origin git@github.com:ubuwaits/tecmogeek-production.git'
  #sh 'git checkout -b gh-pages'
  sh 'git push -u origin gh-pages --force'
  puts 'Site deployed to production'
end
