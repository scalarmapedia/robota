
onmessage = function(event)
{
var number = event.data[0];
var result = number;

for (i = 0; i < 2000000; i++)
{ 
	result = Math.sqrt(number).toFixed(3);
}

postMessage(result);
}
