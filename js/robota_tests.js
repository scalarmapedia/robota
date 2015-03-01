var tests = {};

tests.aThree = [1,2,3];
tests.aTwenty = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
tests.aForty = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];

tests.workUnit = function(number,unitCallback)
{
	var result = number;
	for (i = 0; i < 9000000; i++)
	{ 
		result = Math.sqrt(number).toFixed(3);
    }
	
    return result;
}

tests.workUnitWorker = function(event)
{
  onmessage = function(event)
  {
  	var number = event.data[0];
  	var result = number;
  	
	for (i = 0; i < 9000000; i++)
	{ 
		result = Math.sqrt(number).toFixed(3);
    }
	
    postMessage(result);
  }
}

tests.doWorkUnits = function(units,unitCallback)
{
	var results = [];
	$.each(units, function( i, unit )
	{
		var unitResult = this.workUnit(unit);	
		if( $.type(unitCallback) == 'function' )
		{
			unitCallback(unitResult);
		}
		
		results.push(unitResult);
		
  	}.bind(this));

  	return results;
}

tests.unitCallback = function(result)
{
	window.requestAnimationFrame(function(){
		var resultString = 'Completed a unit. Result is ' + result;
		var currentString = $('#test_one_result').html();
		var newString = currentString + resultString + '<br>';
		$('#test_one_result').html( newString );
	});
}

tests.tests_one_blockCompletionCallback = function(results)
{
	var resultsTotal = 0;
	$.each(results, function( i, r )
	{
		resultsTotal += parseFloat(r);
  	});
  	
  	window.tests.endTime = new Date().getTime();
  	var duration = 'Duration : ' + ((window.tests.endTime - window.tests.startTime) * .001).toFixed(2);
	var resultString = 'Completed all work units. Results Combined Total is ' + resultsTotal.toFixed(2);
	var currentString = $('#test_one_result').html();
	var newString = currentString + resultString + '<br>';
	newString = newString + duration + '<br>';
	
	$('#test_one_result').html( newString );
	
	
	$('#test_one_result').get(0).scrollTop = $('#test_one_result').get(0).scrollHeight;
	
	//$('#test_one').find('.working_icon').css('display','');
}

tests.testOne_noRobota = function(
	units,
	unitCallback,
	blockCompletionCallback
	)
{
	tests.startTime = new Date().getTime();
	
	if( $.type(blockCompletionCallback) == 'function' )
	{
		blockCompletionCallback(this.doWorkUnits(units,unitCallback));
	}
	else
	{
		this.doWorkUnits(units,unitCallback);
	}
	
	$('#test_one').find('.working_icon').css('display','');
}

tests.testOne = function(
	units,
	unitCallback,
	blockCompletionCallback
	)
{
	tests.startTime = new Date().getTime();
	
	var testContext = {
		bananna:'fruit',
		egg:0,
		fudge:false
	};
	
	var unitCompleteCB = function(unitResult)
	{
		//var resultsDiv = $('#test_one_result');
		//resultsDiv.append('<p>' + unitResult + '</p>');
		//resultsDiv.get(0).scrollTop = resultsDiv.get(0).scrollHeight;
	}
	
	var  jobCompleteCB = function(results)
	{
		tests.endTime = new Date().getTime();
		console.log('duration of test = ' + (tests.endTime - tests.startTime) / 1000);
		
		var resultsDiv = $('#test_one_result');
		resultsDiv.append('<p>All Tasks Completed</p>');
		resultsDiv.append('<p>Results are '+results.toString()+'</p>');
		resultsDiv.get(0).scrollTop = resultsDiv.get(0).scrollHeight;	
	}
	
	tests.startTime = new Date().getTime();
	
/* 	var robo = new robota();
	robo.setWorker(tests.workUnitWorker);	
	robo.setUnitCompletionCallback(unitCompleteCB,testContext);	
	robo.setJobCompletionCallback(jobCompleteCB,testContext);	
	robo.setWorkData(tests.aForty);
	robo.doWork(); */
	
	var bot = new robota({
			//worker:'/js/workUnitWorker.js',
			worker:tests.workUnitWorker,
			workData:tests.aForty,
			unitCompletionCallback:unitCompleteCB,
			jobCompletionCallback:jobCompleteCB
	});
	
	$('#test_one').find('.working_icon').css('display','');
}

tests.buttons = function(event)
{
	switch(event.target.id)
	{
    case 'button_test_3_units_no_robota':
    	$('#test_one_result').html('');
    	$('#test_one').find('.working_icon').css('display','block');
    	
    	setTimeout(function(){
    			tests.testOne_noRobota(tests.aThree,tests.unitCallback,tests.tests_one_blockCompletionCallback);
    	},100);
        break;
        
    case 'button_test_20_units_no_robota':
    	$('#test_one_result').html('');
    	$('#test_one').find('.working_icon').css('display','block');
    	
    	setTimeout(function(){
    			tests.testOne_noRobota(tests.aTwenty,tests.unitCallback,tests.tests_one_blockCompletionCallback);
        },100);
        break;
        
    case 'button_test_3_units':
    	$('#test_one_result').html('');
    	$('#test_one').find('.working_icon').css('display','block');
    	
    	setTimeout(function(){
    			tests.testOne(tests.aThree,tests.unitCallback,tests.tests_one_blockCompletionCallback);
        },100);
        break;
    }
}

