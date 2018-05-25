let START = new Date();
let isRunning = false;
const STEP = 50;
const TICK_MS = 500;
const MAX_TIME_MS = 6000;
const COLOR_SCHEME = [
    '#FB000D',
    '#009D91',
    '#8AB32D'
];

const timelineTemplate = document.getElementById('timeline-template');

function createElementWithClass(className) {
    const element = document.createElement('div');

    element.classList.add(className);

    return element;
}

function createTimelineElement() {
    const element = timelineTemplate.content.cloneNode(true);
    return element.querySelector('.timeline');
}

function createEntryElement() {
    return createElementWithClass('entry');
}

function createCompleteElement() {
    return createElementWithClass('entry-complete');
}

function getTimeDiff() {
    return (new Date() - START) / TICK_MS;
}

function renderNext(value, timelineElement) {
    const newElement = createEntryElement();

    newElement.textContent = value;

    const offset = getTimeDiff() * STEP;

    newElement.style.left = offset + 'px';

    const last = timelineElement.lastElementChild;

    if (last) {
        const lastOffset = parseInt(last.style.left, 10);

        if (offset - lastOffset < 5) {
            newElement.classList.add('shift');
        }
    }

    timelineElement.appendChild(newElement);
}

function renderComplete(timelineElement) {
    timelineElement.style.width = getTimeDiff() * STEP + 'px';
    timelineElement.style.transitionDuration = '0s';
}

function renderCompleteElement(timelineElement) {
    const newElement = createCompleteElement();

    let offset = getTimeDiff() * STEP;

    const last = timelineElement.lastElementChild;

    if (last) {
        const lastOffset = parseInt(last.style.left, 10);

        if (offset - lastOffset < last.offsetWidth) {
            // offset += last.offsetWidth;
            newElement.classList.add('close-to-entry')
        }
    }

    newElement.style.left = offset + 'px';

    timelineElement.appendChild(newElement);
}

function setTimeline(parentElement) {
    parentElement.appendChild(createTimelineElement());

    const timelineElement = parentElement.lastElementChild;
    const index = (parentElement.childNodes.length - 1) % COLOR_SCHEME.length;

    // timelineElement.style.transitionDuration = MAX_TIME_MS + 'ms';
    timelineElement.style.color = COLOR_SCHEME[index];

    setTimeout(() => {
        timelineElement.style.width = '0px';
    }, 0);

    setTimeout(() => {
        timelineElement.style.width = (((MAX_TIME_MS) / TICK_MS) * STEP) + 'px';
    }, 100);


    parentElement.appendChild(timelineElement);

    return timelineElement;
}

function startStream(parentElement, input$, delay = 0) {
    const timelineElement = setTimeline(parentElement);

    const subscription = Rx.Observable.of(null)
        .delay(delay)
        .switchMap(() => input$)
        .takeUntil(Rx.Observable.of(null).delay(MAX_TIME_MS))
        .subscribe({
            next: (value) => {
                renderNext(value, timelineElement);
            },
            complete: () => {
                renderCompleteElement(timelineElement);
            }
        });

    const unsubscribe = subscription.unsubscribe;

    subscription.unsubscribe = function (...args) {
        renderComplete(timelineElement);

        unsubscribe.apply(this, args);
    };

    return subscription;
}

function setSubjectTick1(subject) {
    subject.next(0);
    setTimeout(() => subject.next(1), 1000);
    setTimeout(() => subject.next(2), 2000);
    setTimeout(() => subject.next(3), 3000);
    setTimeout(() => subject.next(4), 4000);
    setTimeout(() => subject.complete(), 5000);
}

function run(stepFn, btnElement) {
    if (isRunning) {
        return;
    }

    START = new Date();
    isRunning = true;
    btnElement.disabled = true;
    stepFn();

    setTimeout(() => {
        isRunning = false;
        btnElement.disabled = false;
    }, MAX_TIME_MS);
}

function logToOutput(outputElement, value) {
    const logElement = document.createElement('div');

    logElement.textContent = value || '\xa0';

    outputElement.insertBefore(logElement, outputElement.firstChild);
}

function logAllToOutput(outputElement, items) {
    outputElement.innerHTML = '';

    items.forEach((item) => {
        logToOutput(outputElement, item);
    });
}

function fetchData(url) {
    if (!url) {
        return Rx.Observable.of([]);
    }

    const times = 1 + Math.floor(Math.random() * 7);
    const result = new Array(times)
        .fill(null)
        .map(() => getRandomWord(url));

    return Rx.Observable.of(result).delay(300 + Math.floor(Math.random() * 1000));
}

function getRandomWord(source) {
    return source + '_' + getRandomChar() + getRandomChar() + getRandomChar();
}

function getRandomChar() {
    const num = 97 + Math.floor(26 * Math.random());

    return String.fromCharCode(num);
}
