

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
let kleiderIndex = 0;

let currentPDFile = null;

var ringtone = new Audio('./sounds/ringtone.mp3');

let M_topsJson;

var gender = undefined;

async function fetchComponents(name) {
  const response = await fetch(`http://resource/client/cef/HUD/json/${name}.json`);
  const components = await response.json();

  return components;
}



function getTranslatedLabel(json, componentId, drawableId, textureId) {
  return json.reduce((acc, val) => {

    var item = val.ComponentVariations.find(item => item.componentId === componentId && item.drawableId !== drawableId && item.textureId === textureId);
      if (!item.ComponentVariations) {
          return null;
      }
      return item.label;
  });
}

function findComponentLabel(json, componentId, drawableId, textureId) {
  return json.find(item => item.componentId == componentId && item.drawableId == drawableId && item.textureId == textureId).label;
}





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

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
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
            <span class="car-name">${capitalize(car.carmodel)}</span>\
            <img class="car-image" src="img/car-pics/${capitalize(car.carmodel)}.png" ondragstart="return false;" onerror="this.onerror=null; this.src='css/assets/report.png'">\
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

alt.on('hud:openfrakgarage', (cars, frakId) => {
  if(Garage.style.display != 'none'){
      return;
  }
  CarSection.innerHTML = '';
  Garage.style.display = 'block';

  document.getElementById('garage-logo').src = `./img/fraklogos/${frakId}.png`

  let json = JSON.parse(cars);
  
      for (let i = 0; i < json.length; i++) {
          const car = json[i];
          
          

          CarSection.innerHTML += `<figure class="car text-center" data-parkedIn="${car.parkedIn}" data-carId="${car.carId}">\
          <span class="car-name">${car.carmodel}</span>\
          <img class="car-image" src="img/car-pics/${car.carmodel}.png" ondragstart="return false;" onerror="this.onerror=null; this.src='css/assets/report.png'">\
          <div class="car-number-plate">\
            <span>${car.numPlate}</span>\
          </div>\
        </figure>`
          
      }

      $('.car').on('click', function(obj)  {
        if($(this).attr('data-parkedIn') == 'false') {
          alt.emit('client:cef:hud:frakgarage:einparken', $(this).attr('data-carid'))
          $(this).css('display', 'none')
        }
        else if($(this).attr('data-parkedIn') == 'true'){
          alt.emit('client:cef:hud:frakgarage:ausparken', $(this).attr('data-carid'))
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
  document.getElementById('car-shop').style.display = 'none'
  document.getElementById('kleiderschrank').style.display = 'none'
  if(document.getElementById('clothesshop').style.display != 'none'){
    document.getElementById('clothesshop').style.display = 'none'
    alt.emit('hud:resetClothes');
  }
  document.getElementById('verarbeiter-container').style.display = 'none'
  
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

alt.on('hud:openItemShop', (items, shopId) => {
  $("#shop-überfallen").prop("onclick", null).off("click");
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
    <input class="shop-item-menge" type="number" value="1">\
    <button class="shop-buy-button"><img src="img/shop/kaufen.png"></button>\
  </div>`
  });

  $('.shop-buy-button').on('click', function(obj){
    var parent = ($(this).parent("div:first"));
    var itemId = parent.attr("data-id");
    var amount = (($(parent).find(":nth-child(6)").val()));
    alt.emit('hud:buyShopItem', itemId, amount);
  })
  
  $('#shop-überfallen').on('click', function(obj) {
    alt.emit('hud:startShopRob', shopId);
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

alt.on('hud:openAmmunation', (itemList, Id) => {
  var itemList = JSON.parse(itemList);
  $("#shop-überfallen").prop("onclick", null).off("click");
  itemshop.style.display = 'block';
  document.getElementById('shop-logo').src = `img/Ammunation/logo.png`;
  document.getElementById('shop-logo').style.marginLeft = '250px';
  document.getElementById('shop-logo').style.width = '150px';
  document.getElementById('shop-überfallen').style.display = 'block';
  
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
    alt.emit('hud:buyAmmunationItem', itemId, amount, Id);
    console.log("Buy ammunation")
  })

  $('#shop-überfallen').on('click', function(obj) {
    alt.emit('hud:startAmmoRob', Id);
  })
})

alt.on('hud:openPhone', (isStateFrak) => {
  document.getElementById('phone').style.display = 'block';
  if(isStateFrak == true){
    document.getElementById('appicons').style.marginTop = '370px';
    document.getElementById('akten-app').style.display = 'block';
    
    document.getElementById('app-pd').style.display = 'block';
    
  }
  else{
    document.getElementById('appicons').style.marginTop = '430px';
    document.getElementById('akten-app').style.display = 'none';
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

alt.on('hud:loadCarDealer', (cars, dealerId) => {
  var carList = JSON.parse(cars);
  var carContainer = document.getElementById('car-shop-div');
  carContainer.innerHTML = '';
  let counter = 0;
  document.getElementById('car-shop').style.display = 'block';
  carList.forEach(car => {
    carContainer.innerHTML += `<div class="car-buy">\
    <span class="car-name-shop">${car.Model}</span>\
    <span class="car-price-shop">${numberWithCommas(car.Price)} $</span>\
    <div class="buy-button-shop" data-carId="${counter}">\
      <span class="car-buy-s">$</span>\
    </div>\
  </div>`
  counter++;
  });



  $('.buy-button-shop').on('click', function(obj) {
    alt.emit('hud:dealer:buyCar', dealerId, $(this).attr('data-carId'));
  });
    
});


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
  document.getElementById('license-birthdate').innerText = birthday;
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
  document.getElementById('akten-app').style.display = 'none'
  document.getElementById('pd-app-namensuche').style.display = 'none'
  document.getElementById('pd-app-namesearch-result').style.display = 'none'
  document.getElementById('pd-app-offene-akten').style.display = 'none'
  document.getElementById('pd-app-akten-verteilen').style.display = 'none'
})

$('#akten-suchen').on('click', () => {
  var wantedName = document.getElementById('pdapp-suchen-input').value;
  alt.emit('hud:pdApp:searchNames', wantedName);
})

$('#app-pd').on('click', () => {
  document.getElementById('akten-app').style.display = 'block';
  document.getElementById('pd-app-namensuche').style.display = 'block';
})

alt.on('hud:fillPdNames', (namesRAW) => {

  let names = JSON.parse(namesRAW);

  document.getElementById('pd-app-namensuche').style.display = 'none';
  document.getElementById('pd-app-namesearch-result').style.display = 'block';
  document.getElementById('pd-names').innerHTML = '';

  names.forEach((name) => {
    document.getElementById('pd-names').innerHTML = `\
    <div class="pd-akte pd-person" data-firstName="${name.firstName}" data-lastName="${name.lastName}" data-playerId="${name.playerId}">\
    <span class="akte-name">${name.firstName} ${name.lastName} (${name.playerId})</span>\
  </div>`; 
  })

  $('.pd-person').on('click', function(obj) {
    alt.emit('hud:pdApp:openFile', $(this).attr('data-playerId'))
    currentPDFile = $(this).attr('data-playerId');
  })
})

alt.on('hud:pdApp:giveFile', (name, filesRAW) => {

  let files = JSON.parse(filesRAW);

  document.getElementById('pd-app-namensuche').style.display = 'none';
  document.getElementById('pd-app-namesearch-result').style.display = 'none';
  document.getElementById('pd-app-offene-akten').style.display = 'block';
  document.getElementById('pd-app-offene-akten-name').innerText = name;  

  document.getElementById('pd-akten-overview').innerHTML = '';
  
  let jailtime = 0;
  
  files.forEach(file => {
    document.getElementById('pd-akten-overview').innerHTML += `<div class="pd-akte" data-jailtime="${file.JailTime}" data-fine="${file.Fine}" data-aktenid="${file.AktenId}"">\
    <span class="akte-name">${file.Name}</span>\
    </div>`
    jailtime += file.JailTime;
  });

  document.getElementById('jailtime-count').innerHTML = `${jailtime} Hafteinheiten`;

  $('.pd-akte').on('click', function(obj) {
    $(this).toggleClass('pd-akte-highlighted')
  })
})

$('#pd-akte-loeschen').on('click', function (obj){
  let selectedFiles = [];
  $('.pd-akte-highlighted').each(function(index, item) {
    selectedFiles.push($(item).attr('data-aktenid'));
  });
  
  alt.emit('hud:pdApp:deleteFile', JSON.stringify(selectedFiles), currentPDFile);
  document.getElementById('pd-app-namensuche').style.display = 'block';
  document.getElementById('pd-app-offene-akten').style.display = 'none';
  document.getElementById('pd-app-akten-verteilen').style.display = 'none';
  
})

$('#pd-akte-geben').on('click', function(obj) {
  document.getElementById('pd-app-offene-akten').style.display = 'none';
  document.getElementById('pd-app-akten-verteilen').style.display = 'block';
})


    let $interactAction = "close",
      animDict = "",
      animName = "",
      duration = 0,
      animFlag = 0,
      type = 1,
      radius = '18em',
      start = -90;

    function toggleAnimationMenu(state, array) {
        if (!state) {
            $("#AnimationMenu").hide();
            return;
        }
        console.log(array)
        $("#AnimationMenu").html(array);
        iItems = $("li.animationitem");

        iItems.mouseleave(function() {
            $interactAction = "nothing";
            $("#AnimationMenu-Title").html("Schließen");
            animDict = null;
            animName = null;
            animFlag = null;
            duration = null;
        });

        iItems.mouseenter(function() {
            $interactAction = $(this).attr("data-action");
            animDict = $(this).attr("data-animDict");
            animName = $(this).attr("data-animName");
            animFlag = $(this).attr("data-animFlag");
            duration = $(this).attr("data-duration")
            interactString = $(this).attr("data-actionstring");
            $("#AnimationMenu-Title").html($(this).attr("data-actionstring"));
        });

        $("#AnimationMenu").show();
        transformAnimationMenuItems();
    }

    function transformAnimationMenuItems() {
        var $items = $('li.animationitem:not(:first-child)'),
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

  alt.on("CEF:Animation:toggleAnimationMenu", (state, array) => {
      toggleAnimationMenu(state, array);
  });

  alt.on("CEF:Animation:requestAnimation", () => {
    alt.emit("Client:Animation:giveRequestedAnimation", animDict, animName, duration, animFlag, $interactAction);
});










function resetClothingLists() {
  topsList = [];
  underShirtList = [];
  legsList = [];
  shoesList = [];
  torsosList = [];
  maskList = [];
  armorList = [];
  accessoryList = [];
  hatsList = [];
}
let topsList = [];
let underShirtList = [];
let legsList = [];
let shoesList = [];
let torsosList = [];
let armorList = [];
let maskList = [];
let accessoryList = [];
let hatsList = [];

let topsIndex = 0;
let legsIndex = 0;
let underShirtIndex = 0;
let shoesIndex = 0;

alt.on('client:closet:open', (clothingList, gender) => {
  if(gender == 1) gender = 'MALE';
  else if(gender == 0) gender = 'FEMALE'
  $("#closet-tops").prop("onclick", null).off("click");
  $("#closet-torsos").prop("onclick", null).off("click");
  $("#closet-legs").prop("onclick", null).off("click");
  $("#closet-shoes").prop("onclick", null).off("click");
  $("#closet-undershirts").prop("onclick", null).off("click");

  var clothes = JSON.parse(clothingList);
  document.getElementById('kleider-main').style.display = 'block';
  document.getElementById('kleiderschrank').style.display = 'block';
  document.getElementById('kleider-container').style.display = 'none';
  document.getElementById('kleider-container').innerHTML = '';
  resetClothingLists();

  clothes.forEach(c => {
    if(c.ComponentId == null || c.componentId == undefined || c.componentId == ""){
      if(c.PropId == 0) hatsList.push(c);
    }
    if(c.ComponentId == 11) topsList.push(c);
    if(c.ComponentId == 8) underShirtList.push(c);
    if(c.ComponentId == 4) legsList.push(c);
    if(c.ComponentId == 6) shoesList.push(c);
    if(c.ComponentId == 3) torsosList.push(c);
    if(c.ComponentId == 9) armorList.push(c);
    if(c.ComponentId == 1) maskList.push(c);
    if(c.ComponentId == 7) accessoryList.push(c);
    console.log("ClothID: " + c.ClothId + "ComponentID: " + c.componentId)
  }); 
  
  $('#closet-tops').on('click', () => {
    $(".kleiderschrank-cloth").prop("onclick", null).off("click");
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    topsList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        console.log("Fetching Name")
        fetchComponents(`${gender}_PED_VARIATION_TORSO2`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
    })
  })

  $('#closet-torsos').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    torsosList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_TORSO`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
    })
  })

  $('#closet-legs').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    legsList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_LEGS`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
      
    })
  })

  $('#closet-shoes').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    shoesList.forEach(t => {
      console.log("T.Name " + t.Name)
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_FEET`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else {
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
      
    })
  })

  $('#closet-armor').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    armorList.forEach(t => {
      console.log("T.Name " + t.Name)
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_FEET`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else {
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
      
    })
  })

  $('#closet-undershirts').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    underShirtList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_TORSO`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
      
    })
  })

  $('#closet-masks').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    maskList.forEach(t => {
      console.log("Adding Mask")
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_HEAD`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else {
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
    })
  })

  $('#closet-accessoires').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    accessoryList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_ACCESSORIES`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-cloth" data-clothId="${t.ClothId}" data-componentId="${t.ComponentId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
    })
  })

  $('#closet-hats').on('click', () => {
    document.getElementById('kleider-main').style.display = 'none';
    document.getElementById('kleider-container').style.display = 'block';
    document.getElementById('kleider-container').innerHTML = '';
    hatsList.forEach(t => {
      if(t.Name == null || t.Name == undefined){
        fetchComponents(`${gender}_PED_VARIATION_ACCESSORIES`).then(components => {
          var clothingName = findComponentLabel(components, t.ComponentId, t.DrawableId, t.ColorId);
          document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-prop" data-clothId="${t.ClothId}" data-propId="${t.PropId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${clothingName}</span>\
         </div>`
        });
      } else{
        document.getElementById('kleider-container').innerHTML += 
        `<div class="kleiderschrank-div kleiderschrank-prop" data-clothId="${t.ClothId}" data-propId="${t.PropId}" data-drawableId="${t.DrawableId}" data-colorId="${t.ColorId}">\
         <span class="kleiderschrank-span">${t.Name}</span>\
         </div>`
      }
    })
  })
})

$('#kleider-container').on('click', '.kleiderschrank-cloth', function(obj) {
    alt.emit('hud:changeClothing', $(this).attr('data-componentId'), $(this).attr('data-drawableId'), $(this).attr('data-colorId'), $(this).attr('data-propId'))
    alt.emit('closet:equipCloth', $(this).attr('data-clothId'))
})

$('#kleider-container').on('click', '.kleiderschrank-prop', function(obj) {
  alt.emit('hud:changeProp', $(this).attr('data-propId'), $(this).attr('data-drawableId'), $(this).attr('data-colorId'), $(this).attr('data-propId'))
  alt.emit('closet:equipCloth', $(this).attr('data-clothId'))
})



alt.on('client:clothingStore:FillUp', (kleider) => {

  let kleiderListe = JSON.parse(kleider)

  if(document.getElementById('clothesshop').style.display != 'block'){
    document.getElementById('clothesshop').style.display = 'block';
    topsList = [];
    underShirtList = [];
    legsList = [];
    shoesList = [];
    topsIndex = 0;
    underShirtIndex = 0;
    legsIndex = 0;
    shoesIndex = 0;
  }
 
  kleiderListe.forEach(c => {
    if(c.componentId == 11) topsList.push(c);
    if(c.componentId == 8) underShirtList.push(c);
    if(c.componentId == 4) legsList.push(c);
    if(c.componentId == 6) shoesList.push(c);
  }); 

  document.getElementById('clothescounthoodie').innerText = `${topsIndex}/${topsList.length}`
  document.getElementById('clothescounthemd').innerText = `${underShirtIndex}/${underShirtList.length}`
  document.getElementById('clothescountjeans').innerText = `${legsIndex}/${legsList.length}`
  document.getElementById('clothescountsneaker').innerText = `${shoesIndex}/${shoesList.length}`

})



$('#arrowlefthoodie').on('click', () => {
  topsIndex -= 1;
  if(topsIndex < 0) topsIndex = topsList.length;
  document.getElementById('clothescounthoodie').innerText = `${topsIndex}/${topsList.length}`
  alt.emit('hud:changeClothing', topsList[topsIndex].componentId, topsList[topsIndex].drawableId, topsList[topsIndex].colorId);
  
})

$('#arrowrighthoodie').on('click', () => {
  topsIndex += 1;
  if(topsIndex > topsList.length) topsIndex = 0;
  document.getElementById('clothescounthoodie').innerText = `${topsIndex}/${topsList.length}`
  alt.emit('hud:changeClothing', topsList[topsIndex].componentId, topsList[topsIndex].drawableId, topsList[topsIndex].colorId);

})

$('#clothes-buy-top').on('click', () => {
  alt.emit('hud:clothes:buy', topsList[topsIndex].clothId);
  
})

$('#arrowlefthemd').on('click', () => {
  underShirtIndex -= 1;
  if(underShirtIndex < 0) underShirtIndex = underShirtList.length;
  document.getElementById('clothescounthemd').innerText = `${underShirtIndex}/${underShirtList.length}`
  alt.emit('hud:changeClothing', underShirtList[underShirtIndex].componentId, topsList[underShirtIndex].drawableId, topsList[underShirtIndex].colorId);
})

$('#arrowrighthemd').on('click', () => {
  underShirtIndex += 1;
  if(underShirtIndex > underShirtList.length) underShirtIndex = 0;
  document.getElementById('clothescounthemd').innerText = `${underShirtIndex}/${underShirtList.length}`
  alt.emit('hud:changeClothing', underShirtList[underShirtIndex].componentId, underShirtList[underShirtIndex].drawableId, underShirtList[underShirtIndex].colorId);
})

$('#clothes-buy-undershirt').on('click', () => {
  alt.emit('hud:clothes:buy', underShirtList[underShirtIndex].clothId);
})

$('#arrowleftjeans').on('click', () => {
  legsIndex -= 1;
  if(legsIndex < 0) legsIndex = legsList.length;
  document.getElementById('clothescountjeans').innerText = `${legsIndex}/${legsList.length}`
  alt.emit('hud:changeClothing', legsList[legsIndex].componentId, legsList[legsIndex].drawableId, legsList[legsIndex].colorId);
})

$('#arrowrightjeans').on('click', () => {
  legsIndex += 1;
  if(legsIndex > legsList.length) legsIndex = 0;
  document.getElementById('clothescountjeans').innerText = `${legsIndex}/${legsList.length}`
  alt.emit('hud:changeClothing', legsList[legsIndex].componentId, legsList[legsIndex].drawableId, legsList[legsIndex].colorId);
})

$('#clothes-buy-legs').on('click', () => {
  alt.emit('hud:clothes:buy', legsList[legsIndex].clothId);
})

$('#arrowleftsneaker').on('click', () => {
  shoesIndex -= 1;
  if(shoesIndex < 0) shoesIndex = shoesList.length;
  document.getElementById('clothescountsneaker').innerText = `${shoesIndex}/${shoesList.length}`
  alt.emit('hud:changeClothing', shoesList[shoesIndex].componentId, shoesList[shoesIndex].drawableId, shoesList[shoesIndex].colorId);
})

$('#arrowrightsneaker').on('click', () => {
  shoesIndex += 1;
  if(shoesIndex > shoesList.length) shoesIndex = 0;
  document.getElementById('clothescountsneaker').innerText = `${shoesIndex}/${shoesList.length}`
  alt.emit('hud:changeClothing', shoesList[shoesIndex].componentId, shoesList[shoesIndex].drawableId, shoesList[shoesIndex].colorId);
})

$('#clothes-buy-shoes').on('click', () => {
  alt.emit('hud:clothes:buy', shoesList[shoesIndex].clothId);
})

    let $interactType = "none";

        $interactAction = "close";
        type = 1;
        radius = '18em';
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

alt.on('hud:openProducer', (producerinfo) => {
  $("#verarbeiter-input-fill-btn").prop("onclick", null).off("click");
  $("#verarbeiter-output-clear-btn").prop("onclick", null).off("click");

  var producerJson = JSON.parse(producerinfo);
  console.log(producerJson);
  document.getElementById('verarbeiter-container').style.display = 'block';
  $('#verarbeiter-container').attr('data-producerId', producerJson.Id)
  document.getElementById('verarbeiter-title').innerText = producerJson.Name;
  document.getElementById('verarbeiter-input-item-amount').innerText = "Vorhanden: " + producerJson.CurrentIn;
  document.getElementById('verarbeiter-ouput-item-amount').innerText = "Platz für: " + producerJson.CurrentOut;
  document.getElementById('verarbeiter-input-progress').value = producerJson.CurrentIn;
  document.getElementById('verarbeiter-output-progress').value = producerJson.CurrentOut;
  document.getElementById('verarbeiter-left-input').src = `img/items/${producerJson.InputName}.png`;
  document.getElementById('verarbeiter-right-output').src = `img/items/${producerJson.OutputName}.png`;

  $('#verarbeiter-input-fill-btn').on('click', function(obj) {
    console.log("Input")
    alt.emit('hud:verarbeiter:fill', $('#verarbeiter-container').attr('data-producerId'))
  })
  
  $('#verarbeiter-output-clear-btn').on('click', function(obj) {
    console.log("Output")
    alt.emit('hud:verarbeiter:empty', $('#verarbeiter-container').attr('data-producerId'))
  })
})

$('#pdapp-akte-geben').on('click', function(obj){
  alt.emit('hud:pdApp:requestAvailableFiles')
  console.log('Emitting Client File Request')
  document.getElementById('pd-app-akten-verteilen').style.display = 'block';
  document.getElementById('pd-app-offene-akten').style.display = 'none';
})


alt.on('hud:pdApp:FillFileAccordion', (files) => {


  $(".links").prop("onclick", null).off("click");
  $('.submenu a').prop('onclick', null).off("click");
  document.getElementById('accordion').innerHTML = files;
  console.log(files)
  


  $(function() {
    var Accordion = function(el, multiple) {
    this.el = el || {};
    this.multiple = multiple || false;
    
    var links = this.el.find('.link');
    
    links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
    }
    
    Accordion.prototype.dropdown = function(e) {
    var $el = e.data.el;
    $this = $(this),
    $next = $this.next();
    
    $next.slideToggle();
    $this.parent().toggleClass('open');
    
    if (!e.data.multiple) {
    $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
    };
    }
    
    var accordion = new Accordion($('#accordion'), false);
    });


    $('.submenu a').on('click', function(obj) {
      $(this).toggleClass('pd-akte-selected')
    })
})

$('#akte-speichern').on('click', function(obj) {
  let selectedFiles = [];
  $('.pd-akte-selected').each(function(index, item) {
    selectedFiles.push($(item).attr('data-aktenid'));
  });
  document.getElementById('pd-app-akten-verteilen').style.display = 'none';
  document.getElementById('pd-app-offene-akten').style.display = 'none';
  document.getElementById('pd-app-namensuche').style.display = 'block';
  alt.emit('hud:pdApp:saveFiles', selectedFiles, currentPDFile)
})