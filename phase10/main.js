function randCard() {
  var value = null;
  var color = "blue";
  var tries = 0;
  do {
    var index = Math.floor(Math.random() * deck.length);
    tries++;
    if(tries > deck.length) {
      deck = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 4];
    }
  } while (!(deck[index] > 0));
  deck[index]--;
  if (index == 48) {
    value = "wild";
  } else if(index == 49) {
    value = "skip";
  } else {
    value = index%12 + 1;
    color = colors[Math.floor(index/12)];
  }
  return [value,color];
}

function createDivClass(myClass) {
  let newEl = document.createElement("div");
  newEl.classList.add(myClass);
  return newEl;
}

function setup() {
  for(let i = 0; i < 10; i++) {
    let newFake = createDivClass("fakeCard");
    newFake.dataset.slot = i;
    newFake.addEventListener("dragenter", cardDragEnter);
    document.body.appendChild(newFake);
  }
}

function genCard() {
  let newCard = createDivClass("card");
  let innerCard = createDivClass("innerCard");
  let newCardFront = createDivClass("front");
  let frontContainer = createDivClass("container");
  let topArt = createDivClass("topArt");
  let botArt = createDivClass("botArt");
  let frontValue = createDivClass("value");
  let newCardBack = createDivClass("back");
  newCard.appendChild(innerCard);
  innerCard.appendChild(newCardBack);
  innerCard.appendChild(newCardFront);
  newCardFront.appendChild(frontContainer);
  frontContainer.appendChild(topArt);
  frontContainer.appendChild(botArt);
  frontContainer.appendChild(frontValue);

  let valueColor = randCard();
  newCard.dataset.value = valueColor[0];
  newCard.dataset.color = valueColor[1];
  newCard.dataset.slot = "stack";
  newCard.addEventListener("click", drawCard);
  newCard.addEventListener("dragenter", cardDragEnter);
  newCard.addEventListener("dragstart", dragStart);
  newCard.addEventListener("dragend", dragEnd);
  document.body.appendChild(newCard);
}

function updateHandScore() {
  let score = 0;
  for(let i = 0; i < handSize; i++) {
    if(hand[i] == null) {
      score += 0;
    } else if(hand[i].dataset.value == "wild") {
      score += 25;
    } else if(hand[i].dataset.value == "skip") {
      score += 15;
    } else if(hand[i].dataset.value < 10) {
      score += 5;
    } else {
      score += 10;
    }
  }
  document.getElementById("handScore").innerText = "Score: " + score;
}

function drawCard(evt) {
  let targetSlot = -1;
  for(var i = 0; i < handSize; i++) {
    if(hand[i] == null) {
      targetSlot = i;
      break;
    }
  }
  if(targetSlot == -1) {
    alert("no more slots available");
  } else {
    genCard();
    let drawnCard = null;
    if(evt == null) {
      drawnCard = document.querySelectorAll(".card[data-slot='stack']")[0];
    } else {
      drawnCard = evt.currentTarget;
    }
    hand[targetSlot] = drawnCard;
    drawnCard.dataset.slot = targetSlot;
    setTimeout(function() {
      drawnCard.addEventListener("click", discardCardEvt);
      drawnCard.draggable = true;
    }, 1000);
    drawnCard.removeEventListener("click", drawCard);
    updateHandScore();
  }
}

function discardCardEvt(evt) {
  discardCard(evt.currentTarget.dataset.slot);
  evt.currentTarget.removeEventListener("click", discardCardEvt);
}

function discardCard(ind) {
  let targEl = hand[ind];
  let discardIndex = discardStack.length;
  discardStack[discardIndex] = targEl;
  if(discardIndex > 0) {
    discardStack[discardIndex-1].style.zIndex = 2;
  }
  if(discardIndex > 1) {
    let removeElem = discardStack[discardIndex-2];
    discardStack[discardIndex-2] = [removeElem.dataset.value, removeElem.dataset.color];
    removeElem.remove();
  }
  hand[ind] = null;
  targEl.dataset.slot = "discard";
  targEl.removeEventListener("dragenter", cardDragEnter);
  targEl.removeEventListener("dragstart", dragStart);
  targEl.removeEventListener("dragend", dragEnd);
  targEl.addEventListener("dragenter", discardDragEnter);
  updateHandScore();
}

function discardDragEnter(evt) {
  console.log("DISCARDING");
}

function getValue(card, style, colorValues) {
  if(card.dataset.value == "wild") {
    return 26;
  } else if(card.dataset.value == "skip") {
    return 28;
  } else if(style == "color") { // sort by color
    return (parseInt(card.dataset.value)/20) + colorValues[card.dataset.color];
  } else { // sort by value
    return parseInt(card.dataset.value) + (colorValues[card.dataset.color]/20);
  }
}

function sortSlots(style) {
  let colorValues = {"red":handSize, "yellow": handSize, "green": handSize, "blue": handSize};
  for(let i = 0; i < handSize; i++) {
    if(hand[i] != null) {
      colorValues[hand[i].dataset.color]--;
    }
  }
  colorValues["red"] = colorValues["red"]*2 + 0.0;
  colorValues["yellow"] = colorValues["yellow"]*2 + 0.6;
  colorValues["green"] = colorValues["green"]*2 + 1.2;
  colorValues["blue"] = colorValues["blue"]*2 + 1.8;
  for(let i = 0; i < handSize; i++) {
    var recLow = null;
    for(let j = i; j < handSize; j++) {
      if(hand[j] == null) {
        continue;
      }
      if(recLow == null) {
        recLow = j;
      } else if(getValue(hand[j], style, colorValues) < getValue(hand[recLow], style, colorValues)) {
        recLow = j;
      }
    }
    let temp = hand[i];
    hand[i] = hand[recLow];
    if(hand[i]) {
      hand[i].dataset.slot = i;
    }
    hand[recLow] = temp;
  }
}

function drawNCards(n) {
  for(let i = 0; i < n; i++) {
    setTimeout(drawCard, 400*i);
  }
}

function dragStart(evt) {
  dragging = parseInt(evt.target.dataset.slot);
  evt.target.classList.add("dragging");
  setTimeout(function(){evt.target.classList.add("hidden");},1);
}

function dragEnd(evt) {
  evt.target.classList.remove("dragging");
  evt.target.classList.remove("hidden");
}

function shiftCardsRec(ind, dir) { // dir=-1 for left : +1 for right
  if(ind < 0 || ind >= handSize) {
    return false;
  }
  if(hand[ind] == null) {
    return true;
  }
  if(shiftCardsRec(ind+dir, dir)) {
    moveCardTo(ind, ind+dir);
    return true; // moved this left, now this spot is open
  } else {
    return false; // couldnt move left, this spot not open
  }
}

function shiftCards(ind, dir, allowSwap) {
  let currInd = ind;
  let targInd = -1;
  let swap = true;

  while(currInd >= 0 && currInd < handSize) {
    if(targInd != -1 && hand[currInd] != null) {
      swap = false;
    }
    if(hand[currInd] == null && targInd == -1) {
      targInd = currInd;
    }
    currInd += dir;
  }
  if(targInd == -1 || (swap && allowSwap)) {
    return false;
  }
  for(let i = targInd; (i-targInd)*dir > (ind-targInd)*dir; i-=dir) {
    moveCardTo(i, i-dir);
  }
  return true;
}

function disableMoving(el) {
  el.dataset.moving = true;
  setTimeout(function(){el.dataset.moving = false;},510);
}

function moveCardTo(fromInd, toInd) {
  let fromEl = hand[fromInd];
  let toEl = hand[toInd];
  hand[toInd] = fromEl;
  hand[fromInd] = toEl;
  if(fromEl) {
    fromEl.dataset.slot = toInd;
    disableMoving(fromEl);
  }
  if(toEl) {
    toEl.dataset.slot = fromInd;
    disableMoving(toEl);
  }
}

function cardDragEnter(evt) {
  if(this.dataset.moving == "true") {evt.preventDefault();return;}
  if(this.classList.contains("card") && parseInt(this.dataset.slot) != dragging) {
    let targetInd = parseInt(this.dataset.slot);
    let targetElem = this;
    let dragEl = hand[dragging];
    hand[dragging] = null;

    if(targetInd > dragging && shiftCards(targetInd, 1, true) == false) { // dragging card to the right
      shiftCards(targetInd, -1, false);
    } else if(targetInd < dragging && shiftCards(targetInd, -1, true) == false) {
      shiftCards(targetInd, 1, false);
    }

    hand[targetInd] = dragEl;
    dragEl.dataset.slot = targetInd;
    dragging = targetInd;
  } else if(this.classList.contains("fakeCard") && hand[parseInt(this.dataset.slot)] == null) {
    let targetInd = parseInt(this.dataset.slot);
    let dragEl = hand[dragging];

    hand[dragging] = null;
    hand[targetInd] = dragEl;
    dragEl.dataset.slot = targetInd;
    dragging = targetInd;
  }
  evt.preventDefault();
}

function playRun(evt) {
  let runLength = 6;
  let prevPlay = played[played.length-1];
  if(!prevPlay || parseInt(prevPlay.dataset.value)+1 == parseInt(evt.currentTarget.dataset.value)) {
    played.push(evt.currentTarget);
    // evt.currentTarget.style.marginTop = "-25vh";
    evt.currentTarget.dataset.slot = "out0-" + (played.length-1);
  } else {
    alert("You suck");
  }
  if(played.length == runLength) {
    alert("done");
  }
}

function playCards() {
  let runLength = 6;
  alert("Pick the beginning of your run of " + runLength);
  let clickEvt = playRun;

  for(let i = 0; i < hand.length; i++) {
    if(hand[i]) {
      hand[i].removeEventListener("click", discardCardEvt);
      hand[i].addEventListener("click", clickEvt);
    }
  }
}

var deck = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 4];
var colors = ["red", "blue", "green", "yellow"];
var hand = [];
var handSize = 10;
var discardStack = [];
var dragging = null;
let played = [];

setup();
genCard();
drawNCards(10);
