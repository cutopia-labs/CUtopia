git filter-branch --tree-filter "rm -rf $1" --prune-empty HEAD
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
echo $1/ >> .gitignore
git add .gitignore
git commit -m "Removing $1 from git history"
git gc
