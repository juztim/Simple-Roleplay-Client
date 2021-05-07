var MoneyCount = document.getElementById('MoneyHUD-currentMoney');
var Garage = document.getElementById('Garage-Container');
var CarSection = document.getElementById('car-section');

var atm = document.getElementById('atm');
var atmlogin = document.getElementById('atmlogin')
var atmmenü = document.getElementById('atmmenü')
var atmpayin = document.getElementById('atmpayin')
var atmpayout = document.getElementById('atmpayout')
var atmtransfer = document.getElementById('atmtransfer')
var itemshop = document.getElementById('shop')

var inventar = document.getElementById('inventar')
var inventarcontainer = document.getElementById('item-container')

let kontoPin;
let kontoStand;
let kilometer = 0;
let fuel = 0;

var ringtone = new Audio('./sounds/ringtone.mp3');



document.addEventListener("DOMContentLoaded", function(event) {
    if('alt' in window){
        alt.emit('client:cef:hud:loaded')
    }
  });

alt.on('client:cef:hud:money:setmoney', (money) => {
    MoneyCount.innerHTML = "$"+ numberWithCommas(money);
})

alt.on('client:cef:hud:car:show',(distance, sprit) => {
  fuel = sprit;
  document.getElementById('car-hud').style.display = 'block'
  document.getElementById('fuel-progress').value = fuel;
  kilometer = distance;


})

alt.on('client:cef:hud:car:updateStats', (distance, sprit) => {
  kilometer += distance
  fuel -= sprit;
  document.getElementById('range').textContent = (kilometer / 1000).toFixed(2) + ' KM';
  document.getElementById('fuel-progress').value = fuel;
  
})

alt.on('client:cef:hud:car:updateSpeed', (speed) => {
  document.getElementById('kmh').textContent = speed + ' KM/H';
})

alt.on('client:cef:hud:car:close',(kilometer, fuel) => {
  document.getElementById('car-hud').style.display = 'none'
})

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

alt.on('hud:opengarage', (cars, garage) => {
    if(Garage.style.display != 'none'){
        return;
    }
    CarSection.innerHTML = '';
    Garage.style.display = 'block';

    let json = JSON.parse(cars);
    
        for (let i = 0; i < json.length; i++) {
            const car = json[i];
            
            

            CarSection.innerHTML += `<figure class="car text-center" data-license="${car.numPlate}" data-carmodel="${car.carmodel}" data-objectid="${car.objectId}" data-parkedIn="${car.parkedIn}">\
            <span class="car-name">${car.carmodel}</span>\
            <img class="car-image" src="css/assets/${car.carmodel}.png" ondragstart="return false;" onerror="this.onerror=null; this.src='css/assets/report.png'">\
            <div class="car-number-plate">\
              <span>${car.numPlate}</span>\
            </div>\
          </figure>`
            
        }

        $('.car').on('click', function(obj)  {
          if($(this).attr('data-parkedIn') == 'false') {
            alt.emit('client:cef:hud:garage:einparken', `${$(this).attr('data-carmodel')}`, `${$(this).attr('data-license')}`, `${$(this).attr('data-objectid')}`, garage)
            $(this).css('display', 'none')
          }
          else if($(this).attr('data-parkedIn') == 'true'){
            alt.emit('client:cef:hud:garage:ausparken', `${$(this).attr('data-carmodel')}`, `${$(this).attr('data-license')}`, `${$(this).attr('data-objectid')}`)
            $(this).css('display', 'none')
          }
        
        })
})

alt.on('client:cef:hud:closeAll', () => {
  atm.style.display = 'none';
  atmlogin.style.display = 'none';
  atmmenü.style.display = 'none';
  atmpayin.style.display = 'none';
  atmpayout.style.display = 'none';
  atmtransfer.style.display = 'none';
  document.getElementById('inventar').style.display = 'none'
  Garage.style.display = 'none';
  atm.style.display = 'none';
  itemshop.style.display = 'none';
  document.getElementById('paintball').style.display = 'none'
  document.getElementById('fuel-station').style.display = 'none'
})

alt.on('hud:openAtm', (pin, kontostand) => {
  if(atm.style.display != 'none'){
    return;
  }
  atm.style.display = 'block';
  atmlogin.style.display = 'block';
  kontoPin = pin;
  kontoStand = kontostand;

})

alt.on('hud:showInv', (items) => {
  inventar.style.display = 'block'
  inventarcontainer.innerHTML = ''
  let totalWeight = 0.0;
  items.forEach(item => {
    inventarcontainer.innerHTML += `<div class="item" data-selected="false" data-itemName="${item.itemName}" data-amount="${item.amount}" data-itemId="${item.itemId}">\
    <span id="itemname">${item.itemName} (${item.amount}x)</span>\
    <img id="itempicture" src="img/items/${item.itemName}.png">\
  </div>`
  totalWeight += (item.weight * item.amount)
  });
  document.getElementById('invgewicht').textContent = `${totalWeight} KG / 50 KG`

  $('.item').on('click', function(obj){
    if($(this).attr('data-selected') == 'true'){
      $(this).toggleClass('selected');
      $(this).attr('data-selected', 'false');
    }
    else{
      $(this).toggleClass('selected');
      $(this).attr('data-selected', 'true')
    }
  })
})


$('#inventar-benutzen').on('click', function(obj){
  let selectedItems = [];
  $('.item').each(function(index, item) {
    if($(this).attr('data-selected') == 'true'){
      selectedItems.push(item);
    }
    
  });
  
  
  if(selectedItems.length > 1 ||selectedItems.length == 0 || document.getElementById('invmenge').value == 0){
    return;
  }

  let itemId = $(selectedItems[0]).attr('data-itemId');
  let maxAmountItem = $(selectedItems[0]).attr('data-amount');
  let itemAmount = document.getElementById('invmenge').value
  if(itemAmount > maxAmountItem) {
    return;
  }
  document.getElementById('inventar').style.display = 'none'
  alt.emit('client:closeHUD');
  alt.emit('client:useItem', itemId, itemAmount)
  inventarcontainer.innerHTML = ''
})

$('#inventar-wegwerfen').on('click', function(obj){
  let selectedItems = [];
  $('.item').each(function(index, item) {
    if($(this).attr('data-selected') == 'true'){
      selectedItems.push(item);
    }
    
  });
  
  
  if(selectedItems.length > 1 ||selectedItems.length == 0 || document.getElementById('invmenge').value == 0){
    return;
  }

  let itemId = $(selectedItems[0]).attr('data-itemId');
  let maxAmountItem = $(selectedItems[0]).attr('data-amount');
  let itemAmount = document.getElementById('invmenge').value
  if(itemAmount > maxAmountItem) {
    return;
  }
  alt.emit('client:throwItem', itemId, itemAmount)
  alt.emit('client:closeHUD');
  document.getElementById('inventar').style.display = 'none'
})



$('#atm-checkin').on('click', function(obj) {
  let pinInput = document.getElementById('atm-loginPin').value;

  if(pinInput == kontoPin){
    atmlogin.style.display = 'none';
    openAtmMenu()
  }
  else {
    
  }
})

function openAtmMenu() {
  atmmenü.style.display = 'block';
  let kontoId = document.getElementById('atm-kontostand')
  kontoId.textContent = '$' + numberWithCommas(kontoStand);
}

$('#atm-einzahlenBTN').on('click', function(obj) {
  atmmenü.style.display = 'none'
  atmpayin.style.display = 'block'
})

$('#atm-überweisenBTN').on('click', function(obj) {
  atmmenü.style.display = 'none'
  atmtransfer.style.display = 'block'
})

$('#atm-auszahlenBTN').on('click', function(obj) {
  atmmenü.style.display = 'none'
  atmpayout.style.display = 'block'
  
})

$('#atm-payinBTN').on('click', function(obj){
  var money = $('#atm-payin-input').val();

  alt.emit('client:cef:hud:atm:einzahlen', money);
})

$('#atm-payoutBTN').on('click', function(obj){
  var money = $('#atm-payout-input').val();

  alt.emit('client:cef:hud:atm:auszahlen', money);
})

$('#atm-transferBTN').on('click', function(obj){
  var money = $('#atm-überweisen-value').val();
  var kontoNummer = $('#atm-überweisen-kontonummer').val()

  alt.emit('client:cef:hud:atm:überweisen', kontoNummer, money);
})

alt.on('hud:openItemShop', (items, shopName) => {
  document.getElementById('shop-logo').src = "img/shop/24-7-Logo.png";
  var itemList = JSON.parse(items);
  itemshop.style.display = 'block';
  var container = document.getElementById('shop-item-container');
  container.innerHTML = '';
  itemList.forEach(item => {
    container.innerHTML += `<div class="shop-item" data-id="${item.itemId}">\
    <img class="shop-item-pic" src="img/items/${item.name}.png">\
    <span class="shop-item-span">${item.name}</span>\
    <img class="shop-item-line" src="img/shop/item-line.png">\
    <span class="shop-item-price">${item.price} $</span>\
    <img class="shop-item-line" src="img/shop/item-line.png">\
    <input class="shop-item-menge" type="number">\
    <button class="shop-buy-button"><img src="img/shop/kaufen.png"></button>\
  </div>`
  });

  $('.shop-buy-button').on('click', function(obj){
    var parent = ($(this).parent("div:first"));
    var itemId = parent.attr("data-id");
    var amount = (($(parent).find(":nth-child(6)").val()));
    alt.emit('hud:buyShopItem', itemId, amount);
  })
})

alt.on('hud:showPaintball', (arenaList) => {
  arenaList = JSON.parse(arenaList)
  console.log(arenaList);
  document.getElementById('paintball').style.display = 'block'
  document.getElementById('arena1-players').innerText = `${arenaList[0].arenaName} (${arenaList[0].playerCount}/${arenaList[0].playerMax})`
  document.getElementById('arena1-price').innerText = `$${arenaList[0].price}`

  document.getElementById('arena2-players').innerText = `${arenaList[1].arenaName} (${arenaList[1].playerCount}/${arenaList[1].playerMax})`
  document.getElementById('arena2-price').innerText = `$${arenaList[1].price}`

  document.getElementById('arena3-players').innerText = `${arenaList[2].arenaName} (${arenaList[2].playerCount}/${arenaList[2].playerMax})`
  document.getElementById('arena3-price').innerText = `$${arenaList[2].price}`
})

$('.join-button').on('click', function(obj){
  var arenaId = $(this).parent("div:nth-child(1)").attr('data-arenaId')
  alt.emit('hud:joinPaintball', arenaId)
  console.log(arenaId);
});


alt.on('hud:changeVoiceRange', (voicerange) => {
  let bgColor = undefined;
  switch (voicerange) {
    case 3:
      bgColor = '#368049'
      break;
    case 8:
      bgColor = '#FF9900 '
      break;
    case 15:
      bgColor = '#FF0000'
      break;
  
    default:
      break;
  }
  document.getElementById('mic-div').style.backgroundColor = bgColor;

})

alt.on('hud:openClothingShop', (clothingList) => {
  var clothes = JSON.parse(clothingList);
  var tops = clothes.filter(j => j.componentId == 11);
  console.log(tops.length)

  //Tops
})

alt.on('hud:openFrakShop', (itemList, frak) => {
  var itemList = JSON.parse(itemList);
  itemshop.style.display = 'block';
  document.getElementById('shop-logo').src = `img/fraklogos/${frak}.png`;
  document.getElementById('shop-überfallen').style.display = 'none';
  var container = document.getElementById('shop-item-container');
  container.innerHTML = '';
  itemList.forEach(item => {
    container.innerHTML += `<div class="shop-item" data-id="${item.itemId}">\
    <img class="shop-item-pic" src="img/items/${item.name}.png">\
    <span class="shop-item-span">${item.name}</span>\
    <img class="shop-item-line" src="img/shop/item-line.png">\
    <span class="shop-item-price">${item.price} $</span>\
    <img class="shop-item-line" src="img/shop/item-line.png">\
    <input class="shop-item-menge" type="number">\
    <button class="shop-buy-button"><img src="img/shop/kaufen.png"></button>\
  </div>`
  });

  $('.shop-buy-button').on('click', function(obj){
    var parent = ($(this).parent("div:first"));
    var itemId = parent.attr("data-id");
    var amount = (($(parent).find(":nth-child(6)").val()));
    alt.emit('hud:buyFrakItem', itemId, amount);
  })
})


alt.on('hud:openPhone', (isStateFrak) => {
  document.getElementById('phone').style.display = 'block';
  if(isStateFrak == true){
    document.getElementById('appicons').style.marginTop = '370px';
    document.getElementById('app-pd').style.display = 'block';

  }
  else{
    document.getElementById('appicons').style.marginTop = '430px';
    document.getElementById('app-pd').style.display = 'none';
  }
})

alt.on('hud:closePhone', () => {
  document.getElementById('phone').style.display = 'none';
})

alt.on('hud:openbanking', (firstname, lastname, kontoStand) => {

  document.getElementById('bankingapp').style.display = 'block';
  document.getElementById('phone').style.display = 'block';
  document.getElementById('homescreen').style.display = 'none'
  document.getElementById('bankingappstand').innerText = '$' + numberWithCommas(kontoStand);
  document.getElementById('bankingappname').innerText = `${firstname} ${lastname}`

})

alt.on('hud:opengarageapp', (carjson) => {
  document.getElementById('garageapp-conatiner').innerHTML = ''
  document.getElementById('homescreen').style.display = 'none'
  document.getElementById('garageapp').style.display = 'block'

  var cars = JSON.parse(carjson);
  cars.forEach(car => {
    if(car.parkedIn == false){
    document.getElementById('garageapp-conatiner').innerHTML += `<div id="garageappspan">\
    <span id="carplate">${car.carmodel} (${car.numPlate})</span>\
    <span id="carowner">${car.ownerId}</span>\
    <span id="carplace">${car.garageId}</span>\
    <img id="imgmap" class="trackcar" src="img/Handy/map.png" data-posX="${car.pos.X}" data-posY="${car.pos.Y}">\
    <img id="phoneline2" src="img/Handy/line.png">\
  </div>`
    }
    else if(car.parkedIn == true){
    document.getElementById('garageapp-conatiner').innerHTML += `<div id="garageappspan">\
    <span id="carplate">${car.carmodel} (${car.numPlate})</span>\
    <span id="carowner">${car.ownerId}</span>\
    <span id="carplace">${car.garageId}</span>\
    <img id="phoneline2" src="img/Handy/line.png">\
  </div>`
    }
  });

  $('.trackcar').on('click', function(obj){
    var posX = $(this).attr("data-posX")
    var posY = $(this).attr("data-posY")
    alt.emit("hud:trackCar", posX, posY)
  })
})

alt.on('hud:openteamapp', (teamjson) => {
  
  document.getElementById('homescreen').style.display = 'none'
  document.getElementById('team-app').style.display = 'block'

  var members = JSON.parse(teamjson);
  document.getElementById('teamapp-container').innerHTML = ''

  members.forEach(member => {
    document.getElementById('teamapp-container').innerHTML += `<div class="teamapp-person">\
    <span class="teamapp-rang-span">Rang: ${member.rank}</span>\
    <span class="teamapp-name-span">${member.firstName} ${member.lastName}</span>\
    <img class="teamapp-call" src="img/Handy/team-call.png">\
    <img class="teamapp-settings"  src="img/Handy/team-settings.png">\
    <img class="teamapp-sms" src="img/Handy/team-sms.png">\
  </div>`
  })
})



alt.on('hud:showGasStation', (carId) => {
  document.getElementById('fuel-station').style.display = 'block'
  $('#fuel-station').attr('data-carId', carId)
})


alt.on('hud:startPhoneCall', (number) => {
  document.getElementById('direkt-call').style.display = 'none'
  document.getElementById('klingelt').style.display = 'block'
  document.getElementById('incomming-name').innerText = number;
})

alt.on('hud:incomingCall', (number) => {
  document.getElementById('call-incomming').style.display = 'block'
  document.getElementById('call-incomming-name').innerText = number;
  
  ringtone.loop = true;
  ringtone.volume = 0.1;
  ringtone.play();
})


$('#call-incoming-accept').on('click', () => {
  alt.emit('hud:acceptIncomingCall');
  document.getElementById('call-incomming').style.display = 'none';
  ringtone.pause();
})

$('#call-incoming-deny').on('click', () => {
  alt.emit('hud:denyIncomingCall');
  document.getElementById('call-incomming').style.display = 'none';
  ringtone.pause();
})

$('#phone-auflegen').on('click', () => {
  alt.emit('hud:hangUpCall');
  console.log("AUFLEGEN HUD")
  document.getElementById('klingelt').style.display = 'none';
})

alt.on('hud:denyCall', () => {
  document.getElementById('klingelt').style.display = 'none';
})

alt.on('hud:hangUpCall', () => {
  document.getElementById('call-incomming').style.display = 'none';
  ringtone.pause();
})


alt.on('hud:showIdCard', (firstname, lastname, birthday) => {
  document.getElementById('id-card').style.display = 'block';
  document.getElementById('idcard_surname').innerText = firstname
  document.getElementById('idcard_lastname').innerText = lastname
  document.getElementById('idcard_birthday').innerText = birthday
  document.getElementById('idcard_signature').innerText = firstname + " " + lastname;

  setTimeout(() => {
    document.getElementById('id-card').style.display = 'none';
  }, 5000);
})

alt.on('hud:showLicenses', (firstname, lastname, birthday, licenses) => {
  document.getElementById('driving-licence').style.display = 'block';
  document.getElementById('license-firstname').innerText = firstname;
  document.getElementById('license-lastname').innerText = lastname;
  document.getElementById('license-birthday').innerText = birthday;
  document.getElementById('license-classes').innerText = licenses;

  setTimeout(() => {
    document.getElementById('driving-licence').style.display = 'none';
  }, 5000);
})


$('#app-funk').on('click', function(obj) {
  document.getElementById('funk-app').style.display = 'block'
  document.getElementById('homescreen').style.display = 'none'
})

$('#app-banking').on('click', function(obj){
  alt.emit('hud:openBankingApp')
})

$('#app-garage').on('click', function(obj) {
  alt.emit('hud:openGarageApp')
})

$('#app-team').on('click', function(obj) {
  alt.emit('hud:openTeamApp')
})

$('#app-phone').on('click', function(obj) {
  document.getElementById('direkt-call').style.display = 'block';
})

$('#call-direct-button').on('click', function(obj){
  var number = document.getElementById('call-direct-input').value;
  alt.emit('hud:startCall', number);
})

$('#fuel-small').on('click', function(obj) {
  var fuelAmount = $('#liter-slider').val()
  var carId = $('#fuel-station').attr('data-carId')

  alt.emit('hud:tankCar', carId, fuelAmount);
})  

$('#liter-slider').on('input change', function() {

  $('#liter-insgesamt').text(`${$(this).val()}` + ' L');
  
  $('#price-insgesamt').text(`${parseInt($(this).val()) * 20}$`)
});

$('.pfeil').on('click', () => {
  document.getElementById('homescreen').style.display = 'block';
  document.getElementById('bankingapp').style.display = 'none'
  document.getElementById('garageapp').style.display = 'none'
  document.getElementById('kontakteapp').style.display = 'none'
  document.getElementById('team-app').style.display = 'none'
  document.getElementById('team-app-leader').style.display = 'none'
  document.getElementById('funk-app').style.display = 'none'
  document.getElementById('direkt-call').style.display = 'none'
  document.getElementById('klingelt').style.display = 'none'
  document.getElementById('call-incomming').style.display = 'none'
})


$('#app-pd').on('click', () => {
  document.getElementById('akten-app').style.display = 'block';
  document.getElementById('pd-app-namensuche').style.display = 'block';
})



let $interactType = "none",
        $interactAction = "close",
        type = 1,
        radius = '18em',
        start = -90;

    function toggleInteractionMenu(typ, state, array) {
        if (!state) {
            $("#InteractionMenu").hide();
            return;
        }

        $interactType = typ;
        $("#InteractionMenu").html(array);
        iItems = $("li.interactitem");

        iItems.mouseleave(function() {
            $interactAction = "close";
            $("#InteractionMenu-Title").html("Schließen");
        });

        iItems.mouseenter(function() {
            $interactAction = $(this).attr("data-action");
            interactString = $(this).attr("data-actionstring");
            $("#InteractionMenu-Title").html($(this).attr("data-actionstring"));
        });

        $("#InteractionMenu").show();
        transformInteractMenuItems();
    }

    function transformInteractMenuItems() {
        var $items = $('li.interactitem:not(:first-child)'),
            numberOfItems = (type === 1) ? $items.length : $items.length - 1,
            slice = 360 * type / numberOfItems;

        $items.each(function(i) {
            var $self = $(this),
                rotate = slice * i + start,
                rotateReverse = rotate * -1;

            $self.css({
                'transform': 'rotate(' + rotate + 'deg) translate(' + radius + ') rotate(' + rotateReverse + 'deg)'
            });
        });
    }

    alt.on("CEF:Interaction:toggleInteractionMenu", (typ, state, array) => {
      toggleInteractionMenu(typ, state, array);
  });

alt.on("CEF:Interaction:requestAction", () => {
    alt.emit("Client:Interaction:giveRequestedAction", $interactType, $interactAction);
});
