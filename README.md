THIS IS A WIP, PLEASE DO NOT USE RIGHT NOW!!

robota.js
===========

### Easy Web Worker parralel task management for Javascript
*******

Robota's goal is to manage multi-task jobs in JS with ease. Currently it is designed for browser use only. As it uses Webworkers (When possible) it also provides parallel computing of those tasks AND it does not block the UI from updating whilst those tasks are being processed.

Robota takes in an array of data, this can be anything you wish, strings, numbers, arrays, objects. Robota will iterate through this array, processing each item, which we call 'units'. You provide a Worker for this array to be processed with (.js file path, OR function reference). You can also specify callbacks for each units completion and the job completion. When the job is complete, an array is passed back, with the results in.

# Usage

#### var robot = new robota(jobObject)`
This will construct a new robota for you. Once constructed, you can either set its paramaters individually before letting it rip, or supply all of them in via the optional jobObject.

*Job object Arguments*
* `worker`: This can either be the path (string) to a Webworker .js file, or a Function reference (see notes on this below).
* `workData` : An array of data to be worked on.
  * `unitCompletionCallback` : (optional) A Function reference for a Callback to be executed as each unit of work is completed.
  * `jobCompletionCallback` : (optional) A Function reference for a Callback to be executed when all of the units have been processed and the job is complete.

  


# Installation
Just download the src .zip from this page. You'll need to reference this file in your documents head

robota.js

Only `robota.js` is required for the core functionality.

`/js/core-estimator.min.js` is a polyfill for browsers that do not support `navigator.getHardwareConcurrency`. This browser property is required to allow Robota to calculate the maximum number of cores available. I'd highly recommend using it, to get the most cores on the task.

`/js/worker.js` will give you a polyfill for Workers in browsers that do not support them. Its an iFrame based approach that will at least make the same code execute as expected.

*Example*
Here is an example of creating a new robota and assigning the worker, data and callbacks.
```javascript
var bot = new robota({
			worker:tests.workUnitWorker,
			workData:tests.aForty,
			unitCompletionCallback:unitCompleteCB,
			jobCompletionCallback:jobCompleteCB
	});
```

When instantiated in this way, the new robota object will check if it has a valid `worker` and `workData` array passed in and will immediately exectute all work units if it does. 

If you passed in a `unitCompleteCallback it` is called as each unit is completed, being passed the result from the worker.

When all the tasks are complete, they are available in .workUnitsResults and this is passed into `jobCompletionCallback` if you defined it. 



