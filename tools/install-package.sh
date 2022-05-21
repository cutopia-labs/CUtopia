isProd=${NODE_ENV:-development}

for d in $(find . -type f -name 'package.json' | grep -v "node_modules" | sed -r 's|/[^/]+$||'); do
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
done
