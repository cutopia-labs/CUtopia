isProd=${NODE_ENV:-development}

for d in $(find . -type f -name 'package.json' | grep -v "node_modules" | sed -r 's|/[^/]+$||'); do
  # If the dir is nested in built directory, continue
  if [[ $d = */lib/* ]] || [[ $d = */build/* ]]; then
    # echo "Skipped output dir in $d"
    continue
  fi
  if [ -d "$d/node_modules" ]; then
    echo "Removing node_modules in $d"
    rm -rf $d/node_modules
  fi
  echo "Installing package in $d"
  if [ $isProd = "production" ]; then
    yarn --cwd $d install --prod
  else
    yarn --cwd $d install
  fi
  # Build the mongodb for lambda to install it
  if [ $d = "./mongodb" ]; then
    echo "Building mongodb"
    yarn --cwd $d build
  fi
done
