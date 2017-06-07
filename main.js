var electron = require('electron');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
electron.crashReporter.start({companyName: 'ACME'})

// spawn webpack dev server
var exec = require('child_process').fork;
exec('./node_modules/.bin/webpack-dev-server');


app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
      width: 1360, height: 800
  });

  mainWindow.loadURL('file://' + __dirname + '/public/index.html');
  // mainWindow.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

});
