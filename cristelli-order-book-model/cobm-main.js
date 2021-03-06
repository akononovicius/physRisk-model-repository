function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var retPdfPlot=new plotlyPlot("retPdf",["lg[|Δp|]","lg[P(|Δp|)]"]);
var retSpecPlot=new plotlyPlot("retSpec",["lg[f]","lg[S(f)]"]);
var pSeriesPlot=new plotlyPlot("pSeries",["time","relative price"]);
var retSeriesPlot=new plotlyPlot("retSeries",["time","price change"]);

var model=null;
var time=0;
var timeSeries=null;
var priceSeries=null;
var retSeries=null;

var priceTick=1;

var pdf=null;
var pdfLen=0;

var timeoutID=null;

function play() {
    var i, price, ret;
    timeSeries.splice(0,64);
    priceSeries.splice(0,64);
    retSeries.splice(0,64);
    for(i=0;i<64;i+=1) {
        time+=1;
        price=model.step();
        ret=(price-priceSeries[priceSeries.length-1])/priceTick;

        timeSeries.push(time);
        priceSeries.push(price);
        retSeries.push(Math.abs(ret));
        
        var pdfi=Math.floor(Math.abs(ret)-1);
        if(-1<pdfi && pdfi<pdf.length) {
            pdf[pdfi]+=1;
            pdfLen+=1;
        }
    }
}

function plotFigures() {
    if(pdfLen>0) {
        var showPdf=commonFunctions.pdfModification(pdf,true,1e0,1e4,101,1e0,1e0,pdfLen);
        retPdfPlot.update([commonFunctions.toOneDimensionalArray(showPdf,0)],
                          [commonFunctions.toOneDimensionalArray(showPdf,1)]);
    } else {
        retPdfPlot.reset();
    }
    if(time>128) {
        var curSpec=commonFunctions.performRealFFT(retSeries);
        var showPsd=commonFunctions.specModification(curSpec,1.0,100,true);
        retSpecPlot.update([commonFunctions.toOneDimensionalArray(showPsd,0)],
                           [commonFunctions.toOneDimensionalArray(showPsd,1)]);
    } else {
        retSpecPlot.reset();
    }
    pSeriesPlot.update([timeSeries],[priceSeries]);
    retSeriesPlot.update([timeSeries],[retSeries.slice(-4096)]);
}

function pdfSetup() {
    var i;
    pdf=new Array(10000);
    for(i=0;i<pdf.length;i+=1) {
        pdf[i]=0;
    }
    pdfLen=0;
}

function seriesSetup() {
    var i;
    time=0;
    timeSeries=new Array(4096);
    priceSeries=new Array(timeSeries.length);
    for(i=0;i<timeSeries.length;i+=1) {
        timeSeries[i]=i-timeSeries.length;
    }
    for(i=0;i<priceSeries.length;i+=1) {
        priceSeries[i]=0;
    }
    retSeries=new Array(32768);
    for(i=0;i<retSeries.length;i+=1) {
        retSeries[i]=Math.random()*0.1;
    }
}

function setup() {
    model=new CristelliModel(
        myParseFloat($("#marketOrderProb").val()),
        parseInt($("#broadness").val()),
        parseInt($("#survival").val()),
        parseInt($("#dt").val()),
        priceTick);
    seriesSetup();
    pdfSetup();
}

function frame() {
    play();
    plotFigures();
}

function stopGame() {
    window.clearInterval(timeoutID);
    timeoutID=null;
}

function resumeGame() {
    timeoutID=window.setInterval("frame()",100.0);
}
