
cd ./node_modules/osx-mouse
node-gyp configure
node-gyp rebuild --target=1.7.8 --arch=x64 --dist-url=https://atom.io/download/atom-shell

cd ../../dist/node_modules/osx-mouse
node-gyp configure
node-gyp rebuild --target=1.7.8 --arch=x64 --dist-url=https://atom.io/download/atom-shell
