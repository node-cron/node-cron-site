#!/bin/sh

CHANGED=$(git status -s)

if [ ! -z "$CHANGED" ]; then
    echo "There're files to commit! deploy aborted!"
    exit 1;
fi

NODE_ENV=production npm run build

cd dist
git add --all
git commit -m "new release"
git push origin master

cd ..
git add --all
git commit -m "new release"
git push origin HEAD

echo "deployed!"