# known issue with mangled logs:
# https://github.com/aws/aws-sam-cli/issues/1359#issuecomment-744469252
tail -f local.log | \
  grep -oP "((INFO)|(DEBUG)|(WARN)|(ERROR)|(\* Running on)).*" --line-buffered | \
  tr "\r" "\n"
