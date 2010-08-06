
function WinFrame(rwindow) { 

    this.elem = $('<div></div>').attr('class','mwin').attr('id', ''+rwindow.id);

    var title_str = window.localStorage.getItem('window_title_'+rwindow.id);
    if(title_str) {
        var text = WinFrame.createTitle(title_str);
    } else {
        var text = WinFrame.createTitle("Name this window");
    }
    var wtitle = $('<div></div>').attr('class','wtitle');
    wtitle.append(text);
    this.elem.append(wtitle);
}

WinFrame.createTitle = function(title) {
    return $('<div></div>').attr('class','text').text(title)
        .click(WinFrame.editTitle);
}

WinFrame.createTitleInput = function() {
    var inp = $('<input></input>');
    var inpw = $('<div></div>');
    inpw.append(inp);
    return { wrapper:inpw, inp:inp };
}

WinFrame.editTitle = function() {
    var p = $(this).parent();
    var oldtitle = $(this).text();
    $(this).remove();    

    var ninput = WinFrame.createTitleInput();
    p.append(ninput.wrapper);
    ninput.inp.val(oldtitle);
    ninput.inp.focus();
    ninput.inp.blur(function() {
        var p = $(this).parent().parent();
        $(this).parent().remove();    
        var newtitle = $(this).val();
        if($.trim(newtitle) == '') {
            newtitle = oldtitle;
        }
        var wtitle = WinFrame.createTitle(newtitle);
        var wid = p.parent().attr('id');
        window.localStorage.setItem(
            'window_title_'+wid, newtitle);
        p.prepend(wtitle);
    });
}

WinFrame.prototype = {
    addTab : function(tab) {
        this.elem.append(tab.elem);
    },

    refreshStyle : function() {
        $('.mtab:even',this.elem).css('background','#eeeeee');
        $('.mtab:odd',this.elem).css('background','#e0e0e0');

        $('.mtab', this.elem).css({'width': (winw-50)+'px'})
        $('.mtab > div', this.elem).css({'width': (winw-140)+'px'})

        $('.mtab:last', this.elem).css({
            '-webkit-border-bottom-left-radius':'15px',
            '-webkit-border-bottom-right-radius':'15px'
        });
    },

    setLocation : function(top, left) {
        this.elem.css({
            'left' : left+'px',
            'top' : top+'px'
        });
    },

    blurTabs : function() {
        var even_color = '#f0f0f0';
        var odd_color = '#e2e2e2';
        var text_color = '#aaa';
        $('.mtab:even', this.elem).css('background', even_color);
        $('.mtab:odd', this.elem).css('background', odd_color);
        $('.mtab', this.elem).css('color', text_color);
    },

    unblurTabs : function() {
        var even_color = '#eeeeee';
        var odd_color = '#e0e0e0';
        var text_color = '#000';
        $('.mtab:even', this.elem).css('background', even_color);
        $('.mtab:odd', this.elem).css('background', odd_color);
        $('.mtab', this.elem).css('color', text_color);
    }
}
