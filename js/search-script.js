var mGoogleApiKey = "YOUR-GOOGLE-API-KEY";
var mGoogleCustomSearchKey = "YOUR-CSE-KEY";

var _prevIndex = 0;
var _nextIndex = 0;
var _resultsPerPage = 10;
var _pageNumber = 1;


// This function is anonymous, is executed immediately and
var QueryString = function () {
// This function is anonymous, is executed immediately and
// the return value is assigned to QueryString!
var query_string = {};
var query = window.location.search.substring(1);
var vars = query.split("&");
for (var i=0;i<vars.length;i++) {
  var pair = vars[i].split("=");
      // If first entry with this name
  if (typeof query_string[pair[0]] === "undefined") {
    query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
  } else if (typeof query_string[pair[0]] === "string") {
    var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
    query_string[pair[0]] = arr;
      // If third or later entry with this name
  } else {
    query_string[pair[0]].push(decodeURIComponent(pair[1]));
  }
}
return query_string;
}();

if (QueryString.q != null && QueryString.q.length>3 ) {
    $('.viz_results').show(); Search(QueryString.q,0);
    $("#txtSearchTerm").val(QueryString.q);
    
}

$(function ()
{
  //  $('#btnSearch').show().click(function () { Search($("#txtSearchTerm").val(),0);});
    $('#lnkPrev').click(function () { Search($("#txtSearchTerm").val(),-1); });
    $('#lnkNext').click(function () { Search($("#txtSearchTerm").val(),1);  });
    $('#searchForm').submit( function (e) { $('.viz_results').show(); Search($("#txtSearchTerm").val(),0); e.preventDefault();}    );
});

function Search(term, direction)
{
    var startIndex = 1;

    if (direction === -1)
    {
        startIndex = _prevIndex;
        _pageNumber--;
    }
    if (direction === 1)
    {
        startIndex = _nextIndex;
        _pageNumber++;
    }
    if (direction === 0)
    {
        startIndex = 1;
        _pageNumber = 1;
    }

    var url = "https://www.googleapis.com/customsearch/v1?key="
    + mGoogleApiKey + "&num=10&cx=" + mGoogleCustomSearchKey + "&start=" + startIndex + "&q=" + escape(term) ;

 //   url = "http://hahndorf/ws/dummy.aspx?q=" + escape(term) + "&start=" + startIndex + "&callback=?";

    $.getJSON(url, '', SearchCompleted);
}

function SearchCompleted(response)
{
    var html = "";
    $("#searchResult").html("");

    if (response.items == null)
    {
        $("#searchResult").html("No matching pages found");
        return;
    }

    if (response.items.length === 0)
    {
        $("#searchResult").html("No matching pages found");
        return;
    }

    $("#searchResult").html(response.queries.request[0].totalResults + " pages found for <b>" +response.queries.request[0].searchTerms+ "</b>");

    if (response.queries.nextPage != null)
    {
        _nextIndex = response.queries.nextPage[0].startIndex;
        $("#lnkNext").show();
    }
    else
    {
        $("#lnkNext").hide();
    }

    if (response.queries.previousPage != null)
    {
        _prevIndex = response.queries.previousPage[0].startIndex;
        $("#lnkPrev").show();
    }
    else
    {
        $("#lnkPrev").hide();
    }

    if (response.queries.request[0].totalResults > _resultsPerPage){
        $("#lblPageNumber").show().html(_pageNumber);
    }
    else{
        $("#lblPageNumber").hide();
    }

    for (var i = 0; i < response.items.length; i++){
        var item = response.items[i];
        var title = item.htmlTitle;
        /*
        html += "<p><a class='searchLink' href='" + item.link + "'> " + title + "</a><br>";
        html += item.snippet + "<br>";
        html += item.link + " - <a href='http://www.google.com/search?q=cache:"+item.cacheId+":"+item.displayLink+"'>Cached</a></p>";
        */
        if( item.pagemap.cse_thumbnail && item.pagemap.cse_thumbnail[0].src.length >=5) {
        html += "<table class='viz_table'><tr><td width='100px'><img src='" + item.pagemap.cse_thumbnail[0].src + "' width='100px' height='100px'/></td><td valign='top' class='viz_details'>";
        html += "<div class='title viz_title'><a class='searchLink' href='" + item.link + "'>"+ title + "</a></div>";
        html += "<div class='domain'>" + extractDomain(item.link) + "</div><div class='description'> " +item.snippet + "</div></td></table>";
      }
       else
       {
       html += "<table class='viz_table'><tr><td valign='top'>";
       html += "<div class='title viz_title'><a class='searchLink' href='" + item.link + "'>"+ title + "</a></div>";
       html += "<div class='domain'>" + extractDomain(item.link) + "</div><div class='description'> " +item.snippet + "</div></td></table>";
     }


    }
    $("#output").html(html);
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}
