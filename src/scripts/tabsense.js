
function processTabs(tabs) {
    var tl = tabs.length;
    var wid;
    for(var j=0; j < tl; j++) {
        var tab = tabs[j];
        wid = tab.windowId
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
            favicon.attr('src', chrome.extension.getURL('images/icon28x28.png'))
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

    doneWindows.push({wid:wid,numtabs:tl});

    if(doneWindows.length == windowList.length) {
        layout_windows();
    }
}

function layout_windows() {
    var total_tabs = 0;
    for(var i=0; i < doneWindows.length; i++) {
        total_tabs += doneWindows[i].numtabs;
    }
    tabs_per_col = parseInt(total_tabs/NUMCOL);
    doneWindows.sort(function(a,b) { return (a.numtabs-b.numtabs); });

    columns = new Array(NUMCOL);
    for(var i=0; i < NUMCOL; i++) {
        columns[i] = [];
        columntabs = 0;
        for(j=0; j < doneWindows.length; j++) {
            if(!doneWindows[j]) continue;

            if(doneWindows[j].numtabs + columntabs <= tabs_per_col ||
                i == (NUMCOL-1))
            {
                columns[i].push(doneWindows[j].wid);
                columntabs += doneWindows[j].numtabs;
                doneWindows[j] = null;
            }
        }
    }
    columns.sort(function(a,b) { return b.length-a.length; });
    for(var i=0; i < NUMCOL; i++) {
        var ceiling = CEILING;
        for(var j=0; j < columns[i].length; j++) {
            var wid = columns[i][j];
            var mwin = windowMap[wid];
            mwin.css({
                'left' : (i * winw + (i+0.5) * HMARGIN)+'px',
                'top' : ceiling+'px'
            });
            ceiling += mwin.height() + VMARGIN;
        }
    }
}

var windowMap = [];
var windowList = [];
var doneWindows = [];
var dw, dh, winw;
var HMARGIN = 20;
var VMARGIN = 20;
var NUMCOL = 3;
var CEILING = 20;

$(document).ready(function(){

    dw = $(document).width();
    dh = $(document).height();

    winw = parseInt((dw/NUMCOL) - HMARGIN);

    function create_window_title(title) {
        return $('<div></div>')
            .attr('class','wtitle')
            .text(title)
            .css({
                'color' : '#eee',
                'height':'30px',
                'padding-top' : '10px',
                '-webkit-border-top-left-radius':'15px',
                '-webkit-border-top-right-radius':'15px',
                'text-align':'center'
            })
            .click(title_modifier);
    }

    function create_window_title_input() {
        var inp = $('<input></input>')
            .css({
                'height':'20px',
                'margin-top' : '5px',
                'text-align':'center'
            });
        var inpw = $('<div></div>').css({
                'height':'30px',
                '-webkit-border-top-left-radius':'15px',
                '-webkit-border-top-right-radius':'15px',
                'text-align':'center'
            });
        inpw.append(inp);
        return { wrapper:inpw, inp:inp };
    }

    function title_modifier() {
        var p = $(this).parent();
        $(this).remove();    

        var ninput = create_window_title_input();
        p.prepend(ninput.wrapper);
        ninput.inp.focus();
        ninput.inp.blur(function() {
            var p = $(this).parent().parent();
            $(this).parent().remove();    
            var wtitle = create_window_title($(this).val());
            window.localStorage.setItem(
                'window_title_'+p.attr('id'), $(this).val());
            p.prepend(wtitle);
        });
    }

    chrome.windows.getAll(null, 
        function(windows) {

            var wl = windows.length;
            for(var i=0; i < wl; i++) {

                var mwin = $('<div></div>')
                            .attr('class','mwin')
                            .attr('id', windows[i].id);
                            /*.css({
                                'width': winw+'px',
                                'left' : ((i % NUMCOL) * winw + 
                                        ((i % NUMCOL)+0.5) * HMARGIN)+'px',
                                'top' : CEILING+'px'
                            });*/
                var title_str = window.localStorage.getItem(
                                    'window_title_'+windows[i].id);
                if(title_str) {
                    var wtitle = create_window_title(title_str);
                } else {
                    var wtitle = create_window_title("Name this window");
                }
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