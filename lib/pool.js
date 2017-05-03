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
		let worker = pool[current_worker];
		worker.Rexec(cmd, (err, res) => {
			if(err){
				trace("Worker #" + current_worker + " went wrong...");

				let worker = new Rworker(current_worker);
				try {
					if(init_script){
						worker.Rexec(init_script, (err, res) => {
							if(err) throw err ;
							else{
								trace("Worker #" + current_worker + " ready to work");
							}
						});
					}else{
						trace("Worker #" + current_worker + " ready to work");
					}
					pool[current_worker] = worker ;
					trace("Worker #" + current_worker + " resurrected")
				}
				catch(e){
					console.error("Error while resurrecting worker #" + current_worker)
					console.error(e);
					err["spawn error"] = e ;
					pool.splice(current_worker, 1);
				}

				cb(err, null);
			}else {
				trace("Worker #" + current_worker + " returned " + res);
				cb(null, res);
			}
		});
	}catch(e){
		console.error(e);
		cb(e, null);
	}finally{
		current_worker = (current_worker + 1) % workers ;
	}
}
