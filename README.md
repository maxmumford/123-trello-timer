TIMEY
=====

Timey lets you record your time spent on trello cards and then mark your timesheets as invoiced.

It's built with Electron and Angular 5 and based on [this repo](https://github.com/maximegris/angular-electron).

Development
-----------

After cloning you'll need to rebuild osx-mouse using your version of node. Run the below commands in the `./node_modules/osx-mouse` and `./dist/node_modules/osx-mouse` directories:

 - `node-gyp configure`
 - `node-gyp rebuild --target=1.7.8 --arch=x64 --dist-url=https://atom.io/download/atom-shell`

Make sure the --target property has the correct version of electron from package.json.
