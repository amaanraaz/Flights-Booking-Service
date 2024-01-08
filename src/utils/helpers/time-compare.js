function compareTime(timer1,timer2){
    const t1 = new Date(timer1).valueOf();
    const t2 = new Date(timer2).valueOf();
    return t1<t2;
}

module.exports = {compareTime}