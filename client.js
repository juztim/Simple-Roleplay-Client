import * as alt from 'alt-client';
import native from 'natives';
import { LocalStorage } from 'alt';
import * as nametag from './nametags';
import * as siren from './siren';
import * as verarbeiter from './verarbeiter'

let lastInteract = 0;
let lastfarm = 0;
const interactCooldown = 2000;
const farmCooldown = 5000;

let camera;
let loginView;
let buergerBueroView;
let buegerBueroOpen;
let hudview;
let moneyHand;
let handsup = false;
let handsupTick;
let speedInterval;
let kilometerinterval;
let tempstring = undefined;
let rcInterval = null;
let markerList = [];

let selectedRaycastId = null,
    playerRC = null,
    vehicle = null,
    interactPlayer = null,
    interactVehicle = null,
    InteractMenuUsing = false,
    AnimationMenuUsing = false;
    


class Raycast {
    static player = alt.Player.local;

    static line(radius, distance) {
        if (rcInterval != null) alt.clearInterval(rcInterval);
        let position = native.getPedBoneCoords(alt.Player.local.scriptID, 31086, 0.5, 0, 0);
        let direction = GetDirectionFromRotation(native.getGameplayCamRot(2));
        let farAway = new alt.Vector3((direction.x * distance) + (position.x), (direction.y * distance) + (position.y), (direction.z * distance) + (position.z));
        let ray = native.startShapeTestCapsule(position.x, position.y, position.z, farAway.x, farAway.y, farAway.z, radius, -1, alt.Player.local.scriptID, 7);
        
        return this.result(ray);
    }

    static result(ray) {
        let result = native.getShapeTestResult(ray, undefined, undefined, undefined, undefined);
        let hitEntity = result[4];
        if (!native.isEntityAPed(hitEntity) && !native.isEntityAnObject(hitEntity) && !native.isEntityAVehicle(hitEntity)) return undefined;
        return {
            isHit: result[1],
            pos: new alt.Vector3(result[2].x, result[2].y, result[2].z),
            hitEntity,
            entityType: native.getEntityType(hitEntity),
            entityHash: native.getEntityModel(hitEntity)
        }
    }
}


function GetDirectionFromRotation(rotation) {
    var z = rotation.z * (Math.PI / 180.0);
    var x = rotation.x * (Math.PI / 180.0);
    var num = Math.abs(Math.cos(x));

    return new alt.Vector3(
        (-Math.sin(z) * num),
        (Math.cos(z) * num),
        Math.sin(x)
    );
}


const storage = LocalStorage.get();
    
alt.onServer('loadEntitySet', (es) => {
    let ID = native.getInteriorAtCoords(1050.456, -3194.30273, -37.3850822);
    native.activateInteriorEntitySet(ID, es);
    native.removeIpl("bkr_biker_dlc_int_ware02");
    native.requestIpl('bkr_biker_dlc_int_ware02');
})

alt.onServer('player:connect', () => {
    loginView = new alt.WebView("http://resource/client/cef/Login/index.html");
    alt.setTimeout(() => { 
        if(storage.get('username')){
            loginView.emit('login:cef:setStorage', storage.get('username'), storage.get('password'))
        }
     }, 2000);
    loginView.focus();

    camera = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", 652, -121, 423, -15, 0, 130, 60, true, 2);
    native.setClockTime(18, 0, 0);
    native.pauseClock(true);
    native.setWeatherTypeNow('EXTRASUNNY');

    native.setCamActive(camera, true);
    native.renderScriptCams(true, false, 0, true, false, 0);
    native.displayRadar(false);

    alt.showCursor(true);
    alt.toggleGameControls(false);

    alt.setStat('stamina', 100);
    alt.setStat('strength', 100);
    alt.setStat('lung_capacity', 100);
    alt.setStat('wheelie_ability', 100);
    alt.setStat('flying_ability', 100);
    alt.setStat('shooting_ability', 100);
    alt.setStat('stealth_ability', 100);
    loginView.on('client:login:register', (Name, Password) => {

        storage.set("username", Name);
        storage.set("password", Password);
        storage.save();

        native.requestAnimDict('missminuteman_1ig_2');

        alt.emitServer("client:login:register", Name, Password);
    });

    loginView.on('client:login:login', (Name, Password) => {
        alt.emitServer("client:login:login", Name, Password);
        storage.set("username", Name);
        storage.set("password", Password);
        storage.save();

        native.requestAnimDict('missminuteman_1ig_2');
    });

    alt.setInterval(() => {
        native.invalidateIdleCam();
    }, 5000);

    alt.everyTick(() => {
        native.setPedSuffersCriticalHits(alt.Player.local.scriptID, false);
        native.disableControlAction(alt.Player.local.scriptID, 140, true);
        native.disableControlAction(alt.Player.local.scriptID, 141, true);
        native.disableControlAction(alt.Player.local.scriptID, 142, true);

        //bullpup mk2
        native.setWeaponDamageModifier('0x84D6FAFD', 0.50);
        //pump action
        native.setWeaponDamageModifier('0x1D073A89', 0.4);
        //assault
        native.setWeaponDamageModifier('0xBFEFFF6D', 0.66);
        //carbine
        native.setWeaponDamageModifier('0x83BF0278', 0.45);
        //advanced
        native.setWeaponDamageModifier('0xAF113F99', 0.66);
        //gusenberg
        native.setWeaponDamageModifier('0x61012683', 0.80);
        //micro mp
        native.setWeaponDamageModifier('0x13532244', 0.75);
        //mini mp
        native.setWeaponDamageModifier('0xBD248B55', 0.66);
        //mp
        native.setWeaponDamageModifier('0x2BE6766B', 0.66);
        //mp mk2
        native.setWeaponDamageModifier('0x78A97CD0', 0.66);
        //combat pdw
        native.setWeaponDamageModifier('0xA3D4D34', 0.8);
        //specialcarbine
        native.setWeaponDamageModifier('0xC0A3098D', 0.35);
        //pistol
        native.setWeaponDamageModifier('0x1B06D571', 0.6);
        //pistol50
        native.setWeaponDamageModifier('0x99AEEB3B', 0.5);


        
    });


    native.requestIpl('chop_props');
    native.requestIpl('FIBlobby');
    native.removeIpl('FIBlobbyfake');
    native.requestIpl('FBI_colPLUG');
    native.requestIpl('FBI_repair');
    native.requestIpl('v_tunnel_hole');
    native.requestIpl('TrevorsMP');
    native.requestIpl('TrevorsTrailer');
    native.requestIpl('TrevorsTrailerTidy');
    native.removeIpl('farm_burnt');
    native.removeIpl('farm_burnt_lod');
    native.removeIpl('farm_burnt_props');
    native.removeIpl('farmint_cap');
    native.removeIpl('farmint_cap_lod');
    native.requestIpl('farm');
    native.requestIpl('farmint');
    native.requestIpl('farm_lod');
    native.requestIpl('farm_props');
    native.requestIpl('facelobby');
    native.removeIpl('CS1_02_cf_offmission');
    native.requestIpl('CS1_02_cf_onmission1');
    native.requestIpl('CS1_02_cf_onmission2');
    native.requestIpl('CS1_02_cf_onmission3');
    native.requestIpl('CS1_02_cf_onmission4');
    native.requestIpl('v_rockclub');
    native.requestIpl('v_janitor');
    native.removeIpl('hei_bi_hw1_13_door');
    native.requestIpl('bkr_bi_hw1_13_int');
    native.requestIpl('ufo');
    native.requestIpl('ufo_lod');
    native.requestIpl('ufo_eye');
    native.removeIpl('v_carshowroom');
    native.removeIpl('shutter_open');
    native.removeIpl('shutter_closed');
    native.removeIpl('shr_int');
    native.requestIpl('csr_afterMission');
    native.requestIpl('v_carshowroom');
    native.requestIpl('shr_int');
    native.requestIpl('shutter_closed');
    native.requestIpl('smboat');
    native.requestIpl('smboat_distantlights');
    native.requestIpl('smboat_lod');
    native.requestIpl('smboat_lodlights');
    native.requestIpl('cargoship');
    native.requestIpl('railing_start');
    native.removeIpl('sp1_10_fake_interior');
    native.removeIpl('sp1_10_fake_interior_lod');
    native.requestIpl('sp1_10_real_interior');
    native.requestIpl('sp1_10_real_interior_lod');
    native.removeIpl('id2_14_during_door');
    native.removeIpl('id2_14_during1');
    native.removeIpl('id2_14_during2');
    native.removeIpl('id2_14_on_fire');
    native.removeIpl('id2_14_post_no_int');
    native.removeIpl('id2_14_pre_no_int');
    native.removeIpl('id2_14_during_door');
    native.requestIpl('id2_14_during1');
    native.removeIpl('Coroner_Int_off');
    native.requestIpl('coronertrash');
    native.requestIpl('Coroner_Int_on');
    native.removeIpl('bh1_16_refurb');
    native.removeIpl('jewel2fake');
    native.removeIpl('bh1_16_doors_shut');
    native.requestIpl('refit_unload');
    native.requestIpl('post_hiest_unload');
    native.requestIpl('Carwash_with_spinners');
    native.requestIpl('KT_CarWash');
    native.requestIpl('ferris_finale_Anim');
    native.removeIpl('ch1_02_closed');
    native.requestIpl('ch1_02_open');
    native.requestIpl('AP1_04_TriAf01');
    native.requestIpl('CS2_06_TriAf02');
    native.requestIpl('CS4_04_TriAf03');
    native.removeIpl('scafstartimap');
    native.requestIpl('scafendimap');
    native.removeIpl('DT1_05_HC_REMOVE');
    native.requestIpl('DT1_05_HC_REQ');
    native.requestIpl('DT1_05_REQUEST');
    native.requestIpl('FINBANK');
    native.removeIpl('DT1_03_Shutter');
    native.removeIpl('DT1_03_Gr_Closed');
    native.requestIpl('golfflags');
    native.requestIpl('airfield');
    native.requestIpl('v_garages');
    native.requestIpl('v_foundry');
    native.requestIpl('hei_yacht_heist');
    native.requestIpl('hei_yacht_heist_Bar');
    native.requestIpl('hei_yacht_heist_Bedrm');
    native.requestIpl('hei_yacht_heist_Bridge');
    native.requestIpl('hei_yacht_heist_DistantLights');
    native.requestIpl('hei_yacht_heist_enginrm');
    native.requestIpl('hei_yacht_heist_LODLights');
    native.requestIpl('hei_yacht_heist_Lounge');
    native.requestIpl('hei_carrier');
    native.requestIpl('hei_Carrier_int1');
    native.requestIpl('hei_Carrier_int2');
    native.requestIpl('hei_Carrier_int3');
    native.requestIpl('hei_Carrier_int4');
    native.requestIpl('hei_Carrier_int5');
    native.requestIpl('hei_Carrier_int6');
    native.requestIpl('hei_carrier_LODLights');
    native.requestIpl('bkr_bi_id1_23_door');
    native.requestIpl('lr_cs6_08_grave_closed');
    native.requestIpl('hei_sm_16_interior_v_bahama_milo_');
    native.requestIpl('CS3_07_MPGates');
    native.requestIpl('cs5_4_trains');
    native.requestIpl('v_lesters');
    native.requestIpl('v_trevors');
    native.requestIpl('v_michael');
    native.requestIpl('v_comedy');
    native.requestIpl('v_cinema');
    native.requestIpl('V_Sweat');
    native.requestIpl('V_35_Fireman');
    native.requestIpl('redCarpet');
    native.requestIpl('triathlon2_VBprops');
    native.requestIpl('jetstegameurnel');
    native.requestIpl('Jetsteal_ipl_grp1');
    native.requestIpl('v_hospital');
    native.removeIpl('RC12B_Default');
    native.removeIpl('RC12B_Fixed');
    native.requestIpl('RC12B_Destroyed');
    native.requestIpl('RC12B_HospitalInterior');
    native.requestIpl('canyonriver01');
    native.requestIpl('bkr_biker_dlc_int_ware02 ');

    
});   

alt.onServer('server:login:finished', () => {
    native.destroyCam(camera.camera, true);
    native.renderScriptCams(false, false, 0, true, false, 0);
    native.displayRadar(true);
    loginView.destroy();
    alt.showCursor(false);
    alt.toggleGameControls(true);
    native.setPlayerHealthRechargeMultiplier(alt.Player.local.scriptID, 0);
    alt.everyTick(() => {
        markerList.forEach(marker => {
            native.drawMarker(0, marker.Pos.X, marker.Pos.Y, marker.Pos.Z, 0, 0, 0, 0, 0, 0, 1, 1, 1, 173, 216, 230, 255, true, false, 2, false, null, null, null);
        });
    })
    native.doorControl(native.getHashKey('v_ilev_fib_door2'), 142,4564, -770,2414, 242,3022, 0, 0, 0, 0);
    native.drawRect(0, 0, 0, 0, 0, 0, 0, 0);
})

alt.onServer('server:createHud', (createHud));



function tryCloseHud() {
    alt.toggleGameControls(true);
    alt.showCursor(false);
    hudview.emit('client:cef:hud:closeAll')
    
}

function createHud(money) {
    if(hudview){
        hudview.destroy()
        hudview = null;
        hudview = new alt.WebView('http://resource/client/cef/HUD/index.html');
    }
    else{
        hudview = null;
        hudview = new alt.WebView('http://resource/client/cef/HUD/index.html');
    }
    hudview.focus() 

    if(moneyHand == null){
        moneyHand = money;
    }
    
    alt.setTimeout(() => { 
        hudview.emit('client:cef:hud:money:setmoney', money);
     }, 300);
    

    hudview.on('client:cef:hud:garage:ausparken', (carmodel, licenseplate, objectid) => {
        alt.emitServer('client:garage:ausparken', carmodel, licenseplate, objectid);
    })

    hudview.on('client:cef:hud:garage:einparken', (carmodel, licenseplate, objectid, garage) => {
        alt.emitServer('client:garage:einparken', carmodel, licenseplate, objectid, garage);
    })

    hudview.on('client:cef:hud:frakgarage:einparken', (carId) => {
        alt.emitServer('client:frakgarage:einparken', carId);
    })

    hudview.on('client:cef:hud:frakgarage:ausparken', (carId) => {
        alt.emitServer('client:frakgarage:ausparken', carId);
    })

    hudview.on('client:cef:hud:atm:einzahlen', (money) => {
        alt.emitServer('client:atm:einzahlen', money)
        moneyHand -= parseInt(money);
        if(moneyHand < 0) return;

        
        hudview.emit('client:cef:hud:money:setmoney', moneyHand)
    })

    hudview.on('client:cef:hud:atm:auszahlen', (money) => {
        alt.emitServer('client:atm:auszahlen', money)
        moneyHand += parseInt(money);
        if(moneyHand < 0) return;
        alt.toggleGameControls(true)
        alt.showCursor(false);
        createHud(moneyHand)
    })

    hudview.on('client:cef:hud:atm:überweisen', (kontonummer, money) => {
        alt.emitServer('client:atm:überweisen', kontonummer, money)
        if(moneyHand < 0) return;
        alt.toggleGameControls(true)
        alt.showCursor(false);
        createHud(moneyHand)
    })

    hudview.on('client:useItem', (itemId, amount) => {
        alt.emitServer('server:useItem', itemId, amount)    
    })

    hudview.on('client:throwItem', (itemId, amount) => {
        alt.emitServer('server:removeItem', itemId, amount);
        
    })

    hudview.on('client:closeHUD', () => {
        alt.showCursor(false);
        alt.toggleGameControls(true);
    })

    hudview.on('hud:buyShopItem', (itemId, amount) => {
        alt.emitServer('client:itemshop:buyItem', itemId, amount);
    })

    hudview.on('hud:buyFrakItem', (itemId, amount, frakId) => {
        alt.emitServer('server:frakshop:buyItem', itemId, amount);
    })

    hudview.on('hud:joinPaintball', (arenaId) => {
        alt.emitServer('server:paintball:joinPaintball', arenaId)
        tryCloseHud()
    })

    hudview.on('hud:tankCar', (carId, fuelamount) => {
        alt.emitServer('server:tankstelle:tanken', carId, fuelamount);
        tryCloseHud()
    })

    hudview.on('hud:openBankingApp', () => {
        alt.emitServer('server:phone:openbanking');
    })

    hudview.on('hud:openGarageApp', () => {
        alt.emitServer('server:phone:opengarage');
    })

    hudview.on('hud:openTeamApp', () => {
        alt.emitServer('server:phone:openteamapp');
    })

    hudview.on('hud:trackCar', (posX, posY) => {
        alt.log("Set Waypoint: " + posX + " " + posY)
        native.setNewWaypoint(posX, posY);
    })

    hudview.on("Client:Interaction:giveRequestedAction", (typ, action) => {
        InteractionDoAction(typ, action);
    });

    hudview.on('hud:startCall', (phoneNumber) => {
        alt.emitServer('server:phone:startCall', phoneNumber);
    });

    hudview.on('hud:denyIncomingCall', () => {
        alt.emitServer('server:phone:denyIncoming');
    })

    hudview.on('hud:acceptIncomingCall', () => {
        alt.emitServer('server:phone:acceptIncoming');
    })

    hudview.on('hud:hangUpCall', () => {
        alt.emitServer('server:phone:auflegen');
        alt.log("AUFLEGEN JS")
    })

    hudview.on('hud:dealer:buyCar', (dealerId, carId) => {
        alt.emitServer('server:cardealer:buycar', dealerId, carId);
    })

    hudview.on('hud:changeClothing', (componentId, drawableId, colorId) => {
        native.setPedComponentVariation(alt.Player.local.scriptID, componentId, drawableId, colorId, 0);
    })

    hudview.on('hud:changeProp', (propId, drawableId, colorId) => {
        alt.log("Setprop: " + propId + " DrawableID: " + drawableId + " ColorID: " + colorId)
        native.setPedPropIndex(alt.Player.local.scriptID, propId, drawableId, colorId, true);
    })

    hudview.on('hud:startShopRob', (shopId) => {
        alt.emitServer('client:shop:startShopRob', shopId);
    })

    hudview.on('hud:pdApp:searchNames', (wantedName) => {
        alt.emitServer('server:pd:findNames', wantedName)
    })

    hudview.on('hud:clothes:buy', (clothId) => {
        alt.emitServer('server:clothing:buy', clothId)
        console.log("Buy client")
    })

    hudview.on('hud:resetClothes', () => {
        alt.emitServer('server:clothing:reset');
    })

    hudview.on('hud:buyAmmunationItem', (itemid, amount, ammoid) => {
        alt.emitServer('server:ammunation:buy', itemid, amount, ammoid)
    })
    
    hudview.on('hud:startAmmoRob', (Id) => {
        alt.emitServer('server:ammunation:rob', Id)
    })

    hudview.on('closet:equipCloth', (Id) => {
        alt.emitServer('server:closet:equipClothing', Id)
    })

    hudview.on('Client:Animation:giveRequestedAnimation', (animDict, animName, duration, animFlag, interactAction) => {
        if(interactAction == "close") {
            native.clearPedTasks(alt.Player.local.scriptID);
            alt.log("interactAction " + interactAction)
        }
        alt.log("interactAction " + interactAction)
        playAnimation(animDict, animName, duration, animFlag)
    })

    hudview.on('hud:verarbeiter:fill', (producerId) => {
        alt.emitServer('server:producer:fill', producerId)
    })

    hudview.on('hud:verarbeiter:empty', (producerId) => {
        alt.emitServer('server:producer:empty', producerId)
    })

    hudview.on('hud:pdApp:openFile', (playerId) => {
        alt.emitServer('server:pdApp:openFile', playerId)
    })

    hudview.on('hud:pdApp:requestAvailableFiles', () => {
        alt.log("Asking Server for Files...")
        alt.emitServer('server:pdApp:requestAvailableFiles');
    })

    hudview.on('hud:pdApp:saveFiles', (files, currentPDFile) => {
        alt.emitServer('server:pdApp:saveFiles', JSON.stringify(files), currentPDFile);
    })
    hudview.on('hud:pdApp:deleteFile', (files, currentPlayer) => {
        alt.emitServer('server:pdApp:deleteFiles', files, currentPlayer);
        alt.log("Delete Files -> Server")
    })
    
}

alt.onServer('server:register:finished', () => {
    native.destroyCam(camera.camera, true);
    native.renderScriptCams(false, false, 0, true, false, 0);
    native.displayRadar(true);
    loginView.destroy();
    alt.showCursor(false);
    alt.toggleGameControls(true);
})

alt.onServer('client:login:modal', (Title, Message) => {
    loginView.emit("view:login:showGeneralModal", Title, Message);
});

alt.onServer('client:hud:displayNotify', (message, title = "Titel", subtitle = "Untertitel", notifImage = null, iconType = 0, backgroundColor = null, durationMult = 1) => {
    native.beginTextCommandThefeedPost('STRING')
    native.addTextComponentSubstringPlayerName(message)
    if (backgroundColor != null) native.thefeedSetNextPostBackgroundColor(backgroundColor)
    if (notifImage != null) native.endTextCommandThefeedPostMessagetextTu(notifImage, notifImage, false, iconType, title, subtitle, durationMult)
    return native.endTextCommandThefeedPostTicker(false, true);
})

alt.onServer('player:aduty:enter', (sex, rank) => {
    let rankcolor;
    switch(rank){
        //Gamedesigner
        case 1:
            rankcolor = 12;
            break;
        //Guide 
        case 2:
            rankcolor = 13;
            break;
        //Dev
        case 3:
            rankcolor = 11;
            break;
        //Sup
        case 4:
            rankcolor = 5;
            break;
        //Mod
        case 5:
            rankcolor = 4;
            break;
        //Admin
        case 6:
            rankcolor = 3;
            break;
        //Superadmin
        case 7:
            rankcolor = 12;
            break;
        //Manager
        case 8:
            rankcolor = 2;
            break;
        //PL
        case 9:
            rankcolor = 1;
            break;
        
    }
    if(sex == 1){
        native.setPedComponentVariation(alt.Player.local.scriptID, 3, 3, 0, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 11, 287, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 4, 114, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 6, 78, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 1, 135, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 8, 57, 0, 0);
        native.setPlayerInvincible(alt.Player.local.scriptID, true);
        native.setPedCanRagdoll(alt.Player.local.scriptID, false);
    }
    else if (sex == 0) {
        native.setPedComponentVariation(alt.Player.local.scriptID, 1, 135, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 3, 3, 0, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 4, 121, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 6, 82, rankcolor, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 8, 2, 0, 0);
        native.setPedComponentVariation(alt.Player.local.scriptID, 11, 300, rankcolor, 0);
        native.setPlayerInvincible(alt.Player.local.scriptID, true);
        native.setPedCanRagdoll(alt.Player.local.scriptID, false);
    }
    
    
})

alt.onServer('player:aduty:leave', () => {
    native.setPlayerInvincible(alt.Player.local.scriptID, false);
    native.setPedCanRagdoll(alt.Player.local.scriptID, true);
})

alt.on('keyup', (key) => {
    if(key == 69 && alt.gameControlsEnabled()){
        alt.emitServer('server:pressE');
    }
    if(key == 27 && !alt.gameControlsEnabled()){
        tryCloseHud()
    }
    if(key == 73 && alt.gameControlsEnabled()){
        alt.emitServer('server:requestInv');
    }
    if(key == 33 && alt.gameControlsEnabled()){
        alt.emitServer('server:openPhone');
    }
    if(key == 34 && !alt.gameControlsEnabled()){
        alt.emitServer('server:closePhone');
    }
    if (key == 'X'.charCodeAt(0)) {
        if (hudview == null || InteractMenuUsing == false) return;
        hudview.emit("CEF:Interaction:requestAction");
        hudview.emit("CEF:Interaction:toggleInteractionMenu", "", false);
        InteractMenuUsing = false;
        hudview.unfocus();
        alt.showCursor(false);
        alt.toggleGameControls(true);
        return;
    }

    if (key == 'N'.charCodeAt(0)) {
        if (hudview == null || AnimationMenuUsing == false) return;
        hudview.emit("CEF:Animation:requestAnimation");
        hudview.emit("CEF:Animation:toggleAnimationMenu", "", false);
        AnimationMenuUsing = false;
        hudview.unfocus();
        alt.showCursor(false);
        alt.toggleGameControls(true);
        return;
    }

})

alt.on("keydown", (key) => {
    if (key == 'X'.charCodeAt(0) && alt.gameControlsEnabled()) {
        let result = Raycast.line(1.5, 2.5);
        if (result == undefined && !alt.Player.local.vehicle) return;
        if (!alt.Player.local.vehicle) {
            if (result.isHit && result.entityType != 0) {
                if (result.entityType == 1 && hudview != null) {
                    selectedRaycastId = result.hitEntity;
                    interactPlayer = alt.Player.all.find(x => x.scriptID == selectedRaycastId);
                    if (!interactPlayer) return;
                    InteractMenuUsing = true;
                    hudview.focus();
                    alt.showCursor(true);
                    alt.toggleGameControls(false);
                    alt.emitServer("Server:Interaction:GetPlayerInfo", interactPlayer);
                    interactPlayer = null;
                    return;
                } else if (result.entityType == 2 && hudview != null) {
                    selectedRaycastId = result.hitEntity;
                    interactVehicle = alt.Vehicle.all.find(x => x.scriptID == selectedRaycastId);
                    if (!interactVehicle) return;
                    InteractMenuUsing = true;
                    hudview.focus();
                    alt.showCursor(true);
                    alt.toggleGameControls(false);
                    alt.emitServer("Server:Interaction:GetVehicleInfo", "vehicleOut", interactVehicle);
                    interactVehicle = null;
                    return;
                }
            }
        }

        if (alt.Player.local.vehicle && hudview != null) {
            selectedRaycastId = alt.Player.local.vehicle.scriptID;
            interactVehicle = alt.Vehicle.all.find(x => x.scriptID == selectedRaycastId);
            InteractMenuUsing = true;
            hudview.focus();
            alt.showCursor(true);
            alt.toggleGameControls(false);
            if (!interactVehicle) return;
            alt.emitServer("Server:Interaction:GetVehicleInfo", "vehicleIn", interactVehicle);
            interactVehicle = null;
            return;
        }
    }

    if(key == 'N'.charCodeAt(0) && alt.gameControlsEnabled()){
        AnimationMenuUsing = true;
        hudview.focus();
        alt.showCursor(true);
        alt.toggleGameControls(false);
        alt.emitServer("Server:Animation:GetAnimations")
    }

    if(key == 72){
        
        if (!native.isPlayerDead(alt.Player.local) && !native.isPedSittingInAnyVehicle(alt.Player.local.scriptID) && alt.gameControlsEnabled()){
            if(handsup != true){
                alt.log("START PLAY")
                handsup = true;
                playAnimation("missminuteman_1ig_2", "handsup_base", -1, 51)
                return;
            }
            if(handsup == true){
                alt.log("STOP PLAY")
                handsup = false;
                native.clearPedTasks(alt.Player.local.scriptID);
                return;
            }
        }
    }

});


alt.onServer('client:playScenario', (scenario) => {
    native.taskStartScenarioInPlace(alt.Player.local.scriptID, scenario, 0, false);
})


alt.onServer('client:cef:loadItemShop', (items, shopId) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:openItemShop', items, shopId);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
    
})

alt.onServer('client:cef:loadBürgerBüro', () => {
    if(!buegerBueroOpen) {
        buergerBueroView = new alt.WebView('http://resource/client/cef/Buergerbuero/index.html');
        buergerBueroView.focus();
        alt.toggleGameControls(false);
        alt.showCursor(true);
        buegerBueroOpen = true;
        buergerBueroView.on('buergerbuero:cef:sendData', (vorname, nachname, geburtsdatum, geburtsort) => {
            alt.emitServer('server:buergerbuero:senddata', vorname, nachname, geburtsdatum, geburtsort);
            buergerBueroView.destroy();
            buergerBueroView == null;
            buegerBueroOpen = false;
            alt.toggleGameControls(true);
            alt.showCursor(false);
        })
    }
})

alt.on('consoleCommand', (command) => {
    if(command == "veh"){
        alt.log(alt.Player.local.vehicle.pos.x + ", " + alt.Player.local.vehicle.pos.y + ", " + alt.Player.local.vehicle.pos.z);
        alt.log(native.getEntityHeading(alt.Player.local.vehicle.scriptID));
    }
    if(command == "cords"){
        alt.log(alt.Player.local.pos.x + ", " + alt.Player.local.pos.y + ", " + alt.Player.local.pos.z);
        alt.log(native.getEntityHeading(alt.Player.local.scriptID));
    }
})

alt.onServer('player:aduty:setvehspeed', (speed) => {
    var handlingdata = alt.HandlingData.getForModel(alt.Player.local.vehicle.model);
    handlingdata.acceleration = speed;
})

alt.onServer('vehicle:setSpeed', (vehicle, speed) => {
    native.modifyVehicleTopSpeed(vehicle.scriptID, speed);
})




alt.onServer('player:aduty:setvehmass', (mass) => {
    var handlingdata = alt.HandlingData.getForModel(alt.Player.local.vehicle.model);
    handlingdata.mass = mass;
})

alt.onServer('client:cef:hud:loadgarage', (cars, garage) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:opengarage', cars, garage)
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now();
    }
})

alt.onServer('client:cef:hud:loadfrakgarage', (cars, frakId) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:openfrakgarage', cars, frakId)
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now();
    }
})

alt.onServer('client:cef:loadAtm', (pin, kontostand) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:openAtm', pin, kontostand)
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now();
    }
})

alt.onServer('client:interactions:loadGarage', (garageList) => {
    var garages = JSON.parse(garageList);
    garages.forEach(garage => {
        markerList.push(garage);

       let blip = new alt.PointBlip(garage.Pos.X, garage.Pos.Y, garage.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 524;
       blip.name = garage.Name + " Garage";

    });
})

alt.onServer('client:interactions:loadShops', (shopList) => {
    var shops = JSON.parse(shopList);
    shops.forEach(shop => {
       markerList.push(shop);
       let blip = new alt.PointBlip(shop.Pos.X, shop.Pos.Y, shop.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 52
       blip.color = 69;
       blip.name = '24/7'
    })
})

alt.onServer('client:interactions:loadFuelstations', (tankstellenList) => {
    var tankstellen = JSON.parse(tankstellenList);
    tankstellen.forEach(shop => {
       let blip = new alt.PointBlip(shop.Pos.X, shop.Pos.Y, shop.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 361;
       blip.color = 1;
       blip.name = 'Tankstelle'
    })
})

alt.onServer('client:interactions:loadClothingStores', (discountList, suburbanList, ponsonList) => {
    var discountStores = JSON.parse(discountList);
    var suburbanStores = JSON.parse(suburbanList);
    var ponsonStores = JSON.parse(ponsonList);
    //var ponsonList = JSON.parse(shopList);

    discountStores.forEach(shop => {
        markerList.push(shop);


       let blip = new alt.PointBlip(shop.Pos.X, shop.Pos.Y, shop.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 73;
       blip.color = 0;
       blip.name = 'Discountstore'
    })

    suburbanStores.forEach(shop => {
        markerList.push(shop);


       let blip = new alt.PointBlip(shop.Pos.X, shop.Pos.Y, shop.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 73;
       blip.color = 0;
       blip.name = 'Suburban'
    })

    ponsonStores.forEach(shop => {
        markerList.push(shop);


       let blip = new alt.PointBlip(shop.Pos.X, shop.Pos.Y, shop.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 73;
       blip.color = 0;
       blip.name = 'Ponsonboys'
    })
})

alt.onServer('client:interactions:loadFrakGarages', (list) => {
    var garages = JSON.parse(list);
    garages.forEach(garage => {
        markerList.push(garage);
    });
})

alt.onServer('client:interactions:loadFrakNPCs', (list) => {
    var npcs = JSON.parse(list);
    npcs.forEach(x => {
        markerList.push(x);
    });
})

alt.onServer('client:interactions:loadAmmunations', (list) => {
    var npcs = JSON.parse(list);
    npcs.forEach(x => {
        markerList.push(x);

        let blip = new alt.PointBlip(x.Pos.X, x.Pos.Y, x.Pos.Z);
        blip.shortRange = true;
        blip.sprite = 110;
        blip.color = 0;
        blip.name = x.Name;
    });
})

alt.onServer('client:setClothes', (componentId, drawableId, colorId) => {
    native.setPedComponentVariation(alt.Player.local.scriptID, componentId, drawableId, colorId, 0);
})

alt.onServer('client:clothes:loadClothes', (clothesRAW) => {
    let clothes = JSON.parse(clothesRAW);
    clothes.forEach(function (cloth) {
        native.setPedComponentVariation(alt.Player.local.scriptID, cloth.componentId, cloth.drawableId, cloth.colorId, 0);
    });
    
})


alt.onServer('client:playAnim', (animDict, animName) => {
    alt.log("Play anim")
    native.requestAnimDict(animDict);
    let interval = alt.setInterval(() => {
        if (native.hasAnimDictLoaded(animDict)) {
            alt.clearInterval(interval);
            native.taskPlayAnim(alt.Player.local.scriptID, animDict, animName, 8.0, 1, -1, 48, 1, false, false, false);
        }
    }, 0);
})

alt.onServer('client:playAnimation', (animDict, animName, duration, flags) => {
    alt.log("Play " + animName)
    native.requestAnimDict(animDict);
    let interval = alt.setInterval(() => {
        if (native.hasAnimDictLoaded(animDict)) {
            alt.clearInterval(interval);
            native.taskPlayAnim(alt.Player.local.scriptID, animDict, animName, 8.0, 1, duration, flags, 1, false, false, false);
        }
    }, 0);
})

alt.onServer('client:hud:showCarHud', (kilometer, fuel) => {
    hudview.emit('client:cef:hud:car:show', kilometer, fuel)
    speedInterval = alt.setInterval(() => {
        if(alt.Player.local.vehicle){
            native.setPedConfigFlag(alt.Player.local.scriptID, 241, true);
            native.setPedConfigFlag(alt.Player.local.scriptID, 429, true);
            let vehSpeed = (Math.round(native.getEntitySpeed(alt.Player.local.vehicle.scriptID) * 3.6))
            hudview.emit('client:cef:hud:car:updateSpeed', vehSpeed)
        }
    }, 50)
    
    kilometerinterval = alt.setInterval(() => {
        let distanceTravelled = (Math.round(native.getEntitySpeed(alt.Player.local.vehicle.scriptID)));
        let spritVerbrauch = ((Math.round(native.getEntitySpeed(alt.Player.local.vehicle.scriptID) * 3.6)) / 10000);
        alt.emitServer('client:cef:hud:car:updateStats', distanceTravelled, spritVerbrauch);
        hudview.emit('client:cef:hud:car:updateStats', distanceTravelled, spritVerbrauch);
    }, 1000)


})

alt.onServer('client:hud:showGasstation', (carId) => {
    if(Date.now() - lastInteract > interactCooldown) {
    hudview.emit("hud:showGasStation", carId);
    alt.toggleGameControls(false);
    alt.showCursor(true);
    hudview.focus();
    lastInteract = Date.now()
    }
})

alt.onServer('client:hud:closeCarHud', (kilometer, fuel) => {
    hudview.emit('client:cef:hud:car:close', kilometer, fuel)
    alt.clearInterval(speedInterval);
    alt.clearInterval(kilometerinterval);
})

alt.onServer('client:hud:loadInventory', (inventory) => {
    if(Date.now() - lastInteract > interactCooldown){
        let invList = JSON.parse(inventory);
        hudview.emit('hud:showInv', invList);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:hud:updatemoney', (money) => {
    hudview.emit('client:cef:hud:money:setmoney', money);
})

alt.onServer('client:cef:loadPaintball', (arenas) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:showPaintball', arenas);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:feld:farmen', (feldId) => {
    if(Date.now() - lastfarm > farmCooldown){
        alt.emitServer('server:feld:farmen', feldId);
        lastfarm = Date.now()
        playAnimation('pickup_object', 'pickup_low', 4500, 1)
    }
})


alt.onServer('client::updateVoiceRange', (voiceRange) => {
    hudview.emit("hud:changeVoiceRange", voiceRange)
})

alt.onServer('client:openPhone', (isStateFrak) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit("hud:openPhone", isStateFrak);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:closePhone', () => {
    hudview.emit("hud:closePhone");
    native.clearPedTasks(alt.Player.local.scriptID);
    tryCloseHud()
})

alt.onServer('client:loadCarDealer', (cars, dealerId) => {
    
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:loadCarDealer', cars, dealerId)
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:interactions:loadCarDealers', (dealerList) => {
    var dealers = JSON.parse(dealerList);
    let modelHash = native.getHashKey('cs_josh');
    dealers.forEach(dealer => {
        markerList.push(dealer);


       let blip = new alt.PointBlip(dealer.Pos.X, dealer.Pos.Y, dealer.Pos.Z);
       blip.shortRange = true;
       blip.sprite = 326;
       blip.name = dealer.Name;
    });
        
})


alt.onServer('client:phone:openbanking', (firstname, lastname, kontostand) => {
    hudview.emit("hud:openbanking", firstname, lastname, kontostand);
})

alt.onServer('client:phone:opengarage', (carjson) => {
    hudview.emit("hud:opengarageapp", carjson);
})

alt.onServer('client:phone:openteamapp', (teamjson) => {
    if(teamjson == "nofrak"){
        alt.log("keine frak!!");
        return;
    }
    hudview.emit("hud:openteamapp", teamjson)
})



alt.onServer('client:loadClothesStore', (clothingList) => {
    if(alt.gameControlsEnabled()){
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
    }
        
    hudview.emit('client:clothingStore:FillUp', clothingList);    
})

alt.onServer('client:openCloset', (clothingList, gender) => {
    if(alt.gameControlsEnabled()){
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
    }
    hudview.emit('client:closet:open', clothingList, gender);
})

alt.onServer('client:loadFrakShop', (itemlist, frak) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:openFrakShop', itemlist, frak);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:loadAmmunation', (itemList, Id) => {
    if(Date.now() - lastInteract > interactCooldown){
        hudview.emit('hud:openAmmunation', itemList, Id);
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        lastInteract = Date.now()
    }
})

alt.onServer('client:pdapp:fillNames', (results) => {
    hudview.emit('hud:fillPdNames', results);
})


alt.onServer("Client:Interaction:SetInfo", (typ, array) => {
    if (hudview == null) return;
    hudview.emit("CEF:Interaction:toggleInteractionMenu", typ, true, array);
});

alt.onServer("Client:Animations:SetInfo", (array) => {
    if (hudview == null) return;
    hudview.emit("CEF:Animation:toggleAnimationMenu", true, array);
});

alt.onServer("client:phone:startCall", (number) => {
    hudview.emit('hud:startPhoneCall', number);
})

alt.onServer('client:phone:incomingCall', (number) => {
    hudview.emit('hud:incomingCall', number)
})

alt.onServer('server:phone:denyCall', () => {
    hudview.emit('hud:denyCall');
})

alt.onServer('server:phone:hangUpCall', () => {
    hudview.emit('hud:hangUpCall');
})



alt.onServer('client:interaction:showIdCard', (firstname, lastname, birthdate) => {
    hudview.emit('hud:showIdCard', firstname, lastname, birthdate);
})

alt.onServer('client:interaction:showLicenses', (firstname, lastname, birthday, licenses) => {
    hudview.emit('hud:showLicenses', firstname, lastname, birthday, licenses)
})

alt.onServer('Client:Interaction:openTrunk', (veh, setOpen) => {
    if(setOpen){
        native.setVehicleDoorOpen(veh.scriptID, 5, false, false);
    }
    else{
        native.setVehicleDoorShut(veh.scriptID, 5, false);
    }
    
})

alt.onServer('AllClients:Vehicle:Repair', (veh) => {
    native.setVehicleFixed(veh.scriptID);
})

alt.onServer('NetOwner:DestroyVehicle', (veh) => {
    native.setVehicleEngineHealth(veh.scriptID, -1);
})

function InteractionDoAction(type, action) {
    if (selectedRaycastId != null && selectedRaycastId != 0 && type != "none") {
        if (type == "vehicleOut" || type == "vehicleIn") type = "vehicle";
        if (type == "vehicle") {
            vehicle = alt.Vehicle.all.find(x => x.scriptID == selectedRaycastId);
            if (!vehicle) return;
            switch (action) {
                case "lockVehicle":
                    alt.emitServer("Server:Interaction:lockVehicle", vehicle);
                    break;
                case "toggleEngine":
                    alt.emitServer("Server:Interaction:toggleEngine", vehicle);
                    break;
                case "fuelVehicle":
                    alt.emitServer("Server:Raycast:fuelVehicle", vehicle);
                    break;
                case "toggleTrunk":
                    alt.emitServer("Server:Raycast:toggleTrunk", vehicle);
                    break;
                case "openTrunk":
                    alt.emitServer("Server:Interaction:openTrunk", vehicle);
                    break;
                case "repairCar":
                    alt.emitServer("Server:Interaction:repairVehicle", vehicle);
            }
            vehicle = null;
        } else if (type == "player") {
            playerRC = alt.Player.all.find(x => x.scriptID == selectedRaycastId);
            if (!playerRC) return;
            switch (action){
                case "supportInfo":
                    alt.emitServer("Server:Interaction:showSupportInfo", playerRC);
                    break;
                case "showIDCard":
                    alt.emitServer("Server:Interaction:showIDCard", playerRC);
                    break;
                case "showLicenses":
                    alt.emitServer("Server:Interaction:showLicenses", playerRC);
                    break;
                case "reanimate":
                    alt.emitServer("Server:Interaction:reanimate", playerRC);
                    break;
                case "healPlayer":
                    alt.emitServer("Server:Interaction:healPlayer", playerRC);
                    break;
            }
            playerRC = null;
        }
        selectedRaycastId = null;
    }
}

function playAnimation(animDict, animName, duration, flag) {
    alt.log("Duration: " + duration)
    native.requestAnimDict(animDict);
    let interval = alt.setInterval(() => {
        if (native.hasAnimDictLoaded(animDict)) {
            alt.clearInterval(interval);
            native.taskPlayAnim(alt.Player.local.scriptID, animDict, animName, 8.0, 1, duration, flag, 1, false, false, false);
        }
    }, 0);
}

alt.onServer('client:openProducer', (producerInfo) => {
    if(alt.gameControlsEnabled()){
        alt.toggleGameControls(false);
        alt.showCursor(true);
        hudview.focus();
        hudview.emit('hud:openProducer', producerInfo);
    }
    
})

alt.onServer('client:pdApp:openRequestedFile', (name, files) => {
    hudview.emit('hud:pdApp:giveFile', name, files)
})

alt.onServer('client:pdApp:giveAvailableFiles', (files) => {
    hudview.emit('hud:pdApp:FillFileAccordion', files)
})