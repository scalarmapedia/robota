var tests = {};

tests.testsThree = [5,10,15];
tests.dataTwenty = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];

tests.workUnit = function(number)
{
	var result = number;
	for (i = 0; i < 1000000; i++)
	{ 
		result = Math.sqrt(number).toFixed(3);
    }
	
    return result;
}

tests.doWorkUnits = function(units,unitCallback)
{
	var results = [];
	$.each(units, function( i, unit )
	{
		var unitResult = this.workUnit(unit);
		results.push(unitResult);
		if( $.type(unitCallback) == 'function' ) unitCallback(unitResult);
		
  	}.bind(this));

  	return results;
}

tests.unitCallback = function(result)
{
	var resultString = 'Completed a unit. Result is ' + result;
	var currentString = $('#test_one_result').html();
	var newString = currentString + resultString + '<br>';
	$('#test_one_result').html( newString );
	
	console.log(resultString);
}

tests.blockCompletionCallback = function(results)
{
	var resultString = 'Completed all work units. Results are ' + results.toString();
	var currentString = $('#test_one_result').html();
	var newString = currentString + resultString + '<br>';
	$('#test_one_result').html( newString );
	
	console.log(resultString);
}



tests.testOne_noRobota = function(unitCallback,blockCompletionCallback)
{
	this.startTime = new Date().getTime();
	
	console.log('Work units are ' + this.testsThree.toString());
	
	if( $.type(blockCompletionCallback) == 'function' )
	{
		blockCompletionCallback(this.doWorkUnits(this.testsThree,unitCallback));
	}
	else
	{
		this.doWorkUnits(this.testsThree,unitCallback);
	}
	
	this.endTime = new Date().getTime();
	
	console.log('Duration : ' + ((this.endTime - this.startTime) * .001) );
}



tests.buttons = function(event)
{
	//debugger;
	switch(event.target.id)
	{
    case 'button_test_one_no_robota':
    	tests.testOne_noRobota(tests.unitCallback,tests.blockCompletionCallback);
        break;
    case 'button_test_two_no_robota':
        tests.testTwo_noRobota();
        break;
    }
}

