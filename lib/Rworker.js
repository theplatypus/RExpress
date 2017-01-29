'use strict'
const spawn = require('child_process').spawn;

let verbose = false;

const log = console.error.bind(console, "[Rworker.js] ")

const trace = (blabla) => {
	if(verbose) log(blabla);
};

module.exports.Rworker = class {

	constructor(id){
		this.id = id;
		this.thread = [];
		this.R = spawn('R', ['--vanilla']);

		this.R.on('error', (err) => {
			console.log('Failed to start child R process.');
		});

		this.R.on('close', (code) => {
			console.log(`R process exited with code ${code}`);
		});

		this.R.stdout.on('end', () => {
			console.log('----------------/');
		});

		this.R.stdout.on('data', (data) => {

			data = data.toString('utf8');

			trace('(#' + this.id + ') ' + 'R>> ' + data);

			if(!this.thread[0]) trace('(#' + this.id + ') ' + 'R> ' + data); //start screen
			else{
				let task = this.thread[0];
				task.output += data ;
				if(data.startsWith('> ') || data.endsWith('> ')){ // previous exec is done
					data = task.output ;
					// note : sometimes, w/ a lot of concurrent accesses, R return some "blanks lines" like "[1]   "
					// this condition checks wether the result is given or not, and re-tick() if not
					if (data.substring(data.lastIndexOf(']')+1, data.length).trim().length !== 0) {
						trace('(#' + this.id + ') ' + 'R> ' + data);
						task.status = 'done' ;
						task.cb(null, task.output);
					}
					this.tick();
				}
			}
		});
	}

	tick(){
		// clean finished ops
		this.thread = this.thread.filter((task) => (task.status === 'done') ? false : true);
		// starts the next op
		if(this.thread.length > 0){
			trace('(#' + this.id + ') ' + "pushing " + this.thread[0].cmd + " to stdin");
			this.R.stdin.write(this.thread[0].cmd + '\n', 'utf8');
		}else{
			trace('(#' + this.id + ') ' + 'all jobs done');
		}
	}

	Rexec(cmd, cb){
		trace('(#' + this.id + ') ' + "Rexec called with args " + cmd);
		this.thread.push({
			"cmd" : cmd,
			"cb" : cb,
			"output" : "",
			"status" : 'pending'
		});
		this.tick();
	}

}
