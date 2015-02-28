
robota = function(args)
{
	
	this.workUnits = [];
	this.workUnitsResults = [];
	
	// Detect how many cores the browser has access to
	this.cores = 3;
	if( typeof navigator.hardwareConcurrency == 'number' )
	{
		this.cores = navigator.hardwareConcurrency;
	}
	this.reserved_cores = 1;
	this.workerPool = this.cores; // The currently available number of CPU cores, will vary as units are dispatched/completed
	this.unitPointer = 0; // Indicates which unit should we can dispatch next	
	this.unitCompletionCallback = null;
	this.unitCompletionCallbackContext = null; // An optional context that should be set for the unit completion callback
	this.jobCompletionCallback = null; // Called when ALL tasks have been completed
	this.immediateExecute = true;
	
	// Start the tasks if we are given all required items
	if( typeof args === 'object' )
	{
		//debugger;
		// Firstly set all properties
		if( typeof args.cores == 'number' )
		{
			this.cores = args.cores;
		}
		
		if( typeof args.reservedCores == 'number' )
		{
			this.reserved_cores = args.reservedCores;
			this.setWorkerPool();
		}
		
		if( typeof args.worker === 'string' || typeof args.worker === 'function' )
		{
			this.setWorker(args.worker);
		}
		
		if( Object.prototype.toString.call(args.workData) === '[object Array]' )
		{
			this.setWorkData(args.workData);
		}
		
		if( typeof args.unitCompletionCallback === 'function' )
		{
			this.setUnitCompletionCallback(args.unitCompletionCallback);
		}
		
		if( typeof args.jobCompletionCallback === 'function' )
		{
			this.setJobCompletionCallback(args.jobCompletionCallback);
		}
		
		if( typeof args.immediateExecute === 'boolean' )
		{
			this.immediateExecute = args.immediateExecute;
		}
		
		// Check if we should
		if( this.immediateExecute && // Can we execute immediately
			typeof this.unitWorker === 'string' && // do we have a worker text
			Object.prototype.toString.call(args.workData) === '[object Array]' // do we have an array of data to work on
		)
		{		
			this.doWork();	
		}
	}
};

/**
	Determine the number of cores available for this tasks work
*/
robota.prototype.setWorkerPool = function()
{
	// Ensure at least one core is reserved for the browser etc
	var reservedCores = this.reserved_cores >= 1 ? this.reserved_cores : 1;
	
	// Ensure we start with at least 2 cores, seems reasonable for todays hardware
	var cores = this.cores >= 2 ? this.cores : 2; 
	
	this.workerPool = cores - reservedCores;
}


/** Creates an array of unit objects
	We store the input data for each unit in the object
	SETS: One work unit object for each workData item passed in
*/
robota.prototype.setWorkData = function(workData)
{
	if( Object.prototype.toString.call(workData) === '[object Array]' )
	{
		this.workUnits = [];
		workData.forEach(function(unitData,index)
		{
			this.workUnits.push(this.createWorkerUnit(unitData,index));
			
		}.bind(this))
	}
}


// Sets the Callback to be used as each task is completed
robota.prototype.setUnitCompletionCallback = function(callback,context)
{
	if( typeof callback == 'function' )
	{
		this.unitCompletionCallback = callback;
	}
	
	if( typeof context === 'object')
	{
		this.unitCompletionCallbackContext = context;
	}	
}

// Sets the Callback to be used as each task is completed
robota.prototype.setJobCompletionCallback = function(callback,context)
{
	if( typeof callback == 'function' )
	{
		this.jobCompletionCallback = callback;
	}
}

/**
	Creates a BLOB from a function
	RETURN: function BLOB
*/
robota.prototype.createWorkerBlob = function(workerFunction)
{
	var workerBlob = URL.createObjectURL( new Blob([ '(',
  
	workerFunction.toString(),

    ')()' ], { type: 'application/javascript' } ) );

    return workerBlob;
}


/**
	Stores the worker data passed in
	SETS: unitWorker
*/
robota.prototype.setWorker = function(worker)
{	
	// The worker passed in is via a path refence to the .js file
	if( typeof worker == 'string' )
	{
		this.unitWorker = worker;
	}
		
	// If a function is passed in, we create a BLOB from it and store it
	if( typeof worker == 'function' )
	{
		this.unitWorker = this.createWorkerBlob(worker);
	}
}


/**
	Creates a work unit object
	RETURNS: work unit
*/
robota.prototype.createWorkerUnit = function(data,index)
{
	var unit = {
		'index' : index,	// The units index within the task array
		'worker' : null, 	// The WebWorker, we create this on-demand
		'data' : data, 		// The work data to be supplied to the worker
		'state' : 'IDLE', 	// The current state of the work unit either IDLE, PROCESSING or COMPLETE
		'result' : null 	// The results of the processed work unit
	};
	
	return unit;
}


/**
	Creates a Web Worker, using the previously defined worker
	requires a work unit object to be passed in
	Creates the worker and passes the unit INTO the workers onmessage() event i.e. work complete
	RETURNS: a Web Worker
*/
robota.prototype.createWorker = function(unit)
{
	// Check if workers are supported in this browser
	if( typeof(Worker) === "undefined" ) return;
    
	// Create the Worker using the defined worker function blob, or .js file	
	var robot = new Worker(this.unitWorker); 
	
	// 
	robot.onmessage = function(event)
	{
		// Flag that this units work is complete
		unit.state = 'COMPLETE';
		
		// Store the result returned by the Worker in this unit
		unit.result = event.data;
		
		// As this work unit has completed, inc the workerPool count, freeing the core for further tasks
		this.workerPool ++;
		
		console.log(unit.result);
		
		// Attempt to set off more work units
		this.doWork();
		
		// Clean-up worker, freeing resources
		unit.worker.terminate();
		
		console.log('workers available : ' + this.workerPool);
		
		if( typeof this.unitCompletionCallback === 'function' )
		{
			if( typeof this.unitCompletionCallbackContext === 'object' )
			{
				this.unitCompletionCallback.apply(this.unitCompletionCallbackContext,[unit.result]);
			}
			else
			{
				this.unitCompletionCallback(unit.result);
			}
		}
	
		// Check if all tasks have completed by counting our "boats" back in
		if( this.workerPool === this.cores )
		{
			this.allUnitsCompleted();
		}
		
	}.bind(this);
        
	return robot;
}


/**
	Dispatches job units, using all available cores.
	Once an initial burst of jobs is dispatched, it will tend to dispatch single jobs as individual cores free up
*/
robota.prototype.doWork = function()
{
	// By default we set the number of units to process to the available cores
	var runLength = this.workerPool;
	
	// Reduce down the runlength, ensuring at max it matches the number of units left to be processed
	if( (this.workUnits.length) < runLength )
	{
		runLength = this.workUnits.length;
	}
	
	if( this.unitPointer < this.workUnits.length )
	{
		for (i = 0; i < runLength; i++)
		{ 
			//console.log(this.unitPointer);
			var unit = this.workUnits[this.unitPointer];
			unit.worker = this.createWorker(unit);
			
			unit.worker.postMessage([unit.data]);
			unit.state = 'PROCESSING';
			
			this.workerPool --;
			this.unitPointer ++;
		}
    }    
}

/**
*/
robota.prototype.allUnitsCompleted = function()
{
	this.workUnits.forEach(function(unit,index)
	{	
		this.workUnitsResults.push(unit.result);
		
	}.bind(this));

	if( typeof this.jobCompletionCallback == 'function' )
	{
		this.jobCompletionCallback(this.workUnitsResults);
	}
}
