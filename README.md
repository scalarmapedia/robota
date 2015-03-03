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



The object returned by the `Parallel` constructor is meant to be chained, so you can produce a chain of 
operations on the provided data.

*Arguments*
* `data`: This is the data you wish to operate on. Will often be an array, but the only restrictions are that your values are serializable as JSON.
* `options` (optional): Some options for your job
  * `evalPath` (optional): This is the path to the file eval.js. This is required when running in node, and required for some browsers (IE 10) in order to work around cross-domain restrictions for web workers. Defaults to the same location as parallel.js in node environments, and `null` in the browser.
  * `maxWorkers` (optional): The maximum number of permitted worker threads. This will default to 4, or the number of cpus on your computer if you're running node
  * `synchronous` (optional): If webworkers are not available, whether or not to fall back to synchronous processing using `setTimeout`. Defaults to `true`.
  * 
# Installation
Just download the src .zip from this page. You'll need to reference these files in your documents head

worker.js
core-estimator.min.js
robota.js

Note: ONLY robota.js is required for the core functionality. including worker.js will give you a polyfill for Workers in browsers that do not support them. core-estimator is a polyfill for browsers that do not support `navigator.getHardwareConcurrency` , which is required to allow Robota to calculate the maximum number of cores available to the browser.


