#include <ghcjs/rts.h>

function h$fromListPrim(xs) {
    var arr = [];
    while(IS_CONS(xs)) {
        arr.push(CONS_HEAD(xs));
        xs = CONS_TAIL(xs);
    }
    return arr;
}

