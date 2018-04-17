'use strict'

let Rworker = require('./Rworker').Rworker;

// to tweak following your system
let workers = 8;

let pool = [];

let current_worker = 0;

let verbose = true;

let init_script = "";

const log = console.error.bind(console, "[pool.js] ");

const trace = (blabla) => {
	if(verbose) log(blabla);
};

// init Rworker pool
module.exports.init = (nbworkers, script, cb) => {
	workers = nbworkers ;
	let todo = workers ;
	for(let i = 0 ; i < workers ; i++){
		let worker = new Rworker(i);
		try {
			if(script){
				init_script = script ;
				worker.Rexec(script, (err, res) => {
					if(err) throw err ;
					else{
						trace("Worker #" + i + " ready to work");
						pool.push(worker);
						todo-- ;
					}
				});
			}else{
				trace("Worker #" + i + " ready to work");
				pool.push(worker);
				todo-- ;
			}
		}catch(e){
			console.error(e);
			cb(e, false);
			break ;
		}
		if(todo === 0) cb(null, true);
	}
}

module.exports.submit_job = (cmd, cb) => {

	try {
		let i = current_worker++ % workers ;
		let worker = pool[i];
		trace("Worker #" + worker.id + " will handle the job");
		worker.Rexec(cmd, (err, res) => {
			if(err){
				trace("Worker #" + worker.id + " went wrong...");
				let neworker = new Rworker(worker.id);
				try {
					let script = init_script || ""
					neworker.Rexec(script, (err, res) => {
						if(err) throw err ;
						else{
							trace("Worker #" + neworker.id + " ready to work")
							pool[i] = neworker
							trace("Worker #" + neworker.id + " resurrected")
						}
					});
				}
				catch(e){
					console.error("Error while resurrecting worker #" + worker.id)
					console.error(e);
					err["spawn error"] = e ;
					pool.splice(worker.id, 1);
				}

				cb(err, null);
			}else {
				trace("Worker #" + worker.id + " returned " + res);
				cb(null, res);
			}
		});
	}catch(e){
		console.error(e);
		cb(e, null);
	}
}
