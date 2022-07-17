isProd=${NODE_ENV:-development}

declare -a modules=(
  "./"
  "./mongodb"
  "./lambda/emailer"
  "./lambda/graphql"
  "./lambda/cron-remove-timetable"
  "./lambda/cron-update-ranking"
  "./tools/load-test"
)

for d in "${modules[@]}"; do
  if [ -d "$d/node_modules" ]; then
    echo "Removing node_modules in $d"
    rm -rf $d/node_modules
  fi

  echo "Installing node_modules in $d"
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
