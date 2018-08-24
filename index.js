const maxTimerCount = 60;
const deckSize = 100;

let currentCards = [];
let handSize = deckSize;
let skippedCards = [];
let usedCards = [];
let timerCount = maxTimerCount;
let counter;
let turn = 1;
let teamOnePoints = 0;
let teamTwoPoints = 0;
let round = 1;
let roundOneTeamOnePoints = 0;
let roundTwoTeamOnePoints = 0;
let roundThreeTeamOnePoints = 0;
let roundOneTeamTwoPoints = 0;
let roundTwoTeamTwoPoints = 0;
let roundThreeTeamTwoPoints = 0;

$(document).ready(() => {
    resetTimer();

    $.getJSON("cards.json", function (data) {debugger;
        currentCards = shuffle(data).slice(0, deckSize);

        loadCard("empty-card-template", {
            turn: turn,
            teamOnePoints: teamOnePoints,
            teamTwoPoints: teamTwoPoints,
            round: round,
            roundOneTeamOnePoints: 0,
            roundTwoTeamOnePoints: 0,
            roundThreeTeamOnePoints: 0,
            roundOneTeamTwoPoints: 0,
            roundTwoTeamTwoPoints: 0,
            roundThreeTeamTwoPoints: 0
        });
    });

    $('#next').click(() => {
        let currentCardIndex = currentCards.length - 1;
        let currentCardPoints = parseInt(currentCards[currentCardIndex].points);

        if (turn === 1) {
            teamOnePoints += currentCardPoints;
        } else {
            teamTwoPoints += currentCardPoints;
        }

        usedCards = usedCards.concat(currentCards.splice(currentCardIndex));
        getNextCard();
    });

    $('#skip').click(() => {
        skippedCards = skippedCards.concat(currentCards.splice(currentCards.length - 1));
        getNextCard();
    });

    $('#start').click(() => {
        setButtons('start');

        counter = setInterval(timer, 1000);
        getNextCard();
    });

    $('#restart').click(() => {
        window.location.href = window.location.pathname + "?" + $.param({'restart': 'true'})
    });

    $('#info').click(() => {
        $('.step1.instructions').modal('show');
    });

    $('.coupled.instructions').modal({
        allowMultiple: false
    });
    $('.step2.instructions').modal('attach events', '.step1.modal .button');
    $('.step3.instructions').modal('attach events', '.step2.modal .button');
    $('.step4.instructions').modal('attach events', '.step3.modal .button');
    $('.step5.instructions').modal('attach events', '.step4.modal .button');
    $('.step6.instructions').modal('attach events', '.step5.modal .button');
});

function getNextCard() {
    if (currentCards.length > 0) {
        let currentCard = currentCards[currentCards.length - 1];
        currentCard['index'] = handSize - currentCards.length + 1;
        currentCard['handSize'] = handSize;
        loadCard("card-template", currentCard);
    } else {
        clearInterval(counter);
        if (skippedCards.length > 0) {
            nextTurn();
        } else {
            nextRound()
        }
    }
}

function loadCard(templateName, context) {
    let source = document.getElementById(templateName).innerHTML;
    let template = Handlebars.compile(source);
    let html = template(context);
    $('#card').remove();
    $('#empty-card').remove();
    $('#card-container').prepend(html);
}

function resetTimer() {
    timerCount = maxTimerCount;
    let $timer = $('.timer');
    $timer.progress({
        total: maxTimerCount,
        value: maxTimerCount,
        showActivity: false,
        autoSuccess: false
    });
}

function setButtons(option) {
    let $next = $('#next'), $skip = $('#skip'), $start = $('#start'), $restart = $('#restart');

    if (option === 'initialize') {
        $next.addClass('hidden');
        $skip.addClass('hidden');
        $start.removeClass('hidden');
    } else if (option === 'start') {
        $next.removeClass('hidden');
        $skip.removeClass('hidden');
        $start.addClass('hidden');
    } else {
        $next.addClass('hidden');
        $skip.addClass('hidden');
        $start.addClass('hidden');
        $restart.removeClass('hidden');
    }
}

function nextRound() {
    updateRoundPoints();

    if (round === 3) {
        let tie = teamOnePoints === teamTwoPoints;
        let winner = (teamTwoPoints > teamOnePoints) ? 2 : 1;

        loadCard("winner-card-template", {
            tie: tie,
            winner: winner,
            teamOnePoints: teamOnePoints,
            teamTwoPoints: teamTwoPoints
        });

        setButtons('finish');
    } else {
        round++;

        nextTurn();
        currentCards = shuffle(currentCards.concat(skippedCards).concat(usedCards));
        skippedCards = [];
        usedCards = [];
        handSize = currentCards.length;
    }
}

function nextTurn() {
    turn = (turn === 1) ? 2 : 1;

    updateRoundPoints();

    resetTimer();

    setButtons('initialize');

    loadCard("empty-card-template", {
        turn: turn,
        teamOnePoints: teamOnePoints,
        teamTwoPoints: teamTwoPoints,
        round: round,
        roundOneTeamOnePoints: roundOneTeamOnePoints,
        roundTwoTeamOnePoints: roundTwoTeamOnePoints,
        roundThreeTeamOnePoints: roundThreeTeamOnePoints,
        roundOneTeamTwoPoints: roundOneTeamTwoPoints,
        roundTwoTeamTwoPoints: roundTwoTeamTwoPoints,
        roundThreeTeamTwoPoints: roundThreeTeamTwoPoints
    });

    currentCards = shuffle(currentCards.concat(skippedCards));
    skippedCards = [];
    debugger;
    handSize = currentCards.length;
}

function updateRoundPoints() {
    if (round === 1) {
        roundOneTeamOnePoints = teamOnePoints;
        roundOneTeamTwoPoints = teamTwoPoints;
    } else if (round === 2) {
        roundTwoTeamOnePoints = teamOnePoints - roundOneTeamOnePoints;
        roundTwoTeamTwoPoints = teamTwoPoints - roundOneTeamTwoPoints;
    } else {
        roundThreeTeamOnePoints = teamOnePoints - roundOneTeamOnePoints - roundTwoTeamOnePoints;
        roundThreeTeamTwoPoints = teamTwoPoints - roundOneTeamTwoPoints - roundTwoTeamTwoPoints;
    }
}

function timer() {
    let $timer = $('.timer');

    timerCount--;
    if (timerCount <= 0) {
        clearInterval(counter);
        nextTurn();
        return;
    }

    $timer.progress({
        total: maxTimerCount,
        value: timerCount,
        showActivity: false,
        autoSuccess: false
    });
}
