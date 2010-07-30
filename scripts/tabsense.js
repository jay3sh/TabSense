
function processTabs(tabs) {
    var tl = tabs.length;
    for(var j=0; j < tl; j++) {
        var tab = tabs[j];
        var wid = tab.windowId
        var tid = tab.id;

        var mtab = $('<div></div>').attr('class','mtab')
                    .attr('id','tab_'+tid);

        var favicon = $('<img/>');
        if(tab.favIconUrl) {
            favicon.attr('src', tab.favIconUrl)
                        .attr('class','favicon')
                        .width('24px')
                        .height('24px');
        } else {
            favicon.attr('src', chrome.extension.getURL('images/icon.png'))
                        .attr('class','favicon')
                        .width('24px')
                        .height('24px');
        }
            mtab.append(favicon);

        tabtitle = $('<div></div>')
                .attr('class','title').text(tab.title);
        mtab.append(tabtitle);

        windowMap[wid].append(mtab);
    }
    $('.mtab:even',windowMap[wid]).css('background','#eee');
    $('.mtab:odd',windowMap[wid]).css('background','#ddd');
    $('.mtab', windowMap[wid]).click(function(ev) {
        var match = /tab_(\d+)/.exec($(this).attr('id'));
        if(match && match[1]) {
            chrome.tabs.update(parseInt(match[1]), {selected : true});
        }
    });

    $('.mtab > div', windowMap[wid]).css({'width': (winw-70)+'px'})

    $('.mtab:last', windowMap[wid]).css({
        '-webkit-border-bottom-left-radius':'15px',
        '-webkit-border-bottom-right-radius':'15px'
    });
}

var windowMap = [];
var windowList = [];
var dw, dh, winw;
var HMARGIN = 30;
var VMARGIN = 5;
var NUMCOL = 3;
var CEILING = 20;

$(document).ready(function(){

    dw = $(document).width();
    dh = $(document).height();

    winw = parseInt((dw/NUMCOL) - HMARGIN);

    chrome.windows.getAll(null, 
        function(windows) {

            var wl = windows.length;
            for(var i=0; i < wl; i++) {

                var mwin = $('<div></div>')
                            .attr('class','mwin')
                            .css({
                                'width': winw+'px',
                                'left' : ((i % NUMCOL) * winw + 
                                        ((i % NUMCOL)+0.5) * HMARGIN)+'px',
                                'top' : CEILING+'px'
                            });
                var wtitle = $('<div></div>')
                        .attr('class','wtitle')
                        .css({
                            'height':'40px',
                            '-webkit-border-top-left-radius':'15px',
                            '-webkit-border-top-right-radius':'15px',
                            'text-align':'center'
                        });
                wtitle.text('Name this window');
                mwin.append(wtitle);


                windowMap[windows[i].id] = mwin; 
                windowList[i] = mwin;

                $('body').append(mwin);

                chrome.tabs.getAllInWindow(windows[i].id, processTabs);
            }
        }
    );

    
    $('#creator').css('top',(dh-50)+'px');
    $('#creator').css('left',(dw-140)+'px');
});
