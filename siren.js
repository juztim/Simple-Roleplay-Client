import * as alt from 'alt-client';
import native from 'natives';

alt.everyTick(() => {
    let allcars = alt.Vehicle.all;
    allcars.forEach(car => {
        native.setVehicleHasMutedSirens(car.scriptID, car.getStreamSyncedMeta("sirenState"));
    });
});

alt.on('keyup', (key) => {
    if(key === 0x47) {
        if(alt.Player.local.vehicle !== null) {
            alt.emitServer("server:car:muteSiren", alt.Player.local.vehicle)
        }
    }
});
