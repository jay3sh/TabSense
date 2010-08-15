var FACEBOOK_PAGE_HTML = '<iframe src="http://www.facebook.com/plugins/likebox.php?id=139713996058999&amp;width=500&amp;connections=10&amp;stream=true&amp;header=false&amp;height=555" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:555px;" allowTransparency="true"></iframe>';
var SOURCE_URL = 'http://github.com/jyro2080/TabSense'
var BUGS_URL = 'http://github.com/jyro2080/TabSense/issues'

var doneWindows = 0;
var dw, dh, winw;
var HMARGIN = 30;
var VMARGIN = 20;
var NUMCOL = 3;
var CEILING = 50;

var total_window = 0;

function process_windows(windows) {
    UI.totalWindows = windows.length;
    for(var i=0; i < UI.totalWindows; i++) {
        var w = windows[i];
        UI.add_window(w);

        bgport.postMessage({ name:'listtabs',condition:'WHERE wid = '+w.wid });
    }
}

function process_tabs(tabs) {
    var t = null;
    for(var i=0; i < tabs.length; i++) {
        t = tabs[i];
        UI.add_tab(t);
    }
    if(t) { UI.restyle_window(t.wid); }
    else { console.warn('No tab for window restyle'); }

}

function reprocess_tabs(tabs) {
    if(tabs.length == 0) {
        console.warn('No tabs to reprocess'); return;
    }
    var wframe = UI.wMap[tabs[0].wid];
    $('.mtab', wframe.elem).remove();
    process_tabs(tabs);
}

var ui;
$(document).ready(function(){

    ui = UI(); 

    bgport.postMessage({ name:'listwindows' }); // trigger setup windows

    refresh_favorites();
    
    $('#topbar #search').focus(function() {
        run_query('');
    });
    $('#topbar #search').blur(function() {
        blur_all_tabs(false);
    });

    $('#topbar #search').keyup(function() {
        run_query($(this).val());
    });

    $('#creator').css('top',(UI.dh-40)+'px');
    $('#creator').css('left',(UI.dw-120)+'px');

    $('#topbar #info').click(function(ev) {
        if($.trim($('#infopanel').html()) === '') {

            var topline = $('<div></div>').attr('id','topline')
                .append('<a href="'+SOURCE_URL+'">Source</a>'+
                    '&nbsp;&nbsp;&nbsp;'+
                    '<a href="'+BUGS_URL+'">Bugs/Features</a>'+
                    '&nbsp;&nbsp;&nbsp;'+
                    '<a id="close" href="#">Close</a>');
            
            $('#infopanel')
                .append(topline)
                .append(FACEBOOK_PAGE_HTML);
        }
        $('#infopanel').show();
    });

    $('#infopanel #close').click(function() { 
        $(this).hide(); 
    });
    $('#infopanel').click(function() { 
        $(this).hide(); 
    });

    position_infopanel();

    $('#bagbar').css({
        'top' : (UI.dh-40)+'px',
        'width' : (UI.dw-140)+'px'
    })

    bgport.postMessage({ name:'listsavedwindows' });

    // open saved windows in legacy versions
    var oldwindows = Bag.list();
    if(oldwindows.length > 0) {
        alert('msg');

        var winidArr = [];
        for(var i=0; i < oldwindows.length; i++) {
            chrome.windows.create(null, function(win) {
                winidArr.push(win.id);
                if(winidArr.length == oldwindows.length) {
                    open_old_tabs();
                }
            });
        }
    }

    function open_old_tabs() {
        for(var i=0; i < oldwindows.length; i++) {
            var win = oldwindows[i];
            var winid = winidArr[i];
            for(var j=0; j < win.tabs.length; j++) {
                chrome.tab.create({
                    windowId : winid,
                    url : win.tabs[j].url
                });
            }
        }
    }

});

function load_bag(windows) {
    $('#bagbar').empty();
    if(!windows) return;
    var bagl = windows.length;
    if(bagl > 0) {
        $('#bagbar').append($('<img/>').attr('src', WinFrame.saveIcon));
    }
    for(var i=0; i < bagl; i++) {
        var w = windows[i];
        if(!w.title) w.title = 'NoName';
        var entry = $('<div></div>')
                .attr('class','winentry')
                .attr('id', w.wid)
                .text(w.title)
                .click(bagEntryClicked);
        $('#bagbar').append(entry);
    }
}

function bagEntryClicked(ev) {
    var wid = $(this).attr('id');

    bgport.postMessage({ name:'unsavewindow', wid:wid });
}

function openSavedWindow(saved) {
    chrome.windows.create(null,
        function(win) {
            var totalTabs = saved.tabs.length;

            for(var i=0; i<totalTabs; i++) {
                var t = saved.tabs[i];
                //tabTitleMap[t.url] = t.title;
                //tabFavIconMap[t.url] = t.favIconUrl;
                chrome.tabs.create({
                    windowId : win.id,
                    index : t.index,
                    url : t.url,
                    selected : t.selected
                }, 
                function(tab) {
                    /*
                    var title = tabTitleMap[tab.url];
                    var favIconUrl = tabFavIconMap[tab.url];
                    wf.addTab(new Tab(tab, title, favIconUrl));
                    if(wf.tabArray.length == totalTabs) {
                        wf.refreshStyle();
                        layout_windows();
                    }
                    */
                });
            }
        }
    );

    load_bag();
}

function position_infopanel() {
    var ipw = 550;
    var iph = 600;
    var left = (UI.dw - ipw)/2;
    var top = (UI.dh - iph)/2;
    $('#infopanel').css({
        'left' : left+'px',
        'top' : top+'px'
    });
}

function blur_all_tabs(yes)
{
    for(i in UI.wMap) {
        var win = UI.wMap[i];
        if(!win) continue;
        (yes ? win.blurTabs : win.unblurTabs)();
    }
}

function run_query(query)
{
    blur_all_tabs(true);
    if($.trim(query) != '') {
        query = query.toLowerCase();
        for (i in UI.tMap) {
            var tabTitle = UI.tMap[i].tabdb.title;
            if(tabTitle && tabTitle.toLowerCase().indexOf(query) >= 0) {
                tab_selector = 'tab_'+UI.tMap[i].tabdb.tid;
                for(j in UI.wMap) {
                    $('#'+tab_selector, UI.wMap[j].elem).css({
                        'color':'#000'
                    });
                }
            }
        }
    }

}

function refresh_favorites()
{
    // Load favorite favicons
    var favlist = Fav.list();
    var fll = favlist.length;
    var favbar = $('#topbar #favbar');
    favbar.empty();
    for(var i=0; i < fll; i++) {
        if(favlist[i].favIconUrl) {
            var img = $('<img/>').attr('src',favlist[i].favIconUrl)
                                .width('24px')
                                .height('24px');
            var link = $('<a></a>').attr('href', favlist[i].url);
            link.append(img);
            favbar.append(link);
        }
    }
}
