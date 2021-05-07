import * as alt from 'alt';
import * as game from 'natives';
let isNameTagVisible = false;

alt.everyTick(() => {
    if (!isNameTagVisible || isNameTagVisible == undefined) return;
    let players = alt.Player.all;
    if (players.length > 0) {
        let localPlayer = alt.Player.local;
        let playerPos = game.getEntityCoords(localPlayer.scriptID);

        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (!player.hasStreamSyncedMeta("sharedUsername")) continue;
            let playerPos2 = game.getEntityCoords(player.scriptID);
            let distance = game.getDistanceBetweenCoords(playerPos.x, playerPos.y, playerPos.z, playerPos2.x, playerPos2.y, playerPos2.z, true);

            if (distance <= 40.0 && `${player.getStreamSyncedMeta("sharedUsername")}` != `${localPlayer.getStreamSyncedMeta("sharedUsername")}`) {
                let scale = distance / (40 * 40.0);
                if (scale < 0.3)
                    scale = 0.3;

                let screenPos = game.getScreenCoordFromWorldCoord(playerPos2.x, playerPos2.y, playerPos2.z + 1);
                let health = game.getEntityHealth(player.scriptID);
                let armour = game.getPedArmour(player.scriptID);
                const [_, weapon] = game.getCurrentPedWeapon(player.scriptID, 0, 1);
                const ammo = game.getAmmoInPedWeapon(player.scriptID, weapon);
                health = health < 0 ? 0 : (health - 100);
                armour = armour < 0 ? 0 : armour;
                drawText(`${player.getStreamSyncedMeta("sharedUsername")} (${player.getStreamSyncedMeta("sharedId")}) - HP:${health} AR:${armour} AM:${player.getStreamSyncedMeta("CurrentAmmo  ")}`, screenPos[1], screenPos[2] - 0.030, scale, 255, 255, 255, 175, true);
            }
        }
    }
});

alt.on('keyup', (key) => {
    if (alt.Player.local.getSyncedMeta("ADMINLEVEL") <= 4) return;
    if (key == 121) { //F10 
        isNameTagVisible = !isNameTagVisible;
    }
});

alt.onServer('Server:GetAmmoCount', () => {
    const [_, weapon] = game.getCurrentPedWeapon(alt.Player.local.scriptID, 0, 1);
    const ammo = game.getAmmoInPedWeapon(alt.Player.local.scriptID, weapon);
    alt.emitServer("Server:SetAmmo", ammo);
});

function drawText(text, x, y, scale, r, g, b, a, outline) {
    game.setTextFont(0);
    game.setTextProportional(0);
    game.setTextScale(scale, scale);
    game.setTextColour(r, g, b, a);
    game.setTextDropShadow(0, 0, 0, 0, 255);
    game.setTextEdge(2, 0, 0, 0, 255);
    game.setTextCentre(1);
    game.setTextDropShadow();

    if (outline) game.setTextOutline();

    game.beginTextCommandDisplayText("STRING");
    game.addTextComponentSubstringUnk(text);
    game.endTextCommandDisplayText(x, y);
};