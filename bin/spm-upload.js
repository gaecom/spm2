#!/usr/bin/env node;

var commander = require('commander');
require('colorful').colorful();
var logging = require('../lib/spm').logging;
var uploader = require('../lib/core/upload');

commander.usage('[options] name');

commander
  .option('-u, --username <username>', 'default value from user.username')
  .option('-p, --password <password>', 'default value from user.password')
  .option('-s, --source <source>', 'default value will be the first source')
  .option('-f, --force', 'force to upload an exists module')
  .option('--release', 'module is stable for release')
  .option('-v, --verbose', 'show more logs')
  .option('-q, --quiet', 'show less logs');

commander
  .command('help')
  .description('show this help menu')
  .action(function() {
    process.stdout.write(commander.helpInformation());
    commander.emit('--help');
    process.exit();
  });


commander.on('--help', function() {
  console.log();
  console.log('  ' + 'Examples:'.to.bold.blue.color);
  console.log();
  console.log('   upload a standard cmd module is simple');
  console.log('   $ ' + 'spm upload'.to.magenta.color);
  console.log();
  console.log('   upload to a specified source');
  console.log();
  console.log('   $ ' + 'spm upload '.to.magenta.color + '-s'.to.cyan.color + ' arale');
  console.log();
});

commander.parse(process.argv);

// verbose vs quiet
logging.config(commander);

// run install
uploader.run(commander);
