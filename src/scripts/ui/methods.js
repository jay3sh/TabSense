
function UI() 
{
    UI.dw = $(document).width();
    UI.dh = $(document).height();

    UI.winw = parseInt(UI.dw/NUMCOL);

    UI.columns = new Array(NUMCOL);
}

UI.wMap = [];
UI.tMap = [];

UI.columnNumber = function(counter) {
    var r = parseInt(counter / NUMCOL);
    var c = counter % NUMCOL;
    return ( ((r % 2) == 0) ? c : (NUMCOL-1-c) );
}

UI.getColumnHeight = function(colNum) 
{
    var h = CEILING;
    for(var i=0; i < UI.columns[colNum].length; i++) {
        var w = UI.columns[colNum][i];
        var height = w.elem.height() + VMARGIN;
        h += height;
    }
    return h;
}

UI.layout_windows = function() {
    wMapCopy = UI.wMap.slice(0);
    wMapCopy.sort(function(a,b) { return (b.numTabs-a.numTabs); });
    for(var i=0; i<NUMCOL; i++) { UI.columns[i]=[]; }

    var colCount = 0;
    for(i in wMapCopy) {

        colCount = UI.columnNumber(i);

        if(!wMapCopy[i]) continue;

        var wh = wMapCopy[i].elem.height();

        if(!UI.columns[colCount]) UI.columns[colCount] = [];

        wMapCopy[i].setLocation(
            UI.getColumnHeight(colCount),
            (colCount*wMapCopy[i].elem.width()+(colCount+0.5) * HMARGIN));

        UI.columns[colCount].push(wMapCopy[i]);
    }
}

UI.get_column = function(x) {
    var width;
    for(i in UI.wMap) {
        width = UI.wMap[i].elem.width();
        break;
    }
    return parseInt((x - 0.5*HMARGIN)/width);
}

UI.relayout_column = function(colnum) {
    var column = UI.columns[colnum];
    var wl = column.splice(0); // copy array and empty it
    for(var i=0; i < wl.length; i++) {
        var win = wl[i];
        win.setLocation(
            UI.getColumnHeight(colnum),
            colnum * win.elem.width() + (colnum+0.5) * HMARGIN);
        column.push(wl[i]);
    }
    
}
