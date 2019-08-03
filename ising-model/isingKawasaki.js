/*options and settings*/
let g;
let time=0;
let const_j=1;
let jarr=new Array();
let gaussianJ=true;
let const_h=0;
let const_moveMode=1;
let const_dEnTe=0.4;
let timeoutID=null;
let field=new Array();
let fieldL=50;
let interactions=1000;
let arrEnergy=new Array();
$("#energyDiv").data("plotOptions", {yaxis:{tickDecimals:2}});

function setup() {
    g=$("#plotDiv")[0].getContext("2d");
    time=0;
    window.clearInterval(timeoutID);
    timeoutID=null;
    populateField();
    drawField();
    plotFigure();
}

function getParameterValues() {
    let i,j,tjarr,ttjarr,r1,r2;
    const_moveMode=parseInt($("#controlT").val());
    const_j=myParseFloat($("#controlJ").val());
    jarr=new Array();
    if(const_j==-99999) {
        for(i=0;i<fieldL;i+=1) {
            tjarr=new Array();
            for(j=0;j<fieldL;j+=1) {
                ttjarr=new Array();
                if(gaussianJ) {
                    r1=Math.random();
                    r2=Math.random();
                    tjarr.push([
                        Math.sqrt(-2.0*Math.log(r1))*Math.cos(2.0*Math.PI*r2),
                        Math.sqrt(-2.0*Math.log(r1))*Math.sin(2.0*Math.PI*r2)
                    ]);
                } else {
                    if(Math.random()>0.5) ttjarr.push(1);
                    else ttjarr.push(-1);
                    if(Math.random()>0.5) ttjarr.push(1);
                    else ttjarr.push(-1);
                    tjarr.push(ttjarr);
                }
            }
            jarr.push(tjarr);
        }
    }
    const_h=myParseFloat($("#controlH").val());
    const_dEnTe=myParseFloat($("#controlDEKT").val());
}

function plotFigure() {
    $.plot($("#energyDiv"),[{data:arrEnergy, color:"red"}],$("#energyDiv").data("plotOptions"));
}

function myParseFloat(val) {
    return parseFloat((""+val).replace(",","."));
}

function start() {
    setup();
    populateField();
    $("#resume").click();
}

function step() {
    let i,r,x,y,s,x2,y2,s2,curEnergy,newEnergy,delEnergy,prob;
    time+=1;
    for(i=0;i<interactions;i+=1) {
        x=Math.floor(Math.random()*fieldL);
        y=Math.floor(Math.random()*fieldL);
        s=getSpin(x,y);

        if(const_moveMode==0) {
            x2=Math.floor(Math.random()*fieldL);
            y2=Math.floor(Math.random()*fieldL);
        } else {
            x2=x;
            y2=y;
            r=Math.floor(4*Math.random());
            switch(r) {
                default:
                case 0:
                    x2+=1;
                    break;
                case 1:
                    x2-=1;
                    break;
                case 2:
                    y2+=1;
                    break;
                case 3:
                    y2-=1;
                    break;
            }
        }
        s2=getSpin(x2,y2);

        curEnergy=getBondEnergy(x,y,s)+getBondEnergy(x2,y2,s2);
        newEnergy=getBondEnergy(x,y,s2)+getBondEnergy(x2,y2,s);
        delEnergy=newEnergy-curEnergy;

        if(delEnergy<0) {
            setSpin(x,y,s2);
            setSpin(x2,y2,s);
        } else if(delEnergy>0) {
            prob=Math.exp(-delEnergy*const_dEnTe);
            if(Math.random()<prob) {
                setSpin(x,y,s2);
                setSpin(x2,y2,s);
            }
        }
    }
    return ;
}

function populateField() {
    let i,j,tfield;
    arrEnergy=new Array();
    field=new Array();
    for(i=0;i<fieldL;i+=1) {
        tfield=new Array();
        for(j=0;j<fieldL;j+=1) {
            if(Math.random()>0.5) tfield.push(1);
            else tfield.push(-1);
        }
        field.push(tfield);
    }
}
function drawField() {
    let i,j;
    for(i=0;i<fieldL;i+=1) {
        for(j=0;j<fieldL;j+=1) {
            if(field[i][j]==1) g.fillStyle="rgb(255,0,0)";
            else g.fillStyle="rgb(0,0,255)";
            g.fillRect(i*4,j*4,4,4);
        }
    }
    updateStatistics();
}

function updateStatistics() {
    arrEnergy.push([time,totalEnergy()]);
}

function totalEnergy() {
    let i,j;
    let tmp=0;
    for(i=0;i<fieldL;i+=1) {
        for(j=0;j<fieldL;j+=1) {
            tmp+=getBondEnergy(i,j,getSpin(i,j));
        }
    }
    tmp/=(fieldL*fieldL);
    return 0.5*tmp;
}

function getBondEnergy(x,y,v) {
    if(const_j!=-99999) return -const_j*v*(getSpin(x-1,y)+getSpin(x+1,y)+getSpin(x,y-1)+getSpin(x,y+1))-2.0*v*const_h;
    return -v*(getJ(x,y,x-1,y)*getSpin(x-1,y)+getJ(x,y,x+1,y)*getSpin(x+1,y)+getJ(x,y,x,y-1)*getSpin(x,y-1)+getJ(x,y,x,y+1)*getSpin(x,y+1))-2.0*v*const_h;
}

function getJ(x,y,x1,y1) {
    let tx,ty;
    if(const_j==-99999) {
        tx=Math.min(x,x1);
        ty=Math.min(y,y1);
        if(!(Math.abs(x-x1)==0 || Math.abs(y-y1)==0)) return 0;
        else if(Math.abs(x-x1)==0) return jarr[(fieldL+tx)%fieldL][(fieldL+ty)%fieldL][0];
        else return jarr[(fieldL+tx)%fieldL][(fieldL+ty)%fieldL][1];
    }
    return const_j;
}
function getSpin(x,y) {
    return field[(fieldL+x)%fieldL][(fieldL+y)%fieldL];
}
function setSpin(x,y,v) {
    field[(fieldL+x)%fieldL][(fieldL+y)%fieldL]=v;
}

function frame() {
    step();
    drawField();
    plotFigure();
}

/*main*/
$(function () {
    setup();
    $("#start").click(function(){start();});
    $("#resume").toggle(function(){resume();},function(){stop();});
});
