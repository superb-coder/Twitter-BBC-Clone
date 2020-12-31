//chrome.storage.local.get({showontwitter: true},
var recommends_list = []
var tweets = []

/* function getReadingList () {
  chrome.storage.local.get({recommends_list: []}, function (result) {
  console.log(result.recommends_list)
  tweets = result.recommends_list }); //{console.log(result.recommends_list) });
  console.log('Evan 0')
  console.log(tweets)
} */
/* 
function getReadingList () {
chrome.storage.local.get({recommends_list: []}, function (result) {
console.log(result.recommends_list)
tweets = result.recommends_list
console.log('Evan 0')
console.log(tweets)
});
}
 */
 
 
 
 


/* var tweets = [];

function getReadingList() {
  return new Promise((resolve, reject) => {
    setTimeout(() => { //imitation of chrome.storage.local.get method

      tweets = ['tweet1', 'tweet2', 'tweet3'];
			resolve();
    }, 1000);
  });
}





getReadingList().then(result =>{
	console.log(1, tweets)//it works
});
console.log(2, tweets)//does not work

 */
 
 
 
//chrome.storage.local.get(['domainlist'], function (result) { console.log(result.someData) });

//result = {}
//result.recommends_list = [[48303],[944889]]var


/* 
        html = ''''<div class="divTable">
                <div class="divTableBody">"""
        var i;
        for (i = 0; i < result.domainlist.length; i++) {
         html += "<div>" + request.recommends_list[i] + "</div>";
        }
		
		 */

/* <div class="divTableRow">
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
</div>
<div class="divTableRow">
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
</div>
<div class="divTableRow">
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
</div>
<div class="divTableRow">
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
<div class="divTableCell">&nbsp;</div>
</div>
</div>
</div>
 */



function sleep (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

document.addEventListener('DOMContentLoaded', function () {
function GenerateTable() {
	    var tweets_reformatted = []
        // var urlParams = new URLSearchParams(window.location.search);
        // console.log(urlParams.getAll('ids')); // ["edit"]
        // var tweets = urlParams.getAll('ids')
        // urlParams.getAll({'ids'}, function (result) {
        chrome.storage.local.get({recommends_list}, function (result) {
            console.log('rick deckard')
            console.log(result.recommends_list)
            var tweets = result.recommends_list.slice(0, 15);

            for (index = 0; index < tweets.length; index++) {
			  let array_v = []
			  
			  
			  
              let html_to_add = `<blockquote class= "twitter-tweet" width=550><a href="`+ `https://twitter.com/i/status/` + tweets[index].toString() 
              html_to_add = html_to_add  + `"></a></blockquote><br><br>`
              //html_to_add = html_to_add + `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`              
			  array_v.push(html_to_add);
              tweets_reformatted.push(array_v)
            } 

            //Create a HTML Table element.
            var table = document.createElement("TABLE");
            table.border = "0";
			table.width = "550"
 
            //Get the count of columns.
            var columnCount = tweets_reformatted[0].length;
 
            //Add the header row.
            var row = table.insertRow(-1);
            for (var i = 0; i < columnCount; i++) {
                var headerCell = document.createElement("TH");
                headerCell.innerHTML = tweets_reformatted[0][i];
                row.appendChild(headerCell);
            }
 
            //Add the data rows.
            for (var i = 1; i < tweets_reformatted.length; i++) {
                row = table.insertRow(-1);
                for (var j = 0; j < columnCount; j++) {
                    var cell = row.insertCell(-1);
                    cell.innerHTML = tweets_reformatted[i][j];
                }
            }
 
            var dvTable = document.getElementById("dvTable");
            if (dvTable){
              dvTable.innerHTML = "";
              //dvTable.innerHTML =  `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;             
              dvTable.appendChild(table);
			}
            // var z = document.createElement('p'); // is a node
            // z.innerHTML = `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
            // document.body.appendChild(z);
        });
    }
//GenerateTable()
setTimeout(GenerateTable, 20);



});





