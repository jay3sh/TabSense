
function db() { }

db.open = function() {
    this.DB = openDatabase('TabSense', '1.0', 'TabSense', 5*1024*1024);
    this.DB.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS '+
            'Window(id INTEGER PRIMARY KEY ASC, wid INTEGER, title TEXT)',
            [], db.onSuccess, db.onError);
    });
    this.DB.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS '+
            'Tab(id INTEGER PRIMARY KEY ASC, tid INTEGER, title TEXT, '+
            'url TEXT, faviconurl TEXT, wid INTEGER, parent INTEGER, '+
            'idx INTEGER, depth INTEGER)',
            [], db.onSuccess, db.onError);
    });
}

db.clear = function() {
    this.DB.transaction(function(tx) {
        tx.executeSql('DELETE FROM Window', [], db.onSuccess, db.onError);
    });
    this.DB.transaction(function(tx) {
        tx.executeSql('DELETE FROM Tab', [], db.onSuccess, db.onError);
    });
}

db.onError = function(tx, e) {
    console.error('TabSense DB Error : '+e.message);
}

db.onSuccess = function(tx, r) {
    //console.debug(r);
}


db.put = function(obj) {
    if(obj.constructor == db.window) {
        var win = obj;
        this.DB.transaction(function(tx) {
            tx.executeSql('INSERT INTO Window(wid, title) VALUES (?,?)',
                [win.wid, win.title],
                db.onSuccess,
                db.onError);
        });
    } else if(obj.constructor == db.tab) {
        var tab = obj;
        this.DB.transaction(function(tx) {
            tx.executeSql('INSERT INTO Tab(tid, title, url, faviconurl, '+
                'wid, parent, idx, depth) VALUES (?,?,?,?,?,?,?,?)',
                [tab.tid, tab.title, tab.url, tab.faviconurl, tab.wid, 0,0,0],
                db.onSuccess,
                db.onError);
        });
    } else {
        alert('Invalid object to save');
    }
}

db.window = function(wid, title) {
    this.wid = wid;
    this.title = title;
}

db.window.get = function(condition, onSuccess) {
    db.DB.transaction(function(tx) {
        tx.executeSql('SELECT * FROM Window '+condition, [],
            onSuccess, db.onError);
    });
}

db.tab = function(tid, title, url, faviconurl, index, wid) {
    this.tid = tid;
    this.title = title;
    this.url = url;
    this.faviconurl = faviconurl;
    this.index = index;
    this.wid = wid;
}

db.tab.get = function(condition, onSuccess) {
    db.DB.transaction(function(tx) {
        tx.executeSql('SELECT * FROM Tab '+condition, [],
            onSuccess, db.onError);
    });
}