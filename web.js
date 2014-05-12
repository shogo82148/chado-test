var dicfiles = ['char.category', 'code2category', 'word2id', 'word.dat', 'word.ary.idx', 'word.inf', 'matrix.bin'];
var tagger;

function loadTagger(dicdir) {
    var files = new Array();
    for(var i=0;i<dicfiles.length;++i) {
	files[dicfiles[i]] = loadFile(dicdir, dicfiles[i]);
    }

    var category = new igo.CharCategory(files['code2category'], files['char.category']);
    var wdc = new igo.WordDic(files['word2id'], files['word.dat'], files['word.ary.idx'], files['word.inf']);
    var unk = new igo.Unknown(category);
    var mtx = new igo.Matrix(files['matrix.bin']);
    return new igo.Tagger(wdc, unk, mtx);
}

function igo_request(data) {
    var method = data.method;
    var text = data.text;
    var best = data.best;

    if(method=='setdic') {
	tagger = loadTagger(data.dic);
	return {event: 'load'};
    } if(method=='parse') {
	return {
	    method: method,
	    event: "result",
	    text: text,
	    morpheme: tagger.parse(text)
	};
    } else if(method=='wakati') {
	return {
	    method: method,
	    event: "result",
	    text: text,
	    morpheme: tagger.wakati(text)
	};
    } else if(method=='parseNBest') {
	return {
	    method: method,
	    event: "result",
	    text: text,
	    morpheme: tagger.parseNBest(text, best)
	};
    }

    return null;
}

importScripts("igo.min.js", "zip.min.js");
var loadFile = function(dicdir, name) {
    return dicdir.files[name].inflate();
};
var onmessage = function(event) {
    var dataclass = function(){};
    dataclass.prototype = event.data;
    var data = new dataclass();

    if(data.dic) {
	var reader = new FileReaderSync();
	data.dic = Zip.inflate(
	    new Uint8Array(reader.readAsArrayBuffer(data.dic))
	);
    }

    var res = igo_request(data);
    if(res) {
	postMessage(res);
    }
};
addEventListener("message", onmessage);
