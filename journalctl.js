const childProcess = require('child_process');
const EventEmitter = require('events');
const util = require('util');
const JSONStream = require('./json-stream.js');

function Journalctl (opts) {
	EventEmitter.call(this);

	// Decode opts
	const args = ['-f', '-o', 'json', '--since', 'now'];
	
	if (opts === undefined) opts = {};
	
	if (opts.identifier) {		
		if (!(opts.identifier instanceof Array)) opts.identifier = [opts.identifier];
		opts.identifier.forEach((f) => args.push('-t', f));		
	}
	
	if (opts.unit) {		
		if (!(opts.unit instanceof Array)) opts.unit = [opts.unit];
		opts.unit.forEach((f) => args.push('-u', f));		
	}
	
	if (opts.filter) {
		if (!(opts.filter instanceof Array)) opts.filter = [opts.filter];
	}

	// Start journalctl
	this.journalctl = childProcess.spawn('journalctl', args);

	// Setup decoder
	const decoder = new JSONStream(opts,(e) => {
		this.emit('event', e);
	});
	this.journalctl.stdout.on('data', (chunk) => {
		decoder.decode(chunk.toString());
	});
}

util.inherits(Journalctl, EventEmitter);

Journalctl.prototype.stop = function (cb) {
	// Kill the process
	if (cb) this.journalctl.on('exit', cb);
	this.journalctl.kill();
};

module.exports = Journalctl;
