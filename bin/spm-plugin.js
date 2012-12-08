#!/usr/bin/env node;

var fs = require('fs');
var commander = require('commander');
var util = require('util');
var path = require('path');
var safeWrite = require('../lib/utils').safeWrite;
require('colorful').colorful();
var plugin = require('../lib/system/plugin');

commander.usage('<command>');

commander
  .command('add <plugin>')
  .description('add a spm plugin')
  .action(plugin.add);

commander
  .command('remove <plugin>')
  .description('remove a spm plugin')
  .action(plugin.remove);

commander
  .command('enable <plugin>')
  .description('enable a spm plugin')
  .action(plugin.enable);

commander
  .command('disable <plugin>')
  .description('disable a spm plugin')
  .action(plugin.disable);

commander
  .command('create')
  .description('create a spm plugin')
  .action(createPlugin);


commander
  .command('help')
  .description('show this help menu')
  .action(function() {
    process.stdout.write(commander.helpInformation());
    commander.emit('--help');
    commander.emit('--more-help');
    process.exit();
  });



commander
  .command('show')
  .description('show all spm plugins')
  .action(plugin.show);

commander.on('--help', function() {
  console.log('  install a plugin by ' + 'npm install'.to.magenta.color);
  console.log();
  console.log('  $ ' + 'npm install '.to.magenta.color + 'spm-init'.to.green.color + ' -g'.to.magenta.color);
  console.log();
});

commander.on('--more-help', function() {
  console.log('  ' + 'Featured Plugins:'.to.bold.blue.color);
  console.log();
  console.log('    ' + '★'.to.grey.color + '  spm-init');
  console.log('    ' + '★'.to.grey.color + '  spm-uglifyjs');
  console.log('    ' + '★'.to.grey.color + '  spm-deploy');
  console.log();
  console.log('    find more plugins on ' + 'https://github.com/spmjs'.to.underline.bold.color);
  console.log();
});

commander.parse(process.argv);

var subcmd = commander.args[0];

if (!subcmd) {
  process.stdout.write(commander.helpInformation());
  commander.emit('--help');
  process.exit();
}

function createPlugin() {
  console.log();
  var version = '1.0.0';
  commander.prompt('  plugin name: ', function(name) {
    if (name.indexOf('spm-') !== 0) {
      name = 'spm-' + name;
    }
    commander.prompt('  plugin description: ', function(description) {
      commander.confirm('  create bin file? ', function(bin) {
        write(name, description, version, bin);
      });
    });
  });
}

function write(name, description, version, bin) {
  // write package
  var package = '{\n  "name": "%s",\n  "version": "%s",\n';
  package += '  "description": "%s",\n  "scripts": {\n';
  package += '    "postinstall": "scripts/post-install.js",\n';
  package += '    "uninstall": "scripts/uninstall.js"\n  }';
  if (bin) {
    package += ',\n  "preferGlobal": "true",\n  "bin": {\n';
    package += util.format('    "%s": "bin/%s"\n  }', name, name);
  }
  package += '\n}';
  package = util.format(package, name, version, description);
  safeWrite(path.join(name, 'package.json'));

  fs.writeFileSync(path.join(name, 'package.json'), package);

  // write scripts
  var file = path.join(name, 'scripts', 'post-install.js');
  safeWrite(file);
  var script = util.format("#!/usr/bin/env node\nrequire('spm').installPlugin('%s')", name);
  fs.writeFileSync(file, script);
  fs.chmodSync(file, 0755);

  script = util.format("#!/usr/bin/env node\nrequire('spm').uninstallPlugin('%s')", name);
  file = path.join(name, 'scripts', 'uninstall.js');
  fs.writeFileSync(file, script);
  fs.chmodSync(file, 0755);

  // write index.js
  if (bin) {
    script = [
      "var spm = require('spm')",
      'exports.registerCommand = function() {',
      "  spm.registerCommand('%s', '%s', '%s')",
      '}'
    ].join('\n');
    script = util.format(script, name.slice(4), name, description);
  } else {
    script = '';
  }
  fs.writeFileSync(path.join(name, 'index.js'), script);

  // write bin
  if (bin) {
    file = path.join(name, 'bin', name);
    safeWrite(file);
    script = "#!/usr/bin/env node\nvar commander = require('commander')\n";
    fs.writeFileSync(file, script);
    fs.chmodSync(file, 0755);
  }

  console.log();
  console.log('plugin ' + name.to.green.color + ' has been created.');
  console.log();
  process.exit();
}
