#!/bin/sh

CHANGED=$(git status -s)

if [ ! -z "$CHANGED" ]; then
    echo "There're files to commit! deploy aborted!"
    exit 1;
fi

# NODE_ENV=production npm run build

echo $CHANGED