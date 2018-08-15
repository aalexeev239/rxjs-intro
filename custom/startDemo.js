import {fromEvent} from 'rxjs';
import {map, filter} from 'rxjs/operators';


export function startDemo() {
    fromEvent(document, 'keyup')
        .pipe(
            map(({code}) => code),
            filter(code => code === 'KeyA')
        )
        .subscribe(res => {
            const btnElt = document.querySelector('.shower.full .slide.active .btn-play');

            if (btnElt) {
                btnElt.click();
            }
        });
}
